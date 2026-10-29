import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  // Matches vite's `base` ("/" in preview, "/whipwatch/" in the GitHub Pages build)
  // so client-side navigation works under the Pages sub-path. During prerendering
  // the basepath is "/" so each route renders at its plain path (the prerender
  // crawler redirect-loops on base-prefixed sub-paths); the client router still
  // prefixes links after hydration.
  const isPrerendering =
    typeof process !== "undefined" && process.env.TSS_PRERENDERING === "true";
  const basepath = isPrerendering
    ? "/"
    : import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

  const router = createRouter({
    routeTree,
    basepath,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
