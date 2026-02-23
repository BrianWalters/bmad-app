import { defineConfig } from "astro/config";
import node from "@astrojs/node";

const isTest = process.env.NODE_ENV === "test";

export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  security: {
    checkOrigin: !isTest,
    allowedDomains: [{}],
  },
});
