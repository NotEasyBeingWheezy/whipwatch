import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { useMemo, useState } from "react";
import { rows, formatRecordDate } from "@/lib/records";
import { partyColor, partyDisplayName } from "@/lib/insights";

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

function Index() {
  const [q, setQ] = useState("");
  const [whip, setWhip] = useState("All");
  const [party, setParty] = useState("All");
  const [year, setYear] = useState("All");
  const [dateAsc, setDateAsc] = useState(false);
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
    const dir = dateAsc ? 1 : -1;
    return [...filtered].sort((a, b) => a.date.localeCompare(b.date) * dir);
  }, [q, whip, party, year, dateAsc]);
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
          <select value={party} onChange={(e) => setParty(e.target.value)} className="border border-input bg-card px-3 py-2" aria-label="Filter by party">
            {parties.map((p) => <option key={p} value={p}>{p === "All" ? "All parties" : partyDisplayName(p)}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="border border-input bg-card px-3 py-2" aria-label="Filter by year">
            {years.map((y) => <option key={y} value={y}>{y === "All" ? "All years" : y}</option>)}
          </select>
        </div>
        <p className="font-mono text-xs text-muted-foreground mb-3">{list.length} records · {list.filter((r) => r.older).length} older records</p>
        <div className="border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="hidden bg-secondary text-left font-mono text-xs uppercase text-secondary-foreground sm:table-header-group">
              <tr>
                <th className="px-4 py-3">
                  <button type="button" onClick={() => setDateAsc(!dateAsc)} className="inline-flex items-center gap-1 uppercase hover:text-primary" aria-label="Sort by date">
                    Date
                    <span aria-hidden="true" className="text-primary">{dateAsc ? "▲" : "▼"}</span>
                  </button>
                </th>
                {["Member", "Constituency", "Whip", "Party", "Notes"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}
              </tr>
            </thead>
            <tbody className="block sm:table-row-group">
              {list.map((r, i) => (
                <tr key={i} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 border-t border-border px-4 py-3 align-top first:border-t-0 hover:bg-muted sm:table-row sm:first:border-t">
                  <td className="order-2 block font-mono text-xs text-muted-foreground sm:order-none sm:table-cell sm:whitespace-nowrap sm:px-4 sm:py-3 sm:text-foreground">{formatRecordDate(r)}</td>
                  <td className="order-1 col-span-2 block font-semibold sm:order-none sm:table-cell sm:px-4 sm:py-3">
                    {r.member}
                    {r.older && <span className="mt-2 block w-fit whitespace-nowrap border border-border bg-muted px-2 py-0.5 font-mono text-xs font-normal text-muted-foreground" title="From the provisional ‘Needs some work’ section of the spreadsheet">Older record</span>}
                  </td>
                  <td className="order-4 col-span-2 block text-muted-foreground sm:order-none sm:table-cell sm:px-4 sm:py-3">{r.constituency}</td>
                  <td className="order-3 block text-right sm:order-none sm:table-cell sm:px-4 sm:py-3 sm:text-left">
                    <span className={`px-2 py-0.5 font-mono text-xs uppercase ${r.whip === "Resigned" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}>{r.whip || "—"}</span>
                  </td>
                  <td className="order-5 col-span-2 block sm:order-none sm:table-cell sm:whitespace-nowrap sm:px-4 sm:py-3">
                    <span className="inline-flex items-center gap-2">
                      <span aria-hidden="true" className="inline-block h-2.5 w-2.5 shrink-0" style={{ backgroundColor: partyColor(r.before) }} />
                      {partyDisplayName(r.before)}
                    </span>
                    <span className="text-muted-foreground"> → {r.after === "-" ? "—" : partyDisplayName(r.after)}</span>
                  </td>
                  <td className="order-6 col-span-2 block text-muted-foreground sm:order-none sm:table-cell sm:max-w-sm sm:px-4 sm:py-3">{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-border px-4 py-3 sm:hidden">
            <button type="button" onClick={() => setDateAsc(!dateAsc)} className="inline-flex items-center gap-1 font-mono text-xs uppercase text-muted-foreground hover:text-primary" aria-label="Sort by date">
              Sort by date
              <span aria-hidden="true" className="text-primary">{dateAsc ? "▲" : "▼"}</span>
            </button>
          </div>
        </div>
        <p className="mt-6 font-mono text-xs text-muted-foreground">Source: House of Commons Library spreadsheet SN02537, updated 21/10/2026. Older records: DATA+ section marked “Needs some work”; provisional and potentially incomplete. A dash indicates the whip outcome was not specified.</p>
      </section>
    </main>
  );
}
