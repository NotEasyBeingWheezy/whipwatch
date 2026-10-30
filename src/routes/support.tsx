import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { rows } from "@/lib/records";

// Add your Ko-fi page name here — the part after ko-fi.com/.
// For example: "salvatore" becomes https://ko-fi.com/salvatore
// Leave it empty ("" ) to show the "coming soon" note instead.
const KO_FI_USERNAME = "";

const koFiUrl = KO_FI_USERNAME ? `https://ko-fi.com/${KO_FI_USERNAME}` : "";
const koFiShopUrl = KO_FI_USERNAME ? `https://ko-fi.com/${KO_FI_USERNAME}/shop` : "";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support — WhipWatch" },
      { name: "description", content: "Support WhipWatch and help keep the UK parliamentary whip records free and up to date." },
      { property: "og:title", content: "Support — WhipWatch" },
      { property: "og:description", content: "Support WhipWatch and help keep the UK parliamentary whip records free and up to date." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/support" }],
  }),
  component: Support,
});

function Support() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b-4 border-primary">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-6">
            <SiteNav />
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Support · Keep WhipWatch running</p>
          <h1 className="mt-3 font-display text-6xl leading-none md:text-8xl">WhipWatch</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Every record is checked against Parliament career pages and news reports before it goes in.
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 max-w-2xl">
            {([["Total", rows.length], ["Withdrawn", rows.filter((r) => r.whip === "Withdrawn").length], ["Resigned", rows.filter((r) => r.whip === "Resigned").length]] as const).map(([label, count]) => (
              <div key={label} className="border-l-2 border-border pl-4">
                <dd className="font-display text-4xl text-primary">{count}</dd>
                <dt className="mt-1 font-mono text-xs uppercase text-muted-foreground">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <section className="mx-auto max-w-3xl space-y-6 px-6 py-10">
        <h2 className="font-display text-3xl">Buy me a coffee</h2>
        <p className="text-muted-foreground">
          WhipWatch is free to use and has no adverts or trackers. If you find it useful — for research,
          journalism or plain curiosity — a small donation through Ko-fi helps cover the time spent
          checking dates, chasing sources and keeping the records up to date.
        </p>
        {koFiUrl ? (
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={koFiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Support on Ko-fi ☕
            </a>
            <a
              href={koFiShopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-semibold uppercase tracking-widest text-foreground transition-colors hover:bg-accent"
            >
              Ko-fi shop
            </a>
            <span className="font-mono text-xs text-muted-foreground">{koFiUrl}</span>
          </div>
        ) : (
          <p className="border-t border-border pt-6 text-sm text-muted-foreground">
            Support details will be added here once the Ko-fi page is set up. We are not currently accepting donations through this page.
          </p>
        )}

        <div className="space-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
          <p>
            Your support doesn't change how the records are kept. Every entry is verified against
            parliamentary and news sources, and corrections are welcome on the{" "}
            <Link
              to="/contact"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              contact page
            </Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
