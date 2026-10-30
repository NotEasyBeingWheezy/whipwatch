<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Combine the main and historical spreadsheet extracts in `src/lib/records.ts`, preserving source precision and provenance; keep unknown whip outcomes blank rather than inferring them from allegiance changes.
- Store checked Parliament career links alongside news citations in each record's `sources`; document affiliation-date agreement or discrepancies in notes without silently overwriting source event dates, because party history alone does not establish a whip outcome.
- Document any deliberate source-outcome reclassification in the record notes and reuse `OutcomeNote` across explanation pages so the displayed totals remain transparent.
- Include each new content route in `scripts/prerender-pages.mjs` so GitHub Pages serves it directly.
- Derive Insights aggregates from the shared records in `src/lib/insights.ts`; count only explicit withdrawn, resigned or suspended outcomes as whip losses, and group parties by the source's before-party field to avoid inferring events or allegiances.
- Normalize equivalent parliament labels in the shared Insights aggregator, not the source extracts, so outcome and party charts agree while preserving provenance.
- Share parliament label normalization and record filtering between Insights bar navigation and Home so linked records match the visible chart totals without altering source records.
- Party timelines use annual counts from the shared Insights aggregator, retaining source party categories; government bands use appointment-date boundaries from `src/lib/government-periods.ts`, distinguishing coalition government rather than assigning it to one party.
- GitHub Pages deploy: explicitly pin Nitro's `cloudflare-module` preset and `dist/server` / `dist/client` output directories in `vite.config.ts` because builds outside Lovable otherwise use a different output layout. The workflow `.github/workflows/deploy.yml` builds with `VITE_BASE_PATH=/whipwatch/` and runs `scripts/prerender-pages.mjs` to write static HTML per route into `dist/client`. The framework's own prerender crawler is not used because it redirect-loops on base-prefixed sub-paths; the script requests the final paths from the built server directly. The router basepath comes from `import.meta.env.BASE_URL`, so any base-path change only needs the workflow env var.
