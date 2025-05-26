import type { Member, Room, Story } from "@/lib/db/schema";

interface UpdaterData {
	userVoted: {
		memberId: Member["id"];
		storyId: Story["id"];
		vote: number | null;
	};
	addStory: {
		story: Story;
	};
	completeStory: {
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
	await fetch(
		`${process.env.NEXT_PUBLIC_HTTP_PROTOCOL}://${process.env.NEXT_PUBLIC_WS_URI}${updaterEndpoint[event]}`,
		{
			method: "POST",
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify(data),
		},
	);
};

const updaterEndpoint = {
	userVoted: "/vote",
	addStory: "/story",
	completeStory: "/reveal-story",
	membersJoined: "/join",
} satisfies Record<keyof UpdaterData, string>;
