import { describe, expect, it } from "vitest";
import currentRecords from "@/data/changes.json";
import { rows, formatRecordDate } from "@/lib/records";

describe("Historical records", () => {
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