import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { rows } from "@/lib/records";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact — WhipWatch corrections and contributions" },
    { name: "description", content: "Contribute corrections and source evidence to improve WhipWatch's UK parliamentary whip records." },
    { property: "og:title", content: "Contact — WhipWatch corrections and contributions" },
    { property: "og:description", content: "Help improve the accuracy of WhipWatch's parliamentary whip records with corrections and supporting sources." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Contact,
});

function Contact() {
  return <main className="min-h-screen bg-background text-foreground">
    <header className="border-b-4 border-primary">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6"><SiteNav /></div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Contact · Corrections and contributions</p>
        <h1 className="mt-3 font-display text-6xl leading-none md:text-8xl">WhipWatch</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">Help improve the accuracy of the parliamentary whip records.</p>
        <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4 max-w-2xl">
          {([["Total", rows.length], ["Withdrawn", rows.filter((r) => r.whip === "Withdrawn").length], ["Resigned", rows.filter((r) => r.whip === "Resigned").length], ["Suspended", rows.filter((r) => r.whip === "Suspended").length]] as const).map(([label, count]) => <div key={label} className="border-l-2 border-border pl-4"><dd className="font-display text-4xl text-primary">{count}</dd><dt className="mt-1 font-mono text-xs uppercase text-muted-foreground">{label}</dt></div>)}
        </dl>
      </div>
    </header>
    <section className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <h2 className="font-display text-3xl">Corrections and contributions</h2>
      <p className="text-muted-foreground">If you spot an error or a missing event, we welcome corrections supported by reliable sources.</p>
      <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
        <li>The MP’s name and the date of the event.</li>
        <li>The detail you believe needs correcting, or the event to add.</li>
        <li>A link to a parliamentary record or another reliable source supporting the change.</li>
      </ul>
      <p className="border-t border-border pt-6 text-sm text-muted-foreground">Contact details will be added here once confirmed. We are not currently accepting submissions through this page.</p>
    </section>
  </main>;
}