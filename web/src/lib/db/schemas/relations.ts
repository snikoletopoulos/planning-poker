import { defineRelations } from "drizzle-orm";

import * as schema from "./schema";

export const relations = defineRelations(schema, r => ({
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
