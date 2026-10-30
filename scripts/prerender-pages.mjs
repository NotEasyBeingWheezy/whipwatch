// Renders every route to a static HTML file after `vite build`, so the site
// can be hosted on GitHub Pages (which serves static files only).
//
// The framework's own prerender crawler is not used: with a base path set
// (e.g. /whipwatch/), the built server 307-redirects unprefixed paths to the
// base-prefixed URL and the crawler follows that redirect in a loop. This
// script requests the final base-prefixed paths directly, which the server
// answers with 200.
//
// Usage: VITE_BASE_PATH=/whipwatch/ bun run build && bun scripts/prerender-pages.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "dist", "client");
const base = (process.env.VITE_BASE_PATH ?? "/").replace(/\/$/, "");
const routes = ["/", "/insights", "/about", "/contact"];

const server = (await import(join(root, "dist", "server", "index.mjs"))).default;
const ctx = { waitUntil: () => {} };

for (const route of routes) {
  const res = await server.fetch(new Request(`http://localhost${base}${route}`), {}, ctx);
  if (!res.ok) {
    throw new Error(`Prerender failed for ${route}: HTTP ${res.status}`);
  }
  const html = await res.text();
  const file = route === "/" ? join(outDir, "index.html") : join(outDir, route.slice(1), "index.html");
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
  console.log(`Prerendered ${route} -> ${file}`);
}
