import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import type { Member, Room, Story, Vote } from "@/lib/db/schemas/schema";
import type { GenerateMetadata } from "@/types/components";
import { Header } from "./_components/Header";
import { Members } from "./_components/Members";
import { RoomProvider } from "./_components/RoomContext";
import { StoriesSidebar } from "./_components/StoriesSidebar";
import { VoteCard } from "./_components/VoteCard";

interface Params {
	id: string;
}

export const generateMetadata: GenerateMetadata<Params> = async ({
	params,
}): Promise<Metadata> => {
	const roomId = (await params).id;

	try {
		const { name } = await getRoomData(roomId);
		return { title: name };
	} catch {
		notFound();
	}
};

const RoomPage = async ({ params }: PageProps<"/room/[id]">) => {
	const roomId = (await params).id;

	let room;
	try {
		room = await getRoomData(roomId);
	} catch {
		notFound();
	}

	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return null;

	const stories = room.stories.reduce<
		(Story & { votes: (Vote & { vote: number | null })[] })[]
	>((acc, story) => {
		if (story.isCompleted) return [...acc, story];
		const hiddenVotes = hideVotes(story.votes, session.user.id);
		return [...acc, { ...story, votes: hiddenVotes }];
	}, []);

	room.stories = stories;

	return (
		<div className="container mx-auto mt-4 min-h-[calc(100vh-4rem)] bg-background">
			<div className="mx-auto max-w-6xl">
					<RoomProvider
						room={room}
						stories={room.stories}
						members={room.members.map(member => member.user)}
					>
						<Header />

						<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
							<div className="space-y-6 lg:col-span-2">
								<VoteCard />
								<Members />
							</div>

							<div>
								<StoriesSidebar />
							</div>
						</div>
					</RoomProvider>
			</div>
		</div>
	);
};

export default RoomPage;

const getRoomData = async (roomId: Room["id"]) => {
	const room = await db.query.room.findFirst({
		where: (room, { eq }) => eq(room.id, roomId),
		with: {
			members: {
				columns: {},
				with: { user: true },
			},
			stories: {
				with: { votes: true },
			},
		},
	});
	if (!room) throw new Error("Room not found");

	return room;
};

const hideVotes = (votes: Vote[], userId: Member["id"]) =>
	votes.map(vote => ({
		...vote,
		vote: vote.userId === userId ? vote.vote : null,
	}));
