import { relations } from "drizzle-orm";

import { account, session, user } from "./auth-schema";
import { member, room, story, vote } from "./schema";

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	rooms: many(room),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const roomRelations = relations(room, ({ many }) => ({
	stories: many(story),
	members: many(member),
}));

export const storyRelations = relations(story, ({ many, one }) => ({
	votes: many(vote),
	room: one(room, {
		fields: [story.roomId],
		references: [room.id],
	}),
}));

export const memberRelations = relations(member, ({ one }) => ({
	room: one(room, {
		fields: [member.roomId],
		references: [room.id],
	}),
	user: one(user, {
		fields: [member.userId],
		references: [user.id],
	}),
}));

export const voteRelations = relations(vote, ({ one }) => ({
	user: one(user, {
		fields: [vote.userId],
		references: [user.id],
	}),
	story: one(story, {
		fields: [vote.storyId],
		references: [story.id],
	}),
}));

// export const relations = defineRelations({ ...schema, ...authSchema }, r => ({
// 	user: {
// 		sessions: r.many.session(),
// 		accounts: r.many.account(),
// 		rooms: r.many.room({
// 			from: r.user.id.through(r.member.userId),
// 			to: r.room.id.through(r.member.roomId),
// 		}),
// 	},
// 	session: {
// 		user: r.one.user({ from: r.session.userId, to: r.user.id }),
// 	},
// 	account: {
// 		user: r.one.user({ from: r.account.userId, to: r.user.id }),
// 	},
//
// 	rooms: {
// 		stories: r.many.story(),
// 		members: r.many.user(),
// 	},
// 	stories: {
// 		votes: r.many.vote(),
// 		room: r.one.room({
// 			from: r.story.roomId,
// 			to: r.room.id,
// 			// optional: false,
// 		}),
// 	},
// 	members: {
// 		room: r.one.room({ from: r.member.roomId, to: r.room.id }),
// 		votes: r.many.vote(),
// 	},
// 	votes: {
// 		members: r.one.member({ from: r.vote.memberId, to: r.member.id }),
// 		stories: r.one.story({ from: r.vote.storyId, to: r.story.id }),
// 	},
// }));
