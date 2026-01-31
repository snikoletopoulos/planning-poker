import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import * as m from "drizzle-orm/mssql-core";

import { id, timestamps } from "../helpers";

export const room = m.mssqlTable("rooms", {
	id,
	name: m.text().notNull(),
	...timestamps,
});

export type Room = InferSelectModel<typeof room>;
export type NewRoom = InferInsertModel<typeof room>;

export const story = m.mssqlTable("stories", {
	id,
	title: m.text().notNull(),
	description: m.text(),
	isCompleted: m.bit().default(false),
	roomId: m
		.varchar()
		.notNull()
		.references(() => room.id, { onDelete: "cascade" }),
	...timestamps,
});

export type Story = InferSelectModel<typeof story>;
export type NewStory = InferInsertModel<typeof story>;

export const member = m.mssqlTable("members", {
	id,
	name: m.text().notNull(),
	roomId: m
		.varchar()
		.notNull()
		.references(() => rooms.id, { onDelete: "cascade" }),
	accessToken: m.text("access_token").notNull(),
	...timestamps,
});

export type Member = InferSelectModel<typeof member>;
export type NewMember = InferInsertModel<typeof member>;

export const vote = m.mssqlTable(
	"votes",
	{
		memberId: m
			.varchar()
			.notNull()
			.references(() => member.id, { onDelete: "cascade" }),
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

export type Vote = InferSelectModel<typeof vote>;
export type NewVote = InferInsertModel<typeof vote>;
