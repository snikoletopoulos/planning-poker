import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/lib/db";
import * as authSchema from "@/lib/db/schemas/auth-schema";
import * as relations from "@/lib/db/schemas/relations";
import * as schema from "@/lib/db/schemas/schema";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: { ...schema, ...authSchema, ...relations },
		usePlural: false,
		camelCase: false,
		transaction: true,
	}),
	plugins: [nextCookies()],
	emailAndPassword: {
		enabled: true,
	},
	experimental: { joins: true },
});
