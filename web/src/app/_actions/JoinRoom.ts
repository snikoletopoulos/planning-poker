"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

import { createNewUser } from "@/helpers/user";
import { db } from "@/lib/db";
import { updateClients } from "@/services/live-update";

const JoinRoomInputSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	roomCode: z.string().trim().min(1, "Room code is required"),
});

export const joinRoomAction = async (
	data: z.infer<typeof JoinRoomInputSchema>,
) => {
	const result = JoinRoomInputSchema.safeParse(data);
	if (!result.success) {
		throw new Error(result.error.message);
	}
	const { name, roomCode } = result.data;

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

	const { user, token: newToken } = await createNewUser(name, room.id);

	try {
		await updateClients(newToken, "membersJoined", {
			roomId: roomCode,
			member: user,
		});
	} catch (error) {
		console.error("Error updating live data: (createNewUser)", error);
		revalidatePath(`/room/${roomCode}`);
	}

	return room.id;
};
