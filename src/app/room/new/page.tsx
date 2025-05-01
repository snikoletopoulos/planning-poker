import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import { db } from "@/lib/db";
import {
	members,
	rooms,
	stories as storiesTable,
	type NewStory,
} from "@/lib/db/schema";
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

		return await db.transaction(async tx => {
			const roomsResult = await tx
				.insert(rooms)
				.values({
					name: roomName,
					isActive: true,
					createdAt: new Date(),
				})
				.returning();

			if (!roomsResult[0]) tx.rollback();

			const usersResult = await tx
				.insert(members)
				.values({
					name,
					roomId: roomsResult[0].id,
					accessToken: "123456",
				})
				.returning();

			if (!usersResult[0]) tx.rollback();

			const storiesData = stories.map(
				({ title, description }) =>
					({
						title,
						description: description ? description : "",
						roomId: roomsResult[0].id,
					}) satisfies NewStory,
			);

			await tx.insert(storiesTable).values(storiesData);

			return { room: roomsResult[0], user: usersResult[0] };
		});
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
