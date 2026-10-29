import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { CalendarDays, Landmark, Table2 } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { buildInsights, type InsightGroup } from "@/lib/insights";

export const Route = createFileRoute("/insights")({
  head: () => ({ meta: [
    { title: "Insights — WhipWatch yearly trends and party totals" },
    { name: "description", content: "Compare recorded UK whip losses by year, parliament and party, with separate totals for withdrawals, resignations and suspensions." },
    { property: "og:title", content: "Insights — WhipWatch yearly trends and party totals" },
    { property: "og:description", content: "Explore the patterns behind UK whip losses, with yearly and parliamentary charts and totals by the party held before each event." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Insights,
});

const data = buildInsights();
const config = {
  withdrawn: { label: "Withdrawn", color: "var(--primary)" },
  resigned: { label: "Resigned", color: "var(--chart-2)" },
  suspended: { label: "Suspended", color: "var(--chart-4)" },
} satisfies ChartConfig;
const series = ["withdrawn", "resigned", "suspended"] as const;

function Legend() {
  return <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
    <span className="flex items-center gap-2"><i className="size-2.5 bg-primary" />Withdrawn</span>
    <span className="flex items-center gap-2"><i className="size-2.5 bg-chart-2" />Resigned</span>
    <span className="flex items-center gap-2"><i className="size-2.5 bg-chart-4" />Suspended</span>
  </div>;
}

function CountsTable({ groups, heading, unknown = false }: { groups: InsightGroup[]; heading: string; unknown?: boolean }) {
  return <div className="overflow-x-auto border border-border bg-card">
    <table className="w-full text-sm tabular-nums">
      <caption className="sr-only">Recorded whip losses by {heading.toLowerCase()}</caption>
      <thead className="bg-secondary text-secondary-foreground font-mono text-xs uppercase">
        <tr><th scope="col" className="px-4 py-3 text-left">{heading}</th>{["Withdrawn", "Resigned", "Suspended", "Whip losses", ...(unknown ? ["Unspecified"] : [])].map((label) => <th scope="col" key={label} className="px-4 py-3 text-right whitespace-nowrap">{label}</th>)}</tr>
      </thead>
      <tbody>{groups.map((group) => <tr key={group.label} className="border-t border-border hover:bg-muted">
        <th scope="row" className="px-4 py-3 text-left font-medium whitespace-nowrap">{group.label}</th>
        {[group.withdrawn, group.resigned, group.suspended, group.total, ...(unknown ? [group.unspecified] : [])].map((value, i) => <td key={i} className={`px-4 py-3 text-right font-mono ${i === 3 ? "font-semibold text-primary" : "text-muted-foreground"}`}>{value}</td>)}
      </tr>)}</tbody>
      <tfoot className="border-t-2 border-border font-semibold"><tr><th scope="row" className="px-4 py-3 text-left">Total</th>{["withdrawn", "resigned", "suspended", "total", ...(unknown ? ["unspecified"] : [])].map((key) => <td key={key} className="px-4 py-3 text-right font-mono">{groups.reduce((sum, group) => sum + group[key as keyof Omit<InsightGroup, "label">], 0)}</td>)}</tr></tfoot>
    </table>
  </div>;
}

function Insights() {
  const [period, setPeriod] = useState<"year" | "parliament">("year");
  const [showTable, setShowTable] = useState(false);
  const timeline = period === "year" ? data.years : data.parliaments;
  const peak = data.years.reduce<InsightGroup | undefined>((best, group) => !best || group.total > best.total ? group : best, undefined);
  return <main className="min-h-screen bg-background text-foreground">
    <header className="border-b-4 border-primary">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6"><SiteNav /></div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">WhipWatch · Insights</p>
        <h1 className="mt-3 font-display text-5xl leading-none md:text-7xl">Whip losses in numbers</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">Recorded withdrawals, resignations and suspensions, {data.years.at(0)?.label}–{data.years.at(-1)?.label}. Counts are events, not unique MPs or current suspension status.</p>
        <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[["Recorded whip losses", data.totals.total], ["Withdrawn", data.totals.withdrawn], ["Resigned", data.totals.resigned], ["Suspended", data.totals.suspended]].map(([label, count]) => <div key={label} className="border-l-2 border-border pl-4"><dd className="font-display text-4xl text-primary">{count}</dd><dt className="mt-1 font-mono text-xs uppercase text-muted-foreground">{label}</dt></div>)}
        </dl>
      </div>
    </header>
    <section className="mx-auto max-w-6xl px-6 py-10" aria-labelledby="timeline-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 id="timeline-title" className="font-display text-3xl">Whip losses over time</h2><p className="mt-2 text-sm text-muted-foreground">{peak?.label} has the most recorded events: <strong className="text-foreground">{peak?.total}</strong>. Coverage may be incomplete; {data.years.at(-1)?.label} runs to 20 October.</p></div>
        <div className="flex gap-1" role="group" aria-label="Timeline grouping">
          <Button variant={period === "year" ? "default" : "outline"} onClick={() => setPeriod("year")} aria-pressed={period === "year"}><CalendarDays />By year</Button>
          <Button variant={period === "parliament" ? "default" : "outline"} onClick={() => setPeriod("parliament")} aria-pressed={period === "parliament"}><Landmark />By parliament</Button>
        </div>
      </div>
      <div className="mt-6"><Legend /></div>
      <div className="mt-5 overflow-x-auto" role="region" aria-label={`Whip losses by ${period} chart`} tabIndex={0}>
        <ChartContainer config={config} className={`h-80 w-full aspect-auto ${period === "year" ? "min-w-[900px]" : "min-w-[700px]"}`}>
          <BarChart data={timeline} accessibilityLayer margin={{ top: 16, right: 12, left: 0, bottom: period === "parliament" ? 45 : 15 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} interval={period === "year" ? 3 : 0} angle={period === "parliament" ? -35 : 0} textAnchor={period === "parliament" ? "end" : "middle"} tickMargin={10} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent labelFormatter={(_, payload) => payload[0]?.payload.label} />} />
            {series.map((key) => <Bar key={key} dataKey={key} stackId="events" fill={`var(--color-${key})`} isAnimationActive={false} />)}
          </BarChart>
        </ChartContainer>
      </div>
      <Button className="mt-4" variant="outline" onClick={() => setShowTable(!showTable)} aria-expanded={showTable} aria-controls="timeline-data"><Table2 />{showTable ? "Hide figures" : "View figures"}</Button>
      {showTable && <div id="timeline-data" className="mt-4"><CountsTable groups={timeline} heading={period === "year" ? "Year" : "Parliament"} /></div>}
    </section>
    <section className="border-t border-border" aria-labelledby="party-title">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h2 id="party-title" className="font-display text-3xl">Totals by party</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Attributed to the party before each event. Source categories are kept separate, including Labour and Labour (Co-op). Unspecified outcomes are not counted as whip losses.</p>
        <div className="mt-6"><Legend /></div>
        <div className="mt-5 overflow-x-auto" role="region" aria-label="Whip losses by party chart" tabIndex={0}>
          <ChartContainer config={config} className="h-[520px] w-full min-w-[600px] aspect-auto">
            <BarChart data={data.parties.filter((party) => party.total > 0)} layout="vertical" accessibilityLayer margin={{ left: 0, right: 24, top: 8, bottom: 8 }}>
              <CartesianGrid horizontal={false} stroke="var(--border)" />
              <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
              <YAxis dataKey="label" type="category" width={130} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent labelFormatter={(_, payload) => payload[0]?.payload.label} />} />
              {series.map((key) => <Bar key={key} dataKey={key} stackId="events" fill={`var(--color-${key})`} isAnimationActive={false} />)}
            </BarChart>
          </ChartContainer>
        </div>
        <div className="mt-6"><CountsTable groups={data.parties} heading="Party before event" unknown /></div>
        <p className="mt-4 text-sm text-muted-foreground">{data.totals.unspecified} records have unspecified whip outcomes, including all 10 provisional older records from 1902–1972. They appear only in the Unspecified column, not in the charts or whip-loss totals.</p>
      </div>
    </section>
    <footer className="border-t border-border"><p className="mx-auto max-w-6xl px-6 py-6 font-mono text-xs text-muted-foreground">Source: House of Commons Library spreadsheet SN02537 · Updated 21 October 2026. Parliamentary and historical coverage may be incomplete.</p></footer>
  </main>;
}