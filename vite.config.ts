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
      includeAssets: ["favicon.ico", "favicon.svg", "favicon-*.png", "apple-touch-icon.png", "android-chrome-*.png", "robots.txt", "links.json", "fonts/*.woff2"],
      manifest: {
        name: "Nawy.to — بوابة ناوي",
        short_name: "Nawy.to",
        description: "بوابة ناوي للوصول السريع إلى منتجات وخدمات ناوي.",
        lang: "ar",
        dir: "rtl",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#0B1B3A",
        background_color: "#0B1B3A",
        icons: [
          { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
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
