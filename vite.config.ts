// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Outside Lovable, Nitro otherwise uses its own default output directories.
  // Keep the entry and public files where the GitHub Pages export expects them.
  nitro: {
    preset: "cloudflare-module",
    output: {
      dir: "dist",
      serverDir: "dist/server",
      publicDir: "dist/client",
    },
    cloudflare: { nodeCompat: true },
  },
  vite: {
    // GitHub Pages serves the site under /whipwatch/; the deploy workflow sets
    // VITE_BASE_PATH=/whipwatch/ so asset and link URLs are prefixed correctly.
    // Locally and in the Lovable preview this stays "/".
    base: process.env["VITE_BASE_PATH"] ?? "/",
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
