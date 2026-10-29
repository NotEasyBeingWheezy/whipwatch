import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { CalendarDays, Landmark, Table2, Users } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { buildInsights, type InsightGroup } from "@/lib/insights";
import { PartyTimeline, partyChartConfig } from "@/components/party-timeline";

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

function toggleKey(list: string[], key: string) {
  return list.includes(key) ? list.filter((item) => item !== key) : [...list, key];
}

function Legend({ hidden, onToggle }: { hidden: string[]; onToggle: (key: string) => void }) {
  return <div className="flex flex-wrap gap-2" role="group" aria-label="Outcome series">
    {series.map((key) => <Button key={key} variant="ghost" size="sm"
      className={hidden.includes(key) ? "opacity-40" : ""}
      aria-pressed={!hidden.includes(key)}
      onClick={() => onToggle(key)}>
      <svg width="12" height="12" aria-hidden="true"><rect width="12" height="12" fill={config[key].color} /></svg>
      {config[key].label}
    </Button>)}
  </div>;
}

function PartyLegend({ hidden, onToggle }: { hidden: string[]; onToggle: (key: string) => void }) {
  return <div className="flex flex-wrap gap-2" role="group" aria-label="Party series">
    {data.partySeries.map((party) => <Button key={party.key} variant="ghost" size="sm"
      className={hidden.includes(party.key) ? "opacity-40" : ""}
      aria-pressed={!hidden.includes(party.key)}
      onClick={() => onToggle(party.key)}>
      <svg width="12" height="12" aria-hidden="true"><rect width="12" height="12" fill={partyChartConfig[party.key]?.color} /></svg>
      {party.label}
    </Button>)}
  </div>;
}

function PartyYearTable() {
  const yearTotal = (point: (typeof data.partyYears)[number]) => data.partySeries.reduce((sum, party) => sum + Number(point[party.key as keyof typeof point] ?? 0), 0);
  return <div className="overflow-x-auto border border-border bg-card">
    <table className="w-full text-sm tabular-nums">
      <caption className="sr-only">Recorded whip losses by year and party</caption>
      <thead className="bg-secondary text-secondary-foreground font-mono text-xs uppercase">
        <tr><th scope="col" className="px-4 py-3 text-left">Year</th>
          {data.partySeries.map((party) => <th scope="col" key={party.key} className="px-4 py-3 text-right whitespace-nowrap">{party.label}</th>)}
          <th scope="col" className="px-4 py-3 text-right whitespace-nowrap">Whip losses</th></tr>
      </thead>
      <tbody>{data.partyYears.map((point) => <tr key={point.label} className="border-t border-border hover:bg-muted">
        <th scope="row" className="px-4 py-3 text-left font-medium whitespace-nowrap">{point.label}</th>
        {data.partySeries.map((party) => <td key={party.key} className="px-4 py-3 text-right font-mono text-muted-foreground">{Number(point[party.key as keyof typeof point] ?? 0)}</td>)}
        <td className="px-4 py-3 text-right font-mono font-semibold text-primary">{yearTotal(point)}</td>
      </tr>)}</tbody>
      <tfoot className="border-t-2 border-border font-semibold"><tr>
        <th scope="row" className="px-4 py-3 text-left">Total</th>
        {data.partySeries.map((party) => <td key={party.key} className="px-4 py-3 text-right font-mono">{party.total}</td>)}
        <td className="px-4 py-3 text-right font-mono">{data.totals.total}</td>
      </tr></tfoot>
    </table>
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
  const [period, setPeriod] = useState<"year" | "parliament" | "party">("year");
  const [showTable, setShowTable] = useState(false);
  const [hiddenOutcomes, setHiddenOutcomes] = useState<string[]>([]);
  const [hiddenParties, setHiddenParties] = useState<string[]>([]);
  const timeline = period === "parliament" ? data.parliaments : data.years;
  const peak = data.years.reduce<InsightGroup | undefined>((best, group) => !best || group.total > best.total ? group : best, undefined);
  return <main className="min-h-screen bg-background text-foreground">
    <header className="border-b-4 border-primary">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6"><SiteNav /></div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Insights · Whip losses in numbers</p>
        <h1 className="mt-3 font-display text-6xl leading-none md:text-8xl">WhipWatch</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">Recorded withdrawals, resignations and suspensions, 1979–2026. Counts are events, not unique MPs or current suspension status.</p>
        <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl">
          {[["Total", data.totals.total], ["Withdrawn", data.totals.withdrawn], ["Resigned", data.totals.resigned], ["Suspended", data.totals.suspended]].map(([label, count]) => <div key={label} className="border-l-2 border-border pl-4"><dd className="font-display text-4xl text-primary">{count}</dd><dt className="mt-1 font-mono text-xs uppercase text-muted-foreground">{label}</dt></div>)}
        </dl>
      </div>
    </header>
    <section className="mx-auto max-w-6xl px-6 py-10" aria-labelledby="timeline-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 id="timeline-title" className="font-display text-3xl">Whip losses over time</h2><p className="mt-2 text-sm text-muted-foreground">{peak?.label} has the most recorded events: <strong className="text-foreground">{peak?.total}</strong>. Coverage may be incomplete; {data.years.at(-1)?.label} runs to 20 October.</p></div>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Timeline grouping">
          <Button variant={period === "year" ? "default" : "outline"} onClick={() => setPeriod("year")} aria-pressed={period === "year"}><CalendarDays />By year</Button>
          <Button variant={period === "parliament" ? "default" : "outline"} onClick={() => setPeriod("parliament")} aria-pressed={period === "parliament"}><Landmark />By parliament</Button>
          <Button variant={period === "party" ? "default" : "outline"} onClick={() => setPeriod("party")} aria-pressed={period === "party"}><Users />By party</Button>
        </div>
      </div>
      <div className="mt-6">{period === "party"
        ? <PartyLegend hidden={hiddenParties} onToggle={(key) => setHiddenParties((previous) => toggleKey(previous, key))} />
        : <Legend hidden={hiddenOutcomes} onToggle={(key) => setHiddenOutcomes((previous) => toggleKey(previous, key))} />}</div>
      <div className="mt-5 overflow-x-auto" role="region" aria-label={period === "party" ? "Whip losses by year and party chart" : `Whip losses by ${period} chart`} tabIndex={0}>
        {period === "party" ? <ChartContainer config={partyChartConfig} className="h-80 w-full aspect-auto min-w-[900px]">
          <BarChart data={data.partyYears} accessibilityLayer margin={{ top: 16, right: 12, left: 0, bottom: 15 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} interval={3} tickMargin={10} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent labelFormatter={(_, payload) => payload[0]?.payload.label} />} />
            {data.partySeries.filter((party) => !hiddenParties.includes(party.key)).map((party) => <Bar key={party.key} dataKey={party.key} stackId="events" fill={`var(--color-${party.key})`} isAnimationActive={false} />)}
          </BarChart>
        </ChartContainer> : <ChartContainer config={config} className={`h-80 w-full aspect-auto ${period === "year" ? "min-w-[900px]" : "min-w-[700px]"}`}>
          <BarChart data={timeline} accessibilityLayer margin={{ top: 16, right: 12, left: 0, bottom: period === "year" ? 15 : 45 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} interval={period === "year" ? 3 : 0} angle={period === "year" ? 0 : -35} textAnchor={period === "year" ? "middle" : "end"} tickMargin={10} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent labelFormatter={(_, payload) => payload[0]?.payload.label} />} />
            {series.filter((key) => !hiddenOutcomes.includes(key)).map((key) => <Bar key={key} dataKey={key} stackId="events" fill={`var(--color-${key})`} isAnimationActive={false} />)}
          </BarChart>
        </ChartContainer>}
      </div>
      <Button className="mt-4" variant="outline" onClick={() => setShowTable(!showTable)} aria-expanded={showTable} aria-controls="timeline-data"><Table2 />{showTable ? "Hide figures" : "View figures"}</Button>
      {showTable && <div id="timeline-data" className="mt-4">{period === "party" ? <PartyYearTable /> : <CountsTable groups={timeline} heading={period === "year" ? "Year" : "Parliament"} />}</div>}
    </section>
    <PartyTimeline />
    <section className="border-t border-border" aria-labelledby="party-title">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h2 id="party-title" className="font-display text-3xl">Totals by party</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Attributed to the party before each event. Source categories are kept separate, including Labour and Labour (Co-op). Unspecified outcomes are not counted as whip losses.</p>
        <div className="mt-6"><Legend hidden={[]} onToggle={() => {}} /></div>
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
