import { runMigrations } from "../src/data/orm/connection";

console.log("Running database migrations...");
runMigrations();
console.log("Migrations complete.");
