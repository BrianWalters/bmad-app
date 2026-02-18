import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/data/orm/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_PATH || "./data/sqlite.db",
  },
});
