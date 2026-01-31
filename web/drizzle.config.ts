import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

export default defineConfig({
	out: "./src/lib/db/migrations",
	schema: "./src/lib/db/schemas",
	dialect: "postgresql",
	casing: "snake_case",
	dbCredentials: { url: process.env.DATABASE_URL },
});
