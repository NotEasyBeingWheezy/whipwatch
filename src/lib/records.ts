import currentRecords from "@/data/changes.json";
import olderRecords from "@/data/older-records.json";

export type RecordRow = {
  parliament: string;
  date: string;
  member: string;
  whip: string;
  constituency: string;
  before: string;
  after: string;
  notes: string;
  older?: boolean;
  datePrecision?: string;
};

export const rows: RecordRow[] = [...currentRecords, ...olderRecords].sort((a, b) => b.date.localeCompare(a.date));

export function formatRecordDate(row: RecordRow) {
  if (!row.date) return "—";
  return new Date(row.date).toLocaleDateString("en-GB", {
    ...(row.datePrecision === "month" ? {} : { day: "numeric" as const }),
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}