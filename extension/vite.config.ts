import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBase =
    env.VITE_VERITASLENS_API_BASE ?? "http://localhost:3000";

  return {
    base: "./",
    plugins: [react()],
    define: {
      __API_BASE__: JSON.stringify(apiBase.replace(/\/$/, "")),
    },
    publicDir: "public",
    build: {
      outDir: "dist",
      emptyOutDir: true,
      rollupOptions: {
        input: {
          panel: resolve(__dirname, "panel.html"),
          popup: resolve(__dirname, "popup.html"),
          background: resolve(__dirname, "src/background.ts"),
          content: resolve(__dirname, "src/content.ts"),
        },
        output: {
          entryFileNames: "[name].js",
          chunkFileNames: "chunks/[name]-[hash].js",
          assetFileNames: "assets/[name][extname]",
        },
      },
    },
  };
});
