import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";

import { id, timestamps } from "../helpers";
import { user } from "./auth-schema";

export const room = p.pgTable("rooms", {
	id,
	name: p.text().notNull(),
	...timestamps,
});

export type Room = InferSelectModel<typeof room>;
export type NewRoom = InferInsertModel<typeof room>;

export const story = p.pgTable("stories", {
	id,
	title: p.text().notNull(),
	description: p.text(),
	isCompleted: p.boolean().default(false),
	roomId: p
		.varchar()
		.notNull()
		.references(() => room.id, { onDelete: "cascade" }),
	...timestamps,
});

export type Story = InferSelectModel<typeof story>;
export type NewStory = InferInsertModel<typeof story>;

export const member = p.pgTable("members", {
	id,
	roomId: p
		.varchar()
		.notNull()
		.references(() => room.id, { onDelete: "cascade" }),
	userId: p
		.varchar()
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	...timestamps,
});

export type Member = InferSelectModel<typeof member>;
export type NewMember = InferInsertModel<typeof member>;

export const vote = p.pgTable(
	"votes",
	{
		userId: p
			.varchar()
			.notNull()
			.references(() => member.id, { onDelete: "cascade" }),
		storyId: p
			.varchar()
			.notNull()
			.references(() => story.id, { onDelete: "cascade" }),
		vote: p.integer(),
		...timestamps,
	},
	t => [
		p.primaryKey({
			columns: [t.userId, t.storyId],
		}),
	],
);

export type Vote = InferSelectModel<typeof vote>;
export type NewVote = InferInsertModel<typeof vote>;
