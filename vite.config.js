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
        "favicon.ico",
        "apple-touch-icon-180x180.png",
      ],

      manifest: {
        name: "ERT 출동 대응 보고",
        short_name: "ERT 보고",
        description: "ERT 출동 대응 보고 작성 도구",

        theme_color: "#0b1118",
        background_color: "#0b1118",

        display: "standalone",
        orientation: "portrait",

        start_url: "/",
        scope: "/",

        lang: "ko",

        icons: [
          {
            src: "/pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
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