import { sql } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";
import { v4 as uuid } from "uuid";

export const id = p
	.varchar()
	.primaryKey()
	.$defaultFn(() => uuid());

export const timestamps = {
	updatedAt: p.date().notNull().defaultNow(),
	createdAt: p
		.date()
		.notNull()
		.defaultNow()
		.$onUpdate(() => sql`getutcdate()`),
};
