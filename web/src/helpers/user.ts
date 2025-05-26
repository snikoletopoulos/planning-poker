import { createId } from "@paralleldrive/cuid2";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { db } from "@/lib/db";
import { members, type Room } from "@/lib/db/schema";
import { createToken, parseToken } from "@/lib/jwt";
import { updateClients } from "@/services/live-update";
import type { Transaction } from "@/types/db";

export const getUserToken = async (roomId: Room["id"]) => {
	const cookieStore = await cookies();
	return cookieStore.get(roomId)?.value;
};

export const getCurrentUser = async (roomId: Room["id"]) => {
	const token = await getUserToken(roomId);
	if (!token) return null;
	return parseToken(token);
};

// TODO
export const createNewUser = async (
	name: string,
	roomId: Room["id"],
	tx: Transaction = db,
) => {
	const userId = createId();
	const newToken = createToken({ id: userId, name, roomId });

	const user = (
		await tx
			.insert(members)
			.values({ id: userId, name, roomId, accessToken: newToken })
			.returning()
	)[0];

	const cookieStore = await cookies();
	cookieStore.set({
		name: roomId,
		value: newToken,
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
	});

	try {
		await updateClients(newToken, "membersJoined", { roomId, member: user });
	} catch (error) {
		console.error("Error updating live data: (createNewUser)", error);
		revalidatePath(`/room/${roomId}`);
	}

	return user;
};
