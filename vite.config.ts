import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "pwa-192.svg", "pwa-512.svg", "robots.txt", "404.html", "links.json"],
      manifest: {
        name: "Nawy.to — بوابة ناوي",
        short_name: "Nawy.to",
        description: "بوابة ناوي للوصول السريع إلى منتجات وخدمات ناوي.",
        lang: "ar",
        dir: "rtl",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#0b1020",
        background_color: "#0b1020",
        icons: [
          { src: "/pwa-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any maskable" },
          { src: "/pwa-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any maskable" }
        ]
      },
      workbox: {
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: /\/links\.json$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "nawy-to-routes",
              networkTimeoutSeconds: 2,
              expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ]
});
