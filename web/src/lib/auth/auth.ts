import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/lib/db"; // your drizzle instance

export const auth = betterAuth({
	database: drizzleAdapter(db, { provider: "mssql" }),
	plugins: [nextCookies()],
	emailAndPassword: {
		enabled: true,
	},
	experimental: { joins: true },
});
