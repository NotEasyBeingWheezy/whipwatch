import { ReferenceArea } from "recharts";
import { type ChartConfig } from "@/components/ui/chart";
import { buildInsights, partyColor, partyColorTokens } from "@/lib/insights";
import { chartDate, governmentPeriods } from "@/lib/government-periods";

const data = buildInsights();
export { partyColorTokens };
export const partyChartConfig = Object.fromEntries(data.partySeries.map((party) => [party.key, {
  label: party.label, color: partyColor(party.source),
}])) satisfies ChartConfig;

export function governmentAreas(start: number, end: number) {
  return governmentPeriods.map((government) => {
    const from = Math.max(start, chartDate(government.start));
    const to = Math.min(end, government.end ? chartDate(government.end) : end);
    return from < to ? <ReferenceArea key={government.start} x1={from} x2={to}
      fill={`var(--${government.token})`} fillOpacity={1} stroke="none" /> : null;
  });
}

export function GovernmentLegend() {
  return <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground" aria-label="Government shading legend">
    {[governmentPeriods[0], governmentPeriods[1], governmentPeriods[2]].map((government) => government && <span key={government.label} className="flex items-center gap-2">
      <svg width="16" height="12" aria-hidden="true"><rect width="16" height="12" fill={`var(--${government.token})`} stroke="var(--border)" /></svg>
      {government.label} government
    </span>)}
  </div>;
}
