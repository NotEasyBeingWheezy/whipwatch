import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import raw from "@/data/changes.json";

type Row = { parliament: string; date: string; member: string; whip: string; constituency: string; before: string; after: string; notes: string };
const rows = (raw as Row[]).slice().reverse();

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WhipWatch — UK MPs' whip suspensions & resignations since 1979" },
      { name: "description", content: "Track every MP who lost or resigned the party whip in the House of Commons since 1979." },
      { property: "og:title", content: "WhipWatch — UK whip suspensions tracker" },
      { property: "og:description", content: "Every whip withdrawal and resignation in the Commons since 1979." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const fmt = (d: string) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

function Index() {
  const [q, setQ] = useState("");
  const [whip, setWhip] = useState("All");
  const [party, setParty] = useState("All");
  const parties = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.before).filter(Boolean))).sort()], []);
  const list = rows.filter(
    (r) =>
      (whip === "All" || r.whip === whip) &&
      (party === "All" || r.before === party) &&
      (q === "" || `${r.member} ${r.constituency} ${r.notes}`.toLowerCase().includes(q.toLowerCase())),
  );
  const withdrawn = rows.filter((r) => r.whip === "Withdrawn").length;
  const resigned = rows.filter((r) => r.whip === "Resigned").length;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b-4 border-primary">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <nav className="mb-6 flex gap-6 font-mono text-xs uppercase tracking-widest">
            <span className="border-b-2 border-primary pb-1 text-primary">Records</span>
            <Link to="/about" className="pb-1 text-muted-foreground transition-colors hover:text-foreground">About</Link>
          </nav>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">House of Commons · since 1979</p>
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
        </div>
        <p className="font-mono text-xs text-muted-foreground mb-3">{list.length} records</p>
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left font-mono text-xs uppercase text-secondary-foreground">
              <tr>{["Date", "Member", "Constituency", "Whip", "Party", "Notes"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody>
              {list.map((r, i) => (
                <tr key={i} className="border-t border-border align-top hover:bg-muted">
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{fmt(r.date)}</td>
                  <td className="px-4 py-3 font-semibold">{r.member}</td>
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
        <p className="mt-6 font-mono text-xs text-muted-foreground">Source: House of Commons Library briefing SN02537, updated 21/10/2026.</p>
      </section>
    </main>
  );
}
