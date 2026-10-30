import { describe, expect, it } from "vitest";
import { chartRecordFilters, filterRecords } from "@/lib/record-filters";
import { rows } from "@/lib/records";

describe("Insights bar record filters", () => {
  it("opens the 2019 bar as the same 48 whip-loss records", () => {
    const filters = chartRecordFilters("2019", "year");
    expect(filters.year).toBe(2019);
    expect(filterRecords(rows, filters)).toHaveLength(48);
  });
  it("matches the combined parliament's 60 events using source labels", () => {
    const records = filterRecords(rows, chartRecordFilters("2017–2019", "parliament"));
    expect(records).toHaveLength(60);
    expect(new Set(records.map((row) => row.parliament))).toEqual(new Set(["2017", "2017-2019"]));
  });
  it("keeps deselected outcomes out of the records", () => {
    const records = filterRecords(rows, chartRecordFilters("2019", "year", { outcomes: ["Withdrawn", "Suspended"] }));
    expect(records).toHaveLength(26);
    expect(records.every((row) => row.whip === "Withdrawn")).toBe(true);
  });
  it("keeps selected source parties and excludes unspecified whip outcomes", () => {
    const records = filterRecords(rows, chartRecordFilters("2019", "year", { parties: ["Lab", "Lab (Co-op)"] }));
    expect(records).toHaveLength(14);
    expect(new Set(records.map((row) => row.before))).toEqual(new Set(["Lab", "Lab (Co-op)"]));
    expect(records.every((row) => !!row.whip)).toBe(true);
  });
  it("clears all chart restrictions with empty filters", () => {
    expect(filterRecords(rows, {})).toHaveLength(rows.length);
  });
});