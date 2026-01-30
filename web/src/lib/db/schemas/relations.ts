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
		stories: r.many.stories(),
		members: r.many.members(),
	},
	stories: {
		votes: r.many.votes(),
		room: r.one.rooms({
			from: r.stories.roomId,
			to: r.rooms.id,
			// optional: false,
		}),
	},
	members: {
		room: r.one.rooms({ from: r.members.roomId, to: r.rooms.id }),
		votes: r.many.votes(),
	},
	votes: {
		members: r.one.members({ from: r.votes.memberId, to: r.members.id }),
		stories: r.one.stories({ from: r.votes.storyId, to: r.stories.id }),
	},
}));
