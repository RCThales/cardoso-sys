import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "CARDOSO SYS",
        short_name: "CARDOSO",
        description: "Sistema de gestão Cardoso",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        screenshots: [
          {
            src: "/screenshot-wide.png",
            type: "image/png",
            sizes: "1835x1080",
            form_factor: "wide",
          },
          {
            src: "/screenshot-mobile.png",
            type: "image/png",
            sizes: "1080x1920",
            form_factor: "narrow",
          },
        ],
        icons: [
          {
            src: "/icon.png",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/icon.png",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "maskable",
          },
          {
            src: "/icons/icon_small.png",
            type: "image/png",
            sizes: "144x144",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
