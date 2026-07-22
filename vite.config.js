import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.svg",
        "icons.svg",
      ],

      manifest: {
        name: "ERT 출동 대응 보고",
        short_name: "ERT 보고",
        description:
          "ERT 출동 대응 보고 작성 도구",

        theme_color: "#0b1118",
        background_color: "#0b1118",

        display: "standalone",
        orientation: "portrait",

        start_url: "/",
        scope: "/",

        lang: "ko",

        icons: [
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },

      workbox: {
        globPatterns: [
          "**/*.{js,css,html,svg,png,ico}",
        ],

        navigateFallback: "index.html",

        cleanupOutdatedCaches: true,
      },
    }),
  ],
});