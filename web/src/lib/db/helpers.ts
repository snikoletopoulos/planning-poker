import { sql } from "drizzle-orm";
import * as m from "drizzle-orm/mssql-core";
import { v4 as uuid } from "uuid";

export const id = m
	.varchar()
	.primaryKey()
	.$defaultFn(() => uuid());

export const timestamps = {
	updatedAt: m.datetime().notNull().defaultGetDate(),
	createdAt: m
		.datetime()
		.notNull()
		.defaultGetDate()
		.$onUpdate(() => sql`getutcdate()`),
};
