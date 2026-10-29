import { useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceArea, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { buildInsights } from "@/lib/insights";
import { chartDate, governmentPeriods } from "@/lib/government-periods";

const data = buildInsights();
export const partyColorTokens: Record<string, string> = {
  Lab: "party-labour", Con: "party-conservative", LD: "party-libdem", "Lib Dem": "party-libdem", SNP: "party-snp",
  CUK: "party-cuk", "Lab (Co-op)": "party-coop", UUP: "party-uup", DUP: "party-dup",
  "Reform UK": "party-reform", "Deputy Speaker": "party-speaker", Ind: "party-independent",
  PC: "party-plaid", SDLP: "party-sdlp", SF: "party-sf",
};
export const partyChartConfig = Object.fromEntries(data.partySeries.map((party) => [party.key, {
  label: party.label, color: `var(--${partyColorTokens[party.source] ?? "chart-5"})`,
}])) satisfies ChartConfig;

export function PartyTimeline() {
  const [hidden, setHidden] = useState<string[]>([]);
  const first = data.partyYears.at(0);
  const last = data.partyYears.at(-1);
  if (!first || !last) return null;
  const start = Number(first.label);
  const end = Number(last.label) + 1;
  const ticks = data.partyYears.filter((_, i) => i % 4 === 0).map((point) => point.year);
  return <section className="border-t border-border" aria-labelledby="party-timeline-title">
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h2 id="party-timeline-title" className="font-display text-3xl">Party whip losses over time</h2>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">Annual recorded events, grouped by the party before each event. Background bands mark UK governments; changes within a year use appointment dates. The coalition is shown separately.</p>
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Party lines">
        {data.partySeries.map((party) => <Button key={party.key} variant="ghost" size="sm"
          className={hidden.includes(party.key) ? "opacity-40" : ""}
          aria-pressed={!hidden.includes(party.key)}
          onClick={() => setHidden((previous) => previous.includes(party.key) ? previous.filter((key) => key !== party.key) : [...previous, party.key])}>
          <svg width="12" height="12" aria-hidden="true"><rect width="12" height="12" fill={partyChartConfig[party.key]?.color} /></svg>
          {party.label}
        </Button>)}
      </div>
      <div className="mt-4 overflow-x-auto" role="region" aria-label="Annual whip losses by party line chart" tabIndex={0}>
        <ChartContainer config={partyChartConfig} className="h-96 w-full min-w-[900px] aspect-auto">
          <LineChart data={data.partyYears} accessibilityLayer margin={{ top: 20, right: 20, left: 0, bottom: 16 }}>
            {governmentPeriods.map((government) => {
              const from = Math.max(start, chartDate(government.start));
              const to = Math.min(end, government.end ? chartDate(government.end) : end);
              return from < to ? <ReferenceArea key={government.start} x1={from} x2={to}
                fill={`var(--${government.token})`} fillOpacity={1} stroke="none" /> : null;
            })}
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis type="number" dataKey="year" domain={[start, end]} ticks={ticks}
              tickFormatter={(value) => String(Math.floor(Number(value)))} tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent labelFormatter={(_, payload) => payload[0]?.payload.label} />} />
            {data.partySeries.filter((party) => !hidden.includes(party.key)).map((party) => <Line
              key={party.key} dataKey={party.key} type="linear" stroke={partyChartConfig[party.key]?.color}
              strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />)}
          </LineChart>
        </ChartContainer>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground" aria-label="Government shading legend">
        {[governmentPeriods[0], governmentPeriods[1], governmentPeriods[2]].map((government) => government && <span key={government.label} className="flex items-center gap-2">
          <svg width="16" height="12" aria-hidden="true"><rect width="16" height="12" fill={`var(--${government.token})`} stroke="var(--border)" /></svg>
          {government.label} government
        </span>)}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Unspecified whip outcomes are excluded. {last.label} is a partial year. Government dates: <a className="underline underline-offset-4" href="https://www.gov.uk/government/history/past-prime-ministers" target="_blank" rel="noreferrer">GOV.UK, past prime ministers</a>.</p>
    </div>
  </section>;
}