import type { Member, Room, Story } from "@/lib/db/schema";

export class Updater {
	static url = `${process.env.NEXT_PUBLIC_HTTP_PROTOCOL}://${process.env.NEXT_PUBLIC_WS_URI}`;

	static async userVoted(
		memberId: Member["id"],
		storyId: Story["id"],
		vote: number | null,
	) {
		await fetch(`${this.url}/vote`, {
			method: "POST",
			body: JSON.stringify({ memberId, storyId, vote }),
		});
	}

	static async addStory(story: Story) {
		await fetch(`${this.url}/story`, {
			method: "POST",
			body: JSON.stringify(story),
		});
	}

	static async completeStory(storyId: Story["id"]) {
		await fetch(`${this.url}/reveal-story`, {
			method: "POST",
			body: JSON.stringify({ storyId }),
		});
	}

	static async membersJoined(
		member: Pick<Member, "id" | "name">,
		roomId: Room["id"],
	) {
		await fetch(`${this.url}/join`, {
			method: "POST",
			body: JSON.stringify({ member, roomId }),
		});
	}
}
