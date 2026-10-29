import { describe, expect, it } from "vitest";
import { buildInsights, parliamentGovernment } from "@/lib/insights";
import { rows, type RecordRow } from "@/lib/records";
import { chartDate, governmentPeriods } from "@/lib/government-periods";

function record(whip: string, before: string, after: string, date: string): RecordRow {
  return { whip, before, after, date, parliament: "2017-2019", member: "Example", constituency: "Example", notes: "" };
}

describe("WhipWatch insights", () => {
  it("groups annual party lines by before-party and fills missing years with zero", () => {
    const result = buildInsights([record("Withdrawn", "Con", "Lab", "2017-01-01"), record("Resigned", "Lab", "Con", "2019-01-01"), record("", "Con", "Ind", "1902-11-01")]);
    const con = result.partySeries.find((party) => party.source === "Con");
    const lab = result.partySeries.find((party) => party.source === "Lab");
    if (!con || !lab) throw new Error("Missing party series");
    expect(result.partyYears).toEqual([
      { year: 2017.5, label: "2017", [con.key]: 1, [lab.key]: 0 },
      { year: 2018.5, label: "2018", [con.key]: 0, [lab.key]: 0 },
      { year: 2019.5, label: "2019", [con.key]: 0, [lab.key]: 1 },
    ]);
  });
  it("reconciles each party line with its recorded total", () => {
    const result = buildInsights();
    for (const party of result.partySeries) {
      expect(result.partyYears.reduce((sum, point) => sum + Number(point[party.key as keyof typeof point]), 0)).toBe(party.total);
    }
  });
  it("uses government appointment dates and keeps the 2010–2015 coalition separate", () => {
    expect(governmentPeriods.map(({ start, end }) => [start, end])).toEqual([
      ["1979-05-04", "1997-05-02"], ["1997-05-02", "2010-05-11"],
      ["2010-05-11", "2015-05-08"], ["2015-05-08", "2024-07-05"], ["2024-07-05", null],
    ]);
    expect(governmentPeriods[2]?.label).toBe("Conservative–Lib Dem coalition");
    expect(chartDate("2024-07-05")).toBeCloseTo(2024 + 186 / 366);
  });
  it("counts explicit whip losses by year, including zero-event years", () => {
    const result = buildInsights([record("Withdrawn", "Con", "Ind", "2017-01-01"), record("Resigned", "Lab", "Ind", "2019-01-01"), record("Suspended", "Lab", "Ind", "2019-02-01")]);
    expect(result.years.map(({ label, total }) => ({ label, total }))).toEqual([{ label: "2017", total: 1 }, { label: "2018", total: 0 }, { label: "2019", total: 2 }]);
    expect(result.parliaments[0]).toMatchObject({ label: "2017–2019", total: 3, withdrawn: 1, resigned: 1, suspended: 1 });
  });
  it("assigns totals to the party before the event, not the destination", () => {
    const result = buildInsights([record("Resigned", "Lab", "Con", "2019-01-01")]);
    expect(result.parties).toEqual([{ label: "Labour", total: 1, withdrawn: 0, resigned: 1, suspended: 0, unspecified: 0 }]);
  });
  it("keeps unknown historical outcomes out of whip-loss charts and totals", () => {
    const result = buildInsights([record("", "Liberal Unionist", "Ind Liberal", "1902-11-01")]);
    expect(result.totals).toMatchObject({ total: 0, unspecified: 1 });
    expect(result.years).toEqual([]);
    expect(result.parliaments).toEqual([]);
    expect(result.parties[0]).toMatchObject({ total: 0, unspecified: 1 });
  });
  it("reconciles real party and timeline totals with explicit source outcomes", () => {
    const result = buildInsights();
    expect(result.totals).toEqual({ withdrawn: 135, resigned: 98, suspended: 1, total: 234, unspecified: 12 });
    expect(result.years.find((year) => year.label === "2019")).toMatchObject({ total: 48, withdrawn: 26, resigned: 22 });
    const expected = rows.filter((r) => ["Withdrawn", "Resigned", "Suspended"].includes(r.whip)).length;
    expect(result.totals.total).toBe(expected);
    expect(result.parties.reduce((n, r) => n + r.total, 0)).toBe(expected);
    expect(result.years.reduce((n, r) => n + r.total, 0)).toBe(expected);
    expect(result.parliaments.reduce((n, r) => n + r.total, 0)).toBe(expected);
    expect(result.totals.unspecified).toBe(rows.filter((r) => !["Withdrawn", "Resigned", "Suspended"].includes(r.whip)).length);
  });
});
describe("party counts by parliament", () => {
  it("labels the completed 2019 parliament with its full period without changing its total", () => {
    const data = buildInsights();
    expect(data.parliaments.find((group) => group.label === "2019–2024")?.total).toBe(44);
    expect(data.parliaments.some((group) => group.label === "2019")).toBe(false);
    expect(data.partyParliaments.find((point) => point.label === "2019–2024")?.government).toBe("government-conservative");
  });
  it("labels the current parliament as ongoing without changing its total or Labour shading", () => {
    const data = buildInsights();
    expect(data.parliaments.find((group) => group.label === "2024–present")?.total).toBe(30);
    expect(data.parliaments.some((group) => group.label === "2024")).toBe(false);
    expect(data.partyParliaments.find((point) => point.label === "2024–present")?.government).toBe("government-labour");
  });
  it("combines the 2017 and 2017-2019 entries into one parliament with 60 events", () => {
    const data = buildInsights();
    const groups = data.parliaments.filter((group) => group.label.startsWith("2017"));
    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({ label: "2017–2019", total: 60 });
    const points = data.partyParliaments.filter((point) => point.label.startsWith("2017"));
    expect(points).toHaveLength(1);
    const point = points[0];
    if (!point) throw new Error("Missing combined parliament");
    expect(point.label).toBe("2017–2019");
    expect(data.partySeries.reduce((sum, party) => sum + Number((point as Record<string, unknown>)[party.key] ?? 0), 0)).toBe(60);
    expect(point.government).toBe("government-conservative");
    expect(data.years.find((year) => year.label === "2019")?.total).toBe(48);
  });
  it("match each parliament's whip-loss total", () => {
    const data = buildInsights();
    for (const point of data.partyParliaments) {
      const sum = data.partySeries.reduce((s, p) => s + Number((point as Record<string, unknown>)[p.key] ?? 0), 0);
      expect(sum).toBe(data.parliaments.find((g) => g.label === point.label)?.total);
    }
  });
  it("shades each parliament by the government in office when it began", () => {
    expect(parliamentGovernment("1979-1983")?.token).toBe("government-conservative");
    expect(parliamentGovernment("1997-2001")?.token).toBe("government-labour");
    expect(parliamentGovernment("2010-2015")?.token).toBe("government-coalition");
    expect(parliamentGovernment("2017-2019")?.token).toBe("government-conservative");
    // The 2024 parliament began 4 July, the day before Labour took office, but
    // is shaded Labour as nearly all of it sits under the Labour government.
    expect(parliamentGovernment("2024")?.token).toBe("government-labour");
    const data = buildInsights();
    for (const point of data.partyParliaments) {
      expect(point.government).toBe(parliamentGovernment(point.label)?.token);
    }
  });
});
