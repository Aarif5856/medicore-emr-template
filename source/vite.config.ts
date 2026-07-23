import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";

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
    // nitro emits the production server build. On Netlify the `netlify`
    // preset outputs a Netlify Function; elsewhere the zero-config default
    // targets Node.
    ...(command === "build" ? [nitro(process.env.NETLIFY ? { preset: "netlify" } : {})] : []),
    viteReact(),
  ],
}));
