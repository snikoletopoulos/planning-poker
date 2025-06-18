import type { Member, Room, Story } from "@/lib/db/schema";

interface UpdaterData {
	userVoted: {
		memberId: Member["id"];
		storyId: Story["id"];
		vote: number | null;
	};
	addStory: Story;
	completeStory: {
		storyId: Story["id"];
	};
	uncompleteStory: {
		storyId: Story["id"];
	};
	membersJoined: {
		member: Pick<Member, "id" | "name">;
		roomId: Room["id"];
	};
}

export const updateClients = async <TEvent extends keyof UpdaterData>(
	token: string,
	event: TEvent,
	data: UpdaterData[TEvent],
) => {
	const result = await fetch(
		`${process.env.UPDATER_INTERNAL_URL}${updaterEndpoint[event]}`,
		{
			method: "POST",
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify(data),
		},
	);
	if (result.ok) return null;

	try {
		const response = await result.text();
		return { error: `Error updating live data: ${response}` };
	} catch (error) {
		if (error instanceof Error) return { error: error.message };
		return { error: "Error updating live data" };
	}
};

const updaterEndpoint = {
	userVoted: "/vote",
	addStory: "/story",
	completeStory: "/reveal-story",
	uncompleteStory: "/unreveal-story",
	membersJoined: "/join",
} satisfies Record<keyof UpdaterData, string>;
