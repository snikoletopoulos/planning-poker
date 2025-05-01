import { createId } from "@paralleldrive/cuid2";
import { cookies } from "next/headers";

import { db } from "@/lib/db";
import { members, type Room } from "@/lib/db/schema";
import { createToken, parseToken } from "@/lib/jwt";

export const getCurrentUser = async (roomId: Room["id"]) => {
	const cookieStore = await cookies();
	const token = cookieStore.get(roomId.toString())?.value;
	if (!token) return null;
	return parseToken(token);
};

export const createNewUser = async (name: string, roomId: Room["id"]) => {
	const userId = createId();
	const newToken = createToken({ id: userId, name, roomId });

	const user = (
		await db
			.insert(members)
			.values({ id: userId, name, roomId, accessToken: newToken })
			.returning()
	)[0];

	const cookieStore = await cookies();
	cookieStore.set({
		name: roomId.toString(),
		value: newToken,
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
	});

	return user;
};
