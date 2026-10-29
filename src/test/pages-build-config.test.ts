import { describe, expect, it, vi } from "vitest";

// Inspect the actual configuration without starting Vite or a production build.
vi.mock("@lovable.dev/vite-tanstack-config", () => ({
  defineConfig: (options: unknown) => options,
}));

import config from "../../vite.config";

describe("GitHub Pages export configuration", () => {
  it("pins a fetch-compatible server instead of auto-detecting a CI target", () => {
    expect(config).toHaveProperty("nitro.preset", "cloudflare-module");
  });

  it("writes the server entry into the folder used by the export script", () => {
    expect(config).toHaveProperty("nitro.output.serverDir", "dist/server");
  });

  it("writes public files into the folder uploaded by GitHub Actions", () => {
    expect(config).toHaveProperty("nitro.output.publicDir", "dist/client");
  });
});