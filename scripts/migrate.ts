import { runMigrations } from "@/data/orm/connection";

console.log("Running database migrations...");
runMigrations();
console.log("Migrations complete.");
