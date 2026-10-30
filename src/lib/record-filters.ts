import { outcomes, parliamentDisplayName } from "@/lib/insights";
import { type RecordRow } from "@/lib/records";

export type RecordFilters = {
  q?: string;
  whip?: string;
  party?: string;
  year?: number;
  parliament?: string;
  sort?: string;
};

export function chartRecordFilters(label: string, group: "year" | "parliament", selection: { outcomes?: string[]; parties?: string[] } = {}): RecordFilters {
  return {
    ...(group === "year" ? { year: Number(label) } : { parliament: label }),
    whip: (selection.outcomes ?? [...outcomes]).join(","),
    ...(selection.parties ? { party: selection.parties.join(",") } : {}),
  };
}

export function filterRecords(records: RecordRow[], filters: RecordFilters): RecordRow[] {
  return records.filter((row) =>
    (!filters.whip || filters.whip.split(",").includes(row.whip)) &&
    (!filters.party || filters.party.split(",").includes(row.before)) &&
    (!filters.year || row.date.slice(0, 4) === String(filters.year)) &&
    (!filters.parliament || parliamentDisplayName(row.parliament) === filters.parliament) &&
    (!filters.q || `${row.member} ${row.constituency} ${row.notes}`.toLowerCase().includes(filters.q.toLowerCase()))
  ).sort((a, b) => a.date.localeCompare(b.date) * (filters.sort === "oldest" ? 1 : -1));
}