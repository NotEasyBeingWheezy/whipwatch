// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    // GitHub Pages serves the site under /whipwatch/; the deploy workflow sets
    // VITE_BASE_PATH=/whipwatch/ so asset and link URLs are prefixed correctly.
    // Locally and in the Lovable preview this stays "/".
    base: process.env.VITE_BASE_PATH ?? "/",
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Prerender all routes to static HTML so the site can be hosted on GitHub Pages.
    // The router renders with basepath "/" during prerender (see src/router.tsx),
    // so these paths stay unprefixed and each route lands at <route>/index.html.
    pages: [{ path: "/" }, { path: "/insights" }, { path: "/about" }],
    prerender: { enabled: true, autoStaticPathsDiscovery: false },
  },
});
