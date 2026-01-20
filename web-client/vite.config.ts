import { defineConfig } from "vite";
import deno from "@deno/vite-plugin";

export default defineConfig({
  plugins: [deno()],
  server: {
    port: 8080,
    strictPort: true,
  },
  preview: {
    port: 8081,
    strictPort: true,
  },
  resolve: {
    alias: [
      {
        find: "@public/",
        replacement: "/",
      },
      {
        find: "@wa/",
        replacement: "@awesome.me/webawesome/dist/",
      },
    ],
  },
});
