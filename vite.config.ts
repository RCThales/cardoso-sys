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
        short_name: "CARDOSO SYS",
        description: "Sistema de gestão Cardoso",
        theme_color: "#202020",
        background_color: "#ffffff",
        display: "standalone",
        id: "com.cardoso.sys",
        screenshots: [
          {
            src: "/screenshot-wide.png",
            type: "image/png",
            sizes: "1920x1080",
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
