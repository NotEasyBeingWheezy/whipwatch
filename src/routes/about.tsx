import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { OutcomeNote } from "@/components/outcome-note";
import { rows } from "@/lib/records";

const count = (w: string) => rows.filter((r) => r.whip === w).length;

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — WhipWatch" },
      { name: "description", content: "What WhipWatch tracks, where its data comes from and how to read it." },
      { property: "og:title", content: "About — WhipWatch" },
      { property: "og:description", content: "What WhipWatch tracks, where its data comes from and how to read it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b-4 border-primary">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-6">
            <SiteNav />
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">About · How to read the whip records</p>
          <h1 className="mt-3 font-display text-6xl md:text-8xl leading-none">WhipWatch</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            What WhipWatch tracks, where its data comes from and how to read it.
          </p>
          <dl className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-2xl">
            {([["Total", rows.length], ["Withdrawn", count("Withdrawn")], ["Resigned", count("Resigned")]] as const).map(([l, n]) => (
              <div key={l} className="border-l-2 border-border pl-4">
                <dd className="font-display text-4xl text-primary">{n}</dd>
                <dt className="mt-1 font-mono text-xs uppercase text-muted-foreground">{l}</dt>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <section className="mx-auto max-w-3xl space-y-10 px-6 py-10">
        <div className="space-y-4">
          <h2 className="font-display text-2xl">What this is</h2>
          <p className="text-muted-foreground">
            WhipWatch is a record of every Member of Parliament in the House of Commons who has had the
            party whip withdrawn or suspended, or who has resigned it, since 1979, alongside older changes
            of party allegiance going back to 1902. The whip is a member's
            membership of their parliamentary party: lose it, and you sit as an independent and are usually
            barred from standing for the party at the next election.
          </p>
          <p className="text-muted-foreground">
            The list runs newest first, so the most recent events are at the top. You can search by MP,
            constituency or the notes, and narrow the table by type of event or by the party the MP
            belonged to at the time.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-2xl">How to read the table</h2>
          <div className="border border-border bg-card">
            {[
              ["Date", "The day the whip was withdrawn, suspended or resigned, or the day it became public. Older records show only a month and year where the source does not specify an exact day."],
              ["Member", "The MP involved at the time of the event. ‘Older record’ marks historical entries from the provisional section of the spreadsheet."],
              ["Constituency", "The seat the MP was representing."],
              ["Whip", "What happened: Withdrawn, Suspended or Resigned. A dash means the source does not specify the whip outcome; a change of party alone does not establish it. See below for the difference."],
              ["Party", "The party the MP held the whip for (before) and the party afterwards, if they joined one. \"Independent\" means they sat without a party."],
              ["Notes", "A short summary of why it happened, and what followed — for example if the whip was later restored. Recent entries include links to news reports covering the event."],
            ].map(([term, def]) => (
              <div key={term} className="flex gap-4 border-b border-border px-4 py-3 last:border-b-0">
                <span className="w-28 shrink-0 font-mono text-xs uppercase text-primary">{term}</span>
                <span className="text-sm text-muted-foreground">{def}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-2xl">The three outcomes</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Withdrawn", "The party removed the whip — the MP was expelled or suspended from the parliamentary party, usually for misconduct or for rebelling against the party line."],
              ["Resigned", "The MP gave up the whip themselves, for example over a disagreement with the party or a personal scandal."],
              ["Suspended", "A temporary removal, typically pending an investigation. The whip is sometimes later restored."],
            ].map(([title, def]) => (
              <div key={title} className="border border-border bg-card p-4">
                <div className="font-display text-xl text-primary">{title}</div>
                <p className="mt-2 text-sm text-muted-foreground">{def}</p>
              </div>
            ))}
          </div>
          <OutcomeNote />
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-2xl">Where the data comes from</h2>
          <p className="text-muted-foreground">
            The records are drawn from the House of Commons Library briefing{" "}
            <span className="font-mono text-xs text-foreground">SN02537: Recall of MPs, suspension and resignation of the party whip</span>,
            updated 21 October 2026. That briefing covers the whip suspensions and resignations of the current
            parliament's parties; older parties and parliaments may be incomplete.
          </p>
          <p className="text-muted-foreground">
            Entries labelled “Older record” come from a hidden worksheet within <span className="font-mono text-xs text-foreground">SN02537</span> entitled <span className="font-mono text-xs text-foreground">DATA+</span>, marked “Needs some work”.
            These ten additional entries cover 1902–1972 and are provisional, potentially incomplete records
            of changes of allegiance, not necessarily confirmed whip suspensions or resignations. Their
            unspecified whip outcomes are not included in the Withdrawn or Resigned totals, but they are
            included in the Total count. Entries already in the main list have not been added again.
          </p>
          <p className="text-muted-foreground">
            The notes column summarises each entry rather than quoting it in full, so for the detail behind
            any event, the original briefing is the authoritative source.
          </p>
        </div>

      </section>
    </main>
  );
}
