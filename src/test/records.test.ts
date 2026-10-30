import { describe, expect, it } from "vitest";
import currentRecords from "@/data/changes.json";
import { rows, formatRecordDate } from "@/lib/records";

describe("Historical records", () => {
  it("classifies Scott Benton's 5 April 2023 whip loss as Withdrawn while retaining the source label in its notes", () => {
    const benton = currentRecords.find((row) => row.member === "Scott Benton" && row.date === "2023-04-05");
    expect(benton?.whip).toBe("Withdrawn");
  });
  it("includes the ten additional source entries, going back to John Wason in 1902", () => {
    expect(rows).toHaveLength(currentRecords.length + 10);
    expect(rows.at(-1)).toMatchObject({ member: "John Wason", date: "1902-11-01" });
    expect(rows.filter((row) => row.member === "Gerry Fitt")).toHaveLength(1);
  });

  it("marks every historical source entry as older, leaving the main list unmarked", () => {
    expect(rows.filter((row) => row.older)).toHaveLength(10);
    expect(rows.filter((row) => row.date < "1979-01-01").every((row) => row.older === true)).toBe(true);
    expect(rows.filter((row) => row.date >= "1979-01-01").every((row) => !row.older)).toBe(true);
  });

  it("preserves month-only dates and does not infer missing whip outcomes", () => {
    const oldest = rows.at(-1);
    if (!oldest) throw new Error("Missing oldest record");
    expect(formatRecordDate(oldest)).toBe("Nov 1902");
    expect(rows.filter((row) => row.older).every((row) => row.whip === "")).toBe(true);
    expect(rows.find((row) => row.member === "Dick Taverne #")?.date).toBe("1972-10-01");
  });

  it("orders the combined records newest first", () => {
    expect(rows.map((row) => row.date)).toEqual(rows.map((row) => row.date).sort().reverse());
  });
});

describe("Source links", () => {
  it("pairs a Parliament career source with news evidence for each of the ten most recent entries", () => {
    for (const row of rows.slice(0, 10)) {
      const sources = row.sources ?? [];
      expect(sources.filter((source) => /^https:\/\/members\.parliament\.uk\/member\/\d+\/career$/.test(source.url))).toHaveLength(1);
      expect(sources.some((source) => !source.url.startsWith("https://members.parliament.uk/"))).toBe(true);
    }
  });

  it("gives the ten most recent records at least one news source link", () => {
    const recent = rows.slice(0, 10);
    expect(recent).toHaveLength(10);
    expect(recent.every((row) => (row.sources?.length ?? 0) > 0)).toBe(true);
    expect(recent.flatMap((row) => row.sources ?? []).every((s) => s.label.length > 0 && s.url.startsWith("https://"))).toBe(true);
  });

  it("provides checked citations for all 246 records, including the ten historical entries", () => {
    expect(rows).toHaveLength(246);
    for (const row of rows) {
      const sources = row.sources ?? [];
      expect(sources.length, `${row.member} ${row.date}`).toBeGreaterThan(0);
      expect(new Set(sources.map((source) => source.url)).size).toBe(sources.length);
      for (const source of sources) {
        expect(new URL(source.url).protocol).toBe("https:");
      }
    }
  });
});