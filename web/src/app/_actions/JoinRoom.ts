"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import * as z from "zod";

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { member } from "@/lib/db/schemas/schema";
import { updateClients } from "@/services/live-update";

const JoinRoomInputSchema = z.object({
	roomCode: z.string().trim().min(1, "Room code is required"),
});

export const joinRoomAction = async (
	data: z.infer<typeof JoinRoomInputSchema>,
) => {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return { error: "You must be logged in to join a room" };

	const result = JoinRoomInputSchema.safeParse(data);
	if (!result.success) return { error: result.error.message };
	const { roomCode } = result.data;

	const room = await db.query.room.findFirst({
		where: (room, { eq }) => eq(room.id, roomCode),
		with: { members: true },
	});
	if (!room) return { error: "Room not found" };

	db.insert(member).values({ roomId: room.id, userId: session.user.id });

	try {
		const result = await updateClients(newToken, "membersJoined", {
			roomId: roomCode,
			member: session.user,
		});
		if (result) return result;
	} catch (error) {
		console.error("Error updating live data: (createNewUser)", error);
		revalidatePath(`/room/${roomCode}`);
		if (error instanceof Error) return { error: error.message };
		return { error: "Error updating live data" };
	}

	redirect(`/room/${room.id}`);
};
