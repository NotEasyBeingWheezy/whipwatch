import { rows, type RecordRow } from "@/lib/records";

export const outcomes = ["Withdrawn", "Resigned", "Suspended"] as const;
export type Counts = { withdrawn: number; resigned: number; suspended: number; unspecified: number; total: number };
export type InsightGroup = Counts & { label: string };

const partyNames: Record<string, string> = {
  Lab: "Labour", Con: "Conservative", LD: "Liberal Democrats", SNP: "SNP",
  SDLP: "SDLP", DUP: "DUP", UUP: "UUP", PC: "Plaid Cymru",
};

function emptyCounts(): Counts {
  return { withdrawn: 0, resigned: 0, suspended: 0, unspecified: 0, total: 0 };
}

function addRecord(counts: Counts, row: RecordRow) {
  if (row.whip === "Withdrawn") counts.withdrawn++;
  else if (row.whip === "Resigned") counts.resigned++;
  else if (row.whip === "Suspended") counts.suspended++;
  else { counts.unspecified++; return; }
  counts.total++;
}

export function buildInsights(records: RecordRow[] = rows) {
  const totals = emptyCounts();
  const years = new Map<string, InsightGroup>();
  const parliaments = new Map<string, InsightGroup>();
  const parties = new Map<string, InsightGroup>();
  for (const row of records) {
    addRecord(totals, row);
    const party = row.before || "Unspecified party";
    const partyGroup = parties.get(party) ?? { label: partyNames[party] ?? party, ...emptyCounts() };
    addRecord(partyGroup, row);
    parties.set(party, partyGroup);
    if (!outcomes.some((outcome) => outcome === row.whip)) continue;
    const year = row.date.slice(0, 4);
    if (/^\d{4}$/.test(year)) {
      const group = years.get(year) ?? { label: year, ...emptyCounts() };
      addRecord(group, row);
      years.set(year, group);
    }
    const parliament = row.parliament || "Unspecified";
    const group = parliaments.get(parliament) ?? { label: parliament, ...emptyCounts() };
    addRecord(group, row);
    parliaments.set(parliament, group);
  }
  const yearKeys = [...years.keys()].sort();
  const first = yearKeys.at(0);
  const last = yearKeys.at(-1);
  if (first && last) {
    for (let year = Number(first); year <= Number(last); year++) {
      if (!years.has(String(year))) years.set(String(year), { label: String(year), ...emptyCounts() });
    }
  }
  return {
    totals,
    years: [...years.values()].sort((a, b) => a.label.localeCompare(b.label)),
    parliaments: [...parliaments.values()].sort((a, b) => a.label.localeCompare(b.label)),
    parties: [...parties.values()].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label)),
  };
}