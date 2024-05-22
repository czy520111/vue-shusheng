import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    open: true,
    host: "0.0.0.0",
    hmr: {
      overlay: false,
    },
    headers: {
      "Access-Control-Allow-Headers":
        "Origin,X-Requested-With,Content-Type,Accept",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
    resolve: {
      alias: {
        "@": "/src/",
        "images/": "/src/assets/images/",
      },
    },
  },
});
