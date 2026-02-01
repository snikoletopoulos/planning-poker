import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import * as z from "zod";

import { Button } from "@/components/ui/Button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import {
	member,
	room,
	story as storiesTable,
	type NewStory,
} from "@/lib/db/schemas/schema";
import { updateClients } from "@/services/live-update";
import { CreateRoomForm } from "./_components/CreateRoomForm";

export const metadata: Metadata = {
	title: "Create room",
};

const CreateRoomInputSchema = z.object({
	name: z.string().trim().min(1, "Room name is required"),
	stories: z.array(
		z.object({
			title: z.string().trim().min(1, "Story title is required"),
			description: z.string().trim(),
		}),
	),
});

const NewRoomPage = () => {
	const createRoom = async (data: z.infer<typeof CreateRoomInputSchema>) => {
		"use server";

		const session = await auth.api.getSession({ headers: await headers() });
		if (!session) return { error: "You must be logged in to join a room" };

		const result = CreateRoomInputSchema.safeParse(data);
		if (!result.success) return { error: result.error.message };
		const { name, stories } = result.data;

		const { roomId } = await db.transaction(async tx => {
			const rooms = await tx.insert(room).values({ name }).returning();

			const roomId = rooms[0]?.id;
			if (!roomId) return tx.rollback();

			const storiesData = stories.map(
				({ title, description }) =>
					({ title, description, roomId }) satisfies NewStory,
			);

			await tx.insert(storiesTable).values(storiesData).execute();

			return { roomId };
		});

		await db.insert(member).values({ roomId, userId: session.user.id });

		try {
			const result = await updateClients(null, "userJoined", {
				roomId,
				user: session.user,
			});
			if (result) return result;
		} catch (error) {
			console.error("Error updating live data: (createNewUser)", error);
			revalidatePath(`/room/${roomId}`);
			if (error instanceof Error) return { error: error.message };
			return { error: "Error updating live data" };
		}

		redirect(`/room/${roomId}`);
	};

	return (
		<div className="mx-auto min-h-screen max-w-2xl bg-background p-4">
			<Button asChild variant="ghost">
				<Link className="mb-6" href="/">
					<ArrowLeft className="mr-2 size-4" />
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
