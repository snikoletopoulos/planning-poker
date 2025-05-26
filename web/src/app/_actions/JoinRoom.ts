"use server";

import { cookies } from "next/headers";

import type { JoinRoomFormData } from "@/components/JoinRoomForm";
import { createNewUser } from "@/helpers/user";
import { db } from "@/lib/db";

export const joinRoomAction = async ({ name, roomCode }: JoinRoomFormData) => {
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
