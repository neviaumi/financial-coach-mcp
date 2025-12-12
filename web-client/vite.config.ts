import { defineConfig } from "vite";
import deno from "@deno/vite-plugin";

export default defineConfig({
  plugins: [deno()],
  resolve: {
    alias: [
      {
        find: "@public/",
        replacement: "/",
      },
    ],
  },
});
