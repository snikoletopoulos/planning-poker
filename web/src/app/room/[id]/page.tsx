import { notFound } from "next/navigation";

import { joinRoomAction } from "@/app/_actions/JoinRoom";
import { CurrentUserProvider } from "@/components/CurrentUserProvider";
import { JoinRoomForm } from "@/components/JoinRoomForm";
import { getCurrentUser, getUserToken } from "@/helpers/user";
import { db } from "@/lib/db";
import type { Member, Room, Story, Vote } from "@/lib/db/schema";
import type { GenerateMetadata, PageProps } from "@/types/components";
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
}) => {
	const roomId = (await params).id;

	try {
		const room = await getRoomData(roomId);
		return { title: room.name };
	} catch {
		notFound();
	}
};

const RoomPage = async ({ params }: PageProps<Params>) => {
	const roomId = (await params).id;

	let room;
	try {
		room = await getRoomData(roomId);
	} catch {
		notFound();
	}

	const currentUser = await getCurrentUser(roomId);
	if (!currentUser) {
		return (
			<div className="bg-background flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
				<main className="w-full max-w-md space-y-8">
					<header className="text-center">
						<h1 className="text-foreground text-4xl font-bold tracking-tight">
							Planning Poker
						</h1>

						<p className="text-muted-foreground mt-3">
							Estimate your tasks collaboratively with your team
						</p>
					</header>

					<JoinRoomForm
						roomName={room.name}
						roomCode={room.id}
						onSubmitAction={joinRoomAction}
					/>

					<div className="text-muted-foreground text-center text-sm">
						<p>
							Plan better, estimate faster, and build consensus with your team
						</p>
					</div>
				</main>
			</div>
		);
	}

	const stories = room.stories.reduce(
		(acc, story) => {
			if (story.isCompleted) return [...acc, story];
			const hiddenVotes = hideVotes(story.votes, currentUser.id);
			return [...acc, { ...story, votes: hiddenVotes }];
		},
		[] as (Story & { votes: (Vote & { vote: number | null })[] })[],
	);

	room.stories = stories;

	const authToken = await getUserToken(roomId);
	if (!authToken) return null;

	return (
		<div className="bg-background container mx-auto mt-4 min-h-[calc(100vh-4rem)]">
			<div className="mx-auto max-w-6xl">
				<CurrentUserProvider user={currentUser}>
					<RoomProvider
						room={room}
						stories={room.stories}
						members={room.members}
						authToken={authToken}
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
				</CurrentUserProvider>
			</div>
		</div>
	);
};

export default RoomPage;

const getRoomData = async (roomId: Room["id"]) => {
	const room = await db.query.rooms.findFirst({
		where: (rooms, { eq }) => eq(rooms.id, roomId),
		with: {
			members: {
				columns: {
					id: true,
					name: true,
				},
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
		vote: vote.memberId === userId ? vote.vote : null,
	}));
