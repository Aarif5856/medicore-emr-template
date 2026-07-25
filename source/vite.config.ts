import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";

// Headers the PWA depends on. nitro translates routeRules into whatever the
// active preset needs — Vercel's Build Output config.json, Netlify's _headers
// file — so this stays correct on both platforms.
//
// sw.js must never be cached: a stale service worker pins users to an old
// app shell across deploys. The manifest needs its proper MIME type or the
// browser silently refuses to parse it (and PWABuilder reports "no manifest").
const pwaRouteRules = {
  "/sw.js": {
    headers: {
      "cache-control": "public, max-age=0, must-revalidate",
      "service-worker-allowed": "/",
    },
  },
  "/manifest.webmanifest": {
    headers: {
      "content-type": "application/manifest+json",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  },
};

export default defineConfig(({ command }) => ({
  // Match the build's CSS pipeline in dev so the preview stays honest.
  css: { transformer: "lightningcss" },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    // Server entry redirected to src/server.ts (SSR error wrapper).
    tanstackStart({ server: { entry: "server" } }),
    // nitro emits the production server build. On Netlify/Vercel the
    // matching preset outputs that platform's native function format;
    // elsewhere the zero-config default targets plain Node.
    ...(command === "build"
      ? [
          nitro({
            ...(process.env.NETLIFY
              ? { preset: "netlify" }
              : process.env.VERCEL
                ? { preset: "vercel" }
                : {}),
            routeRules: pwaRouteRules,
          }),
        ]
      : []),
    viteReact(),
  ],
}));
