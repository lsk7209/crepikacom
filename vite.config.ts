import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean,
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    sourcemap: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("blog-content")) return "blog-data";
          if (id.includes("blog-posts-meta")) return "blog-meta";
          if (
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-router-dom") ||
            id.includes("node_modules/@tanstack/react-query") ||
            id.includes("node_modules/react-helmet")
          )
            return "vendor";
          if (id.includes("node_modules/@radix-ui")) return "ui";
          if (id.includes("node_modules/qrcode")) return "qrcode";
          if (id.includes("node_modules/recharts")) return "recharts";
        },
      },
    },
  },
}));
