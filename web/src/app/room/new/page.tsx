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

		const { roomId } = db.transaction(tx => {
			const roomsResult = tx
				.insert(rooms)
				.values({
					name: roomName,
					isActive: true,
					createdAt: new Date(),
				})
				.returning()
				.get();

			const roomId = roomsResult.id;
			if (!roomId) tx.rollback();

			const storiesData = stories.map(
				({ title, description }) =>
					({
						title,
						description: description ? description : "",
						roomId,
					}) satisfies NewStory,
			);

			tx.insert(storiesTable).values(storiesData).run();

			return { roomId };
		});

		const { user, token } = await createNewUser(name, roomId);

		try {
			await updateClients(token, "membersJoined", {
				roomId,
				member: user,
			});
		} catch (error) {
			console.error("Error updating live data: (createNewUser)", error);
			revalidatePath(`/room/${roomId}`);
		}

		return roomId;
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
