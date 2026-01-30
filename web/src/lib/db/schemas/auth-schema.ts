import * as m from "drizzle-orm/mssql-core";

import { id, timestamps } from "../helpers";

export const user = m.mssqlTable("user", {
	id,
	name: m.text().notNull(),
	email: m.text().notNull().unique(),
	emailVerified: m.bit().default(false).notNull(),
	image: m.text(),
	...timestamps,
});

export const session = m.mssqlTable(
	"session",
	{
		id,
		expiresAt: m.datetime().notNull(),
		token: m.text().notNull().unique(),
		ipAddress: m.text(),
		userAgent: m.text(),
		userId: m
			.varchar()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		...timestamps,
	},
	t => [m.index("session_userId_idx").on(t.userId)],
);

export const account = m.mssqlTable(
	"account",
	{
		id,
		accountId: m.varchar().notNull(),
		providerId: m.varchar().notNull(),
		userId: m
			.varchar()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: m.text(),
		refreshToken: m.text(),
		idToken: m.text(),
		accessTokenExpiresAt: m.text(),
		refreshTokenExpiresAt: m.text(),
		scope: m.text(),
		password: m.text(),
		...timestamps,
	},
	t => [m.index("account_userId_idx").on(t.userId)],
);

export const verification = m.mssqlTable(
	"verification",
	{
		id,
		identifier: m.text().notNull(),
		value: m.text().notNull(),
		expiresAt: m.datetime().notNull(),
		...timestamps,
	},
	t => [m.index("verification_identifier_idx").on(t.identifier)],
);
