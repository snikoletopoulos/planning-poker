import type { Metadata } from "next";
import { cookies } from "next/headers";

import { createNewUser } from "@/helpers/user";
import { db } from "@/lib/db";
import {
	JoinRoomForm,
	type JoinRoomFormData,
} from "./_components/JoinRoomForm";

export const metadata: Metadata = {
	title: "Join | Planning Poker",
};

const HomePage = () => {
	const joinRoom = async ({ name, roomCode }: JoinRoomFormData) => {
		"use server";
		const room = await db.query.rooms.findFirst({
			where: (rooms, { eq }) => eq(rooms.id, roomCode),
			with: { members: true },
		});
		if (!room) throw new Error("Room not found");

		const cookieStore = await cookies();
		const token = cookieStore.get(room.id)?.value;
		if (token) {
			const user = room.members.find(member => member.accessToken === token);
			if (!user) throw new Error("User not found");
			return room.id;
		}

		await createNewUser(name, room.id);

		return room.id;
	};

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

				<JoinRoomForm onSubmitAction={joinRoom} />

				<div className="text-muted-foreground text-center text-sm">
					<p>
						Plan better, estimate faster, and build consensus with your team
					</p>
				</div>
			</main>
		</div>
	);
};

export default HomePage;
