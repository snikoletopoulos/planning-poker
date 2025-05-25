import { notFound } from "next/navigation";

import { CurrentUserProvider } from "@/components/CurrentUserProvider";
import { getCurrentUser } from "@/helpers/user";
import { db } from "@/lib/db";
import type { Room, Story, Vote } from "@/lib/db/schema";
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

	let room;
	try {
		room = await getRoomData(roomId);
	} catch {
		notFound();
	}

	return {
		title: room.name,
	};
};

const RoomPage = async ({ params }: PageProps<Params>) => {
	const roomId = (await params).id;

	let room;
	try {
		room = await getRoomData(roomId);
	} catch {
		notFound();
	}

	const user = await getCurrentUser(room.id);
	if (!user) notFound();

	return (
		<div className="bg-background container mx-auto mt-4 min-h-[calc(100vh-4rem)]">
			<div className="mx-auto max-w-6xl">
				<CurrentUserProvider user={user}>
					<RoomProvider
						room={room}
						stories={room.stories}
						members={room.members}
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

	const user = await getCurrentUser(room.id);
	if (!user) throw new Error("Unauthorized");

	const stories = room.stories.reduce(
		(acc, story) => {
			if (story.isCompleted) return [...acc, story];

			const votes = story.votes.map(vote => ({
				...vote,
				vote: vote.memberId === user.id ? vote.vote : null,
			}));
			return [...acc, { ...story, votes }];
		},
		[] as (Story & { votes: (Vote & { vote: number | null })[] })[],
	);

	return {
		...room,
		stories,
	};
};
