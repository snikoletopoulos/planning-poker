import { defineRelations } from "drizzle-orm";

import * as authSchema from "./auth-schema";
import * as schema from "./schema";

export const relations = defineRelations({ ...schema, ...authSchema }, r => ({
	user: {
		sessions: r.many.session(),
		accounts: r.many.account(),
	},
	session: {
		user: r.one.user({ from: r.session.userId, to: r.user.id }),
	},
	account: {
		user: r.one.user({ from: r.account.userId, to: r.user.id }),
	},

	rooms: {
		stories: r.many.story(),
		members: r.many.user(),
	},
	stories: {
		votes: r.many.vote(),
		room: r.one.room({
			from: r.story.roomId,
			to: r.room.id,
			// optional: false,
		}),
	},
	members: {
		room: r.one.room({ from: r.member.roomId, to: r.room.id }),
		votes: r.many.vote(),
	},
	votes: {
		members: r.one.member({ from: r.vote.memberId, to: r.member.id }),
		stories: r.one.story({ from: r.vote.storyId, to: r.story.id }),
	},
}));
