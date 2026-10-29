import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { useMemo, useState } from "react";
import { rows, formatRecordDate } from "@/lib/records";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WhipWatch — UK whip records since 1902" },
      { name: "description", content: "Explore UK MPs' whip suspensions, resignations and changes of allegiance, including provisional historical records back to 1902." },
      { property: "og:title", content: "WhipWatch — UK whip suspensions tracker" },
      { property: "og:description", content: "UK whip withdrawals and resignations since 1979, with provisional historical allegiance records back to 1902." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type SortKey = "date" | "member" | "party";

function Index() {
  const [q, setQ] = useState("");
  const [whip, setWhip] = useState("All");
  const [party, setParty] = useState("All");
  const [year, setYear] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);
  const parties = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.before).filter(Boolean))).sort()], []);
  const years = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.date.slice(0, 4)))).sort().reverse()], []);
  const list = useMemo(() => {
    const filtered = rows.filter(
      (r) =>
        (whip === "All" || r.whip === whip) &&
        (party === "All" || r.before === party) &&
        (year === "All" || r.date.slice(0, 4) === year) &&
        (q === "" || `${r.member} ${r.constituency} ${r.notes}`.toLowerCase().includes(q.toLowerCase())),
    );
    const dir = sortAsc ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "date") return a.date.localeCompare(b.date) * dir;
      if (sortKey === "member") return a.member.localeCompare(b.member) * dir;
      return a.before.localeCompare(b.before) * dir;
    });
  }, [q, whip, party, year, sortKey, sortAsc]);
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key !== "date");
    }
  };
  const sortHeader = (label: string, key: SortKey) => (
    <th key={key} className="px-4 py-3">
      <button type="button" onClick={() => toggleSort(key)} className="inline-flex items-center gap-1 uppercase hover:text-primary" aria-label={`Sort by ${label}`}>
        {label}
        <span aria-hidden="true" className={sortKey === key ? "text-primary" : "text-muted-foreground/50"}>
          {sortKey === key ? (sortAsc ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
  const withdrawn = rows.filter((r) => r.whip === "Withdrawn").length;
  const resigned = rows.filter((r) => r.whip === "Resigned").length;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b-4 border-primary">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-6">
            <SiteNav />
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">House of Commons · records since 1902</p>
          <h1 className="mt-3 font-display text-6xl md:text-8xl leading-none">WhipWatch</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Every MP who had the party whip withdrawn, suspended or who resigned it.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-px bg-border max-w-xl">
            {[["Total", rows.length], ["Withdrawn", withdrawn], ["Resigned", resigned]].map(([l, n]) => (
              <div key={l} className="bg-card p-4">
                <div className="font-display text-4xl text-primary">{n}</div>
                <div className="font-mono text-xs uppercase text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-wrap gap-3 mb-6">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search MP, seat or notes…"
            className="flex-1 min-w-60 border border-input bg-card px-4 py-2 outline-none focus:border-primary" />
          <select value={whip} onChange={(e) => setWhip(e.target.value)} className="border border-input bg-card px-3 py-2">
            {["All", "Withdrawn", "Resigned", "Suspended"].map((w) => <option key={w}>{w}</option>)}
          </select>
          <select value={party} onChange={(e) => setParty(e.target.value)} className="border border-input bg-card px-3 py-2">
            {parties.map((p) => <option key={p}>{p}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="border border-input bg-card px-3 py-2" aria-label="Filter by year">
            {years.map((y) => <option key={y} value={y}>{y === "All" ? "All years" : y}</option>)}
          </select>
        </div>
        <p className="font-mono text-xs text-muted-foreground mb-3">{list.length} records · {list.filter((r) => r.older).length} older records</p>
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left font-mono text-xs uppercase text-secondary-foreground">
              <tr>{["Date", "Member", "Constituency", "Whip", "Party", "Notes"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody>
              {list.map((r, i) => (
                <tr key={i} className="border-t border-border align-top hover:bg-muted">
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{formatRecordDate(r)}</td>
                  <td className="px-4 py-3 font-semibold">
                    {r.member}
                    {r.older && <span className="mt-2 block w-fit whitespace-nowrap border border-border bg-muted px-2 py-0.5 font-mono text-xs font-normal text-muted-foreground" title="From the provisional ‘Needs some work’ section of the spreadsheet">Older record</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.constituency}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 font-mono text-xs uppercase ${r.whip === "Resigned" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}>{r.whip || "—"}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.before} → {r.after}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-sm">{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 font-mono text-xs text-muted-foreground">Source: House of Commons Library spreadsheet SN02537, updated 21/10/2026. Older records: DATA+ section marked “Needs some work”; provisional and potentially incomplete. A dash indicates the whip outcome was not specified.</p>
      </section>
    </main>
  );
}
