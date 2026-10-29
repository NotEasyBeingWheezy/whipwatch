import { rows, type RecordRow } from "@/lib/records";

export const outcomes = ["Withdrawn", "Resigned", "Suspended"] as const;
export type Counts = { withdrawn: number; resigned: number; suspended: number; unspecified: number; total: number };
export type InsightGroup = Counts & { label: string };

const partyNames: Record<string, string> = {
  Lab: "Labour", Con: "Conservative", LD: "Liberal Democrats", "Lib Dem": "Liberal Democrats", SNP: "SNP",
  SDLP: "SDLP", DUP: "DUP", UUP: "UUP", PC: "Plaid Cymru",
  "Lab (Co-op)": "Labour (Co-op)", CUK: "Change UK", "Reform UK": "Reform UK",
  Liberal: "Liberal", "Liberal Unionist": "Liberal Unionist", SDP: "SDP", SF: "Sinn Féin",
  Ind: "Independent", "Deputy Speaker": "Deputy Speaker",
};

export function partyDisplayName(source: string): string {
  return partyNames[source] ?? source;
}

export const partyColorTokens: Record<string, string> = {
  Lab: "party-labour", Con: "party-conservative", LD: "party-libdem", "Lib Dem": "party-libdem", SNP: "party-snp",
  CUK: "party-cuk", "Lab (Co-op)": "party-coop", UUP: "party-uup", DUP: "party-dup",
  "Reform UK": "party-reform", "Deputy Speaker": "party-speaker", Ind: "party-independent",
  PC: "party-plaid", SDLP: "party-sdlp", SF: "party-sf",
};

export function partyColor(source: string): string {
  return `var(--${partyColorTokens[source] ?? "chart-5"})`;
}

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
  const annualParties = new Map<string, Map<string, number>>();
  const parliamentParties = new Map<string, Map<string, number>>();
  for (const row of records) {
    addRecord(totals, row);
    const party = row.before || "Unspecified party";
    const partyGroup = parties.get(party) ?? { label: partyNames[party] ?? party, ...emptyCounts() };
    addRecord(partyGroup, row);
    parties.set(party, partyGroup);
    if (!outcomes.some((outcome) => outcome === row.whip)) continue;
    const year = row.date.slice(0, 4);
    if (/^\d{4}$/.test(year)) {
      const partyCounts = annualParties.get(year) ?? new Map<string, number>();
      partyCounts.set(party, (partyCounts.get(party) ?? 0) + 1);
      annualParties.set(year, partyCounts);
      const group = years.get(year) ?? { label: year, ...emptyCounts() };
      addRecord(group, row);
      years.set(year, group);
    }
    const parliament = row.parliament || "Unspecified";
    const group = parliaments.get(parliament) ?? { label: parliament, ...emptyCounts() };
    addRecord(group, row);
    parliaments.set(parliament, group);
    const pCounts = parliamentParties.get(parliament) ?? new Map<string, number>();
    pCounts.set(party, (pCounts.get(party) ?? 0) + 1);
    parliamentParties.set(parliament, pCounts);
  }
  const yearKeys = [...years.keys()].sort();
  const first = yearKeys.at(0);
  const last = yearKeys.at(-1);
  if (first && last) {
    for (let year = Number(first); year <= Number(last); year++) {
      if (!years.has(String(year))) years.set(String(year), { label: String(year), ...emptyCounts() });
    }
  }
  const partySeries = [...parties.entries()]
    .filter(([, group]) => group.total > 0)
    .sort((a, b) => b[1].total - a[1].total || a[0].localeCompare(b[0]))
    .map(([source, group], i) => ({ key: `party${i}`, source, label: group.label, total: group.total }));
  const partyYears = [...years.keys()].sort().map((year) => ({
    year: Number(year) + 0.5,
    label: year,
    ...Object.fromEntries(partySeries.map((party) => [party.key, annualParties.get(year)?.get(party.source) ?? 0])),
  }));
  const partyParliaments = [...parliaments.keys()].sort().map((parliament) => ({
    label: parliament,
    ...Object.fromEntries(partySeries.map((party) => [party.key, parliamentParties.get(parliament)?.get(party.source) ?? 0])),
  }));
  return {
    partySeries,
    partyParliaments,
    partyYears,
    totals,
    years: [...years.values()].sort((a, b) => a.label.localeCompare(b.label)),
    parliaments: [...parliaments.values()].sort((a, b) => a.label.localeCompare(b.label)),
    parties: [...parties.values()].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label)),
  };
}