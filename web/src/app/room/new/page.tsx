import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import { createNewUser } from "@/helpers/user";
import { db } from "@/lib/db";
import { rooms, stories as storiesTable, type NewStory } from "@/lib/db/schema";
import { updateClients } from "@/services/live-update";
import {
	CreateRoomForm,
	type CreateRoomFormData,
} from "./_components/CreateRoomForm";

export const metadata: Metadata = {
	title: "Create room",
};

const NewRoomPage = () => {
	const createRoom = async ({
		name,
		roomName,
		stories,
	}: CreateRoomFormData) => {
		"use server";

		const { room, token, user } = await db.transaction(async tx => {
			const roomsResult = await tx
				.insert(rooms)
				.values({
					name: roomName,
					isActive: true,
					createdAt: new Date(),
				})
				.returning();

			const room = roomsResult[0];
			if (!room) tx.rollback();

			const { user, token } = await createNewUser(name, room!.id, tx);

			const storiesData = stories.map(
				({ title, description }) =>
					({
						title,
						description: description ? description : "",
						roomId: room!.id,
					}) satisfies NewStory,
			);

			await tx.insert(storiesTable).values(storiesData);

			return { room: room!, user, token };
		});

		try {
			await updateClients(token, "membersJoined", {
				roomId: room.id,
				member: user,
			});
		} catch (error) {
			console.error("Error updating live data: (createNewUser)", error);
			revalidatePath(`/room/${room.id}`);
		}

		return room.id;
	};

	return (
		<div className="bg-background mx-auto min-h-screen max-w-2xl p-4">
			<Button asChild variant="ghost">
				<Link className="mb-6" href="/">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Join a room
				</Link>
			</Button>

			<Card>
				<CardHeader>
					<CardTitle>Create a New Planning Poker Room</CardTitle>
					<CardDescription>
						Set up your session and invite your team
					</CardDescription>
				</CardHeader>

				<CreateRoomForm onSubmitAction={createRoom} />
			</Card>
		</div>
	);
};

export default NewRoomPage;
