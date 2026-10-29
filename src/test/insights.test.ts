import { describe, expect, it } from "vitest";
import { buildInsights } from "@/lib/insights";
import { rows, type RecordRow } from "@/lib/records";

function record(whip: string, before: string, after: string, date: string): RecordRow {
  return { whip, before, after, date, parliament: "2017-2019", member: "Example", constituency: "Example", notes: "" };
}

describe("WhipWatch insights", () => {
  it("counts explicit whip losses by year, including zero-event years", () => {
    const result = buildInsights([record("Withdrawn", "Con", "Ind", "2017-01-01"), record("Resigned", "Lab", "Ind", "2019-01-01"), record("Suspended", "Lab", "Ind", "2019-02-01")]);
    expect(result.years.map(({ label, total }) => ({ label, total }))).toEqual([{ label: "2017", total: 1 }, { label: "2018", total: 0 }, { label: "2019", total: 2 }]);
    expect(result.parliaments[0]).toMatchObject({ label: "2017-2019", total: 3, withdrawn: 1, resigned: 1, suspended: 1 });
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