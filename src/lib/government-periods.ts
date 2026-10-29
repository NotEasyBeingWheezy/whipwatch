// Government appointment dates, not election dates. Coalition remains distinct.
// Source: https://www.gov.uk/government/history/past-prime-ministers
export function chartDate(date: string) {
  const instant = new Date(`${date}T00:00:00Z`);
  const year = instant.getUTCFullYear();
  const start = Date.UTC(year, 0, 1);
  return year + (instant.getTime() - start) / (Date.UTC(year + 1, 0, 1) - start);
}

export const governmentPeriods = [
  { label: "Conservative", start: "1979-05-04", end: "1997-05-02", token: "government-conservative" },
  { label: "Labour", start: "1997-05-02", end: "2010-05-11", token: "government-labour" },
  { label: "Conservative–Lib Dem coalition", start: "2010-05-11", end: "2015-05-08", token: "government-coalition" },
  { label: "Conservative", start: "2015-05-08", end: "2024-07-05", token: "government-conservative" },
  { label: "Labour", start: "2024-07-05", end: null, token: "government-labour" },
];