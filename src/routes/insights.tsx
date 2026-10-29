import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { BarChart3, CalendarDays, Landmark, LineChart as LineIcon, ListChecks, Table2, Users } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { buildInsights, type InsightGroup } from "@/lib/insights";
import { GovernmentLegend, governmentAreas, partyChartConfig } from "@/components/party-timeline";

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
const outcomeYears = data.years.map((group) => ({ ...group, year: Number(group.label) + 0.5 }));
const startYear = Number(data.years.at(0)?.label ?? 1979);
const endYear = Number(data.years.at(-1)?.label ?? 2026) + 1;
const yearTicks = outcomeYears.filter((_, i) => i % 4 === 0).map((point) => point.year);

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
  const [view, setView] = useState<"outcome" | "party">("outcome");
  const [chartType, setChartType] = useState<"bars" | "lines">("bars");
  const [group, setGroup] = useState<"year" | "parliament">("year");
  const [showTable, setShowTable] = useState(false);
  const [hiddenOutcomes, setHiddenOutcomes] = useState<string[]>([]);
  const [hiddenParties, setHiddenParties] = useState<string[]>([]);
  const byParliament = view === "outcome" && chartType === "bars" && group === "parliament";
  const keys = view === "party"
    ? data.partySeries.filter((party) => !hiddenParties.includes(party.key)).map((party) => party.key)
    : series.filter((key) => !hiddenOutcomes.includes(key));
  const chartData = view === "party" ? data.partyYears : outcomeYears;
  const chartConfig = view === "party" ? partyChartConfig : config;
  const color = (key: string) => view === "party" ? partyChartConfig[key]?.color : config[key as keyof typeof config].color;
  const yearAxis = <XAxis type="number" dataKey="year" domain={[startYear, endYear]} ticks={yearTicks}
    tickFormatter={(value) => String(Math.floor(Number(value)))} tickLine={false} axisLine={false} tickMargin={10} />;
  const toggle = (label: string, active: boolean, onClick: () => void, icon: ReactNode, disabled = false) =>
    <Button size="sm" variant={active ? "default" : "outline"} onClick={onClick} aria-pressed={active} disabled={disabled}>{icon}{label}</Button>;
  const peak = data.years.reduce<InsightGroup | undefined>((best, group) => !best || group.total > best.total ? group : best, undefined);
  return <main className="min-h-screen bg-background text-foreground">
    <header className="border-b-4 border-primary">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6"><SiteNav /></div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Insights · Whip losses in numbers</p>
        <h1 className="mt-3 font-display text-6xl leading-none md:text-8xl">WhipWatch</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">Recorded withdrawals, resignations and suspensions, 1979–2026. Each time an MP lost the whip is counted, so one MP can appear more than once.</p>
        <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl">
          {[["Total", data.totals.total], ["Withdrawn", data.totals.withdrawn], ["Resigned", data.totals.resigned], ["Suspended", data.totals.suspended]].map(([label, count]) => <div key={label} className="border-l-2 border-border pl-4"><dd className="font-display text-4xl text-primary">{count}</dd><dt className="mt-1 font-mono text-xs uppercase text-muted-foreground">{label}</dt></div>)}
        </dl>
      </div>
    </header>
    <section className="mx-auto max-w-6xl px-6 py-10" aria-labelledby="timeline-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 id="timeline-title" className="font-display text-3xl">Whip losses over time</h2><p className="mt-2 text-sm text-muted-foreground">{peak?.label} has the most recorded events: <strong className="text-foreground">{peak?.total}</strong>. Coverage may be incomplete; {data.years.at(-1)?.label} runs to 20 October.</p></div>
      </div>
      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
        <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Show">
          <span className="mr-1 font-mono text-xs uppercase text-muted-foreground">Show</span>
          {toggle("By outcome", view === "outcome", () => setView("outcome"), <ListChecks />)}
          {toggle("By party", view === "party", () => setView("party"), <Users />)}
        </div>
        <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Chart type">
          <span className="mr-1 font-mono text-xs uppercase text-muted-foreground">Chart</span>
          {toggle("Bars", chartType === "bars", () => setChartType("bars"), <BarChart3 />)}
          {toggle("Lines", chartType === "lines", () => setChartType("lines"), <LineIcon />)}
        </div>
        <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Group by">
          <span className="mr-1 font-mono text-xs uppercase text-muted-foreground">Group by</span>
          {toggle("Year", !byParliament, () => setGroup("year"), <CalendarDays />)}
          {toggle("Parliament", byParliament, () => setGroup("parliament"), <Landmark />, view === "party" || chartType === "lines")}
        </div>
      </div>
      <div className="mt-5">{view === "party"
        ? <PartyLegend hidden={hiddenParties} onToggle={(key) => setHiddenParties((previous) => toggleKey(previous, key))} />
        : <Legend hidden={hiddenOutcomes} onToggle={(key) => setHiddenOutcomes((previous) => toggleKey(previous, key))} />}</div>
      <div className="mt-5 overflow-x-auto" role="region" aria-label={`Whip losses ${view === "party" ? "by party" : "by outcome"} ${chartType === "bars" ? "bar" : "line"} chart`} tabIndex={0}>
        {byParliament ? <ChartContainer config={config} className="h-80 w-full aspect-auto min-w-[700px]">
          <BarChart data={data.parliaments} accessibilityLayer margin={{ top: 16, right: 12, left: 0, bottom: 45 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} angle={-35} textAnchor="end" tickMargin={10} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent labelFormatter={(_, payload) => payload[0]?.payload.label} />} />
            {keys.map((key) => <Bar key={key} dataKey={key} stackId="events" fill={`var(--color-${key})`} isAnimationActive={false} />)}
          </BarChart>
        </ChartContainer> : <ChartContainer config={chartConfig} className="h-96 w-full aspect-auto min-w-[900px]">
          {chartType === "bars" ? <BarChart data={chartData} accessibilityLayer margin={{ top: 16, right: 12, left: 0, bottom: 15 }}>
            {governmentAreas(startYear, endYear)}
            <CartesianGrid vertical={false} stroke="var(--border)" />
            {yearAxis}
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent labelFormatter={(_, payload) => payload[0]?.payload.label} />} />
            {keys.map((key) => <Bar key={key} dataKey={key} stackId="events" barSize={13} fill={color(key)} isAnimationActive={false} />)}
          </BarChart> : <LineChart data={chartData} accessibilityLayer margin={{ top: 16, right: 12, left: 0, bottom: 15 }}>
            {governmentAreas(startYear, endYear)}
            <CartesianGrid vertical={false} stroke="var(--border)" />
            {yearAxis}
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent labelFormatter={(_, payload) => payload[0]?.payload.label} />} />
            {keys.map((key) => <Line key={key} dataKey={key} type="linear" stroke={color(key)} strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />)}
          </LineChart>}
        </ChartContainer>}
      </div>
      {!byParliament && <GovernmentLegend />}
      <p className="mt-3 text-xs text-muted-foreground">Background bands mark UK governments, using appointment dates; the coalition is shown separately. Unspecified whip outcomes are excluded. Government dates: <a className="underline underline-offset-4" href="https://www.gov.uk/government/history/past-prime-ministers" target="_blank" rel="noreferrer">GOV.UK, past prime ministers</a>.</p>
      <Button className="mt-4" variant="outline" onClick={() => setShowTable(!showTable)} aria-expanded={showTable} aria-controls="timeline-data"><Table2 />{showTable ? "Hide figures" : "View figures"}</Button>
      {showTable && <div id="timeline-data" className="mt-4">{view === "party" ? <PartyYearTable /> : <CountsTable groups={byParliament ? data.parliaments : data.years} heading={byParliament ? "Parliament" : "Year"} />}</div>}
    </section>
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
