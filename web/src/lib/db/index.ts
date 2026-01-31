import { drizzle } from "drizzle-orm/node-postgres";

import * as authSchema from "./schemas/auth-schema";
import * as relations from "./schemas/relations";
import * as schema from "./schemas/schema";

export const db = drizzle(process.env.DATABASE_URL, {
	schema: {
		...schema,
		...authSchema,
		...relations,
	},
	casing: "snake_case",
});
