import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";

import { id, timestamps } from "../helpers";

export const user = p.pgTable("users", {
	id,
	name: p.varchar().notNull(),
	email: p.varchar().notNull().unique(),
	emailVerified: p.boolean().default(false).notNull(),
	image: p.varchar(),
	...timestamps,
});

export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;

export const session = p.pgTable(
	"sessions",
	{
		id,
		expiresAt: p.date().notNull(),
		token: p.varchar().notNull().unique(),
		ipAddress: p.varchar(),
		userAgent: p.varchar(),
		userId: p
			.varchar()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		...timestamps,
	},
	t => [p.index("session_userId_idx").on(t.userId)],
);

export type Session = InferSelectModel<typeof session>;
export type NewSession = InferInsertModel<typeof session>;

export const account = p.pgTable(
	"accounts",
	{
		id,
		accountId: p.varchar().notNull(),
		providerId: p.varchar().notNull(),
		userId: p
			.varchar()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: p.varchar(),
		refreshToken: p.varchar(),
		idToken: p.varchar(),
		accessTokenExpiresAt: p.varchar(),
		refreshTokenExpiresAt: p.varchar(),
		scope: p.varchar(),
		password: p.varchar(),
		...timestamps,
	},
	t => [p.index("account_userId_idx").on(t.userId)],
);

export type Account = InferSelectModel<typeof account>;
export type NewAccount = InferInsertModel<typeof account>;

export const verification = p.pgTable(
	"verifications",
	{
		id,
		identifier: p.varchar().notNull(),
		value: p.varchar().notNull(),
		expiresAt: p.date().notNull(),
		...timestamps,
	},
	t => [p.index("verification_identifier_idx").on(t.identifier)],
);

export type Verification = InferSelectModel<typeof verification>;
export type NewVerification = InferInsertModel<typeof verification>;
