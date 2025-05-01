import { createId } from "@paralleldrive/cuid2";
import {
	relations,
	type InferInsertModel,
	type InferSelectModel,
} from "drizzle-orm";
import { int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const rooms = sqliteTable("rooms", {
	id: text()
		.primaryKey()
		.$defaultFn(() => createId()),
	name: text().notNull(),
	createdAt: int({ mode: "timestamp" }).notNull().defaultNow(),
	isActive: int({ mode: "boolean" }).default(true),
});

export type Room = InferSelectModel<typeof rooms>;
export type NewRoom = InferInsertModel<typeof rooms>;

export const roomRelations = relations(rooms, ({ many }) => ({
	stories: many(stories),
	members: many(members),
}));

export const stories = sqliteTable("stories", {
	id: text()
		.primaryKey()
		.$defaultFn(() => createId()),
	title: text().notNull(),
	description: text(),
	createdAt: int({ mode: "timestamp" }).notNull().defaultNow(),
	isCompleted: int({ mode: "boolean" }).default(false),
	roomId: text()
		.notNull()
		.references(() => rooms.id),
});

export type Story = InferSelectModel<typeof stories>;
export type NewStory = InferInsertModel<typeof stories>;

export const storyRelations = relations(stories, ({ many, one }) => ({
	votes: many(votes),
	room: one(rooms, {
		fields: [stories.roomId],
		references: [rooms.id],
	}),
}));

export const members = sqliteTable("members", {
	id: text()
		.primaryKey()
		.$defaultFn(() => createId()),
	name: text().notNull(),
	roomId: text()
		.notNull()
		.references(() => rooms.id),
	accessToken: text().notNull(),
	createdAt: int({ mode: "timestamp" }).notNull().defaultNow(),
});

export type Member = InferSelectModel<typeof members>;
export type NewMember = InferInsertModel<typeof members>;

export const memberRelations = relations(members, ({ many, one }) => ({
	rooms: one(rooms, {
		fields: [members.roomId],
		references: [rooms.id],
	}),
	votes: many(votes),
}));

export const votes = sqliteTable(
	"votes",
	{
		memberId: text()
			.notNull()
			.references(() => members.id),
		storyId: text()
			.notNull()
			.references(() => stories.id),
		vote: int(),
		createdAt: int({ mode: "timestamp" }).notNull().defaultNow(),
	},
	t => [primaryKey({ columns: [t.memberId, t.storyId] })],
);

export type Vote = InferSelectModel<typeof votes>;
export type NewVote = InferInsertModel<typeof votes>;

export const voteRelations = relations(votes, ({ one }) => ({
	members: one(members, {
		fields: [votes.memberId],
		references: [members.id],
	}),
	stories: one(stories, {
		fields: [votes.storyId],
		references: [stories.id],
	}),
}));
