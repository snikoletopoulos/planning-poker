import { notFound } from "next/navigation";

import { db } from "@/lib/db";
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

	return (
		<div className="bg-background min-h-[calc(100vh-4rem)] p-4">
			<div className="mx-auto max-w-6xl">
				<RoomProvider room={room} stories={room.stories} members={room.members}>
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

const getRoomData = async (roomId: string) => {
	const room = await db.query.rooms.findFirst({
		where: (rooms, { eq }) => eq(rooms.id, +roomId),
		with: {
			members: true,
			stories: {
				with: { votes: true },
			},
		},
	});

	if (!room) throw new Error("Room not found");

	return room;
};
