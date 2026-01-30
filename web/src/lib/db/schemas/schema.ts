import { sql, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import * as m from "drizzle-orm/mssql-core";
import { v4 as uuid } from "uuid";

const timestamps = {
	updatedAt: m.datetime().notNull().defaultGetDate(),
	createdAt: m
		.datetime()
		.notNull()
		.defaultGetDate()
		.$onUpdate(() => sql`getutcdate()`),
};

export const rooms = m.mssqlTable("rooms", {
	id: m
		.varchar()
		.primaryKey()
		.$defaultFn(() => uuid()),
	name: m.text().notNull(),
	...timestamps,
});

export type Room = InferSelectModel<typeof rooms>;
export type NewRoom = InferInsertModel<typeof rooms>;

export const stories = m.mssqlTable("stories", {
	id: m
		.varchar()
		.primaryKey()
		.$defaultFn(() => uuid()),
	title: m.text().notNull(),
	description: m.text(),
	isCompleted: m.bit().default(false),
	roomId: m
		.varchar()
		.notNull()
		.references(() => rooms.id, { onDelete: "cascade" }),
	...timestamps,
});

export type Story = InferSelectModel<typeof stories>;
export type NewStory = InferInsertModel<typeof stories>;

export const members = m.mssqlTable("members", {
	id: m
		.varchar()
		.primaryKey()
		.$defaultFn(() => uuid()),
	name: m.text().notNull(),
	roomId: m
		.varchar()
		.notNull()
		.references(() => rooms.id, { onDelete: "cascade" }),
	accessToken: m.text("access_token").notNull(),
	...timestamps,
});

export type Member = InferSelectModel<typeof members>;
export type NewMember = InferInsertModel<typeof members>;

export const votes = m.mssqlTable(
	"votes",
	{
		memberId: m
			.varchar()
			.notNull()
			.references(() => members.id, { onDelete: "cascade" }),
		storyId: m.varchar().notNull(),
		// TODO: .references(() => stories.id, { onDelete: "cascade" }),
		vote: m.int(),
		...timestamps,
	},
	t => [
		m.primaryKey({
			columns: [t.memberId, t.storyId],
		}),
	],
);

export type Vote = InferSelectModel<typeof votes>;
export type NewVote = InferInsertModel<typeof votes>;
