"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import { db } from "@/lib/db";
import { story as storyTable } from "@/lib/db/schemas/schema";
import { updateClients } from "@/services/live-update";

export const createStoryAction = async (
	data: z.infer<typeof CreateStoryInputSchema>,
) => {
	const result = await CreateStoryInputSchema.safeParseAsync(data);
	if (!result.success) return { error: result.error.message };
	const { roomId, title, description } = result.data;

	const storiesResult = await db
		.insert(storyTable)
		.values({
			roomId,
			title,
			description,
			isCompleted: false,
		})
		.returning();
	if (!storiesResult[0]) return { error: "Story not found" };

	try {
		return await updateClients(null, "addStory", storiesResult[0]);
	} catch (error) {
		console.error("Error updating live data: (newStory)", error);
		revalidatePath(`/room/${roomId}`);
		if (error instanceof Error) return { error: error.message };
		return { error: "Error updating live data" };
	}
};

const CreateStoryInputSchema = z.object({
	roomId: z
		.string()
		.trim()
		.refine(async roomId => {
			const room = await db.query.room.findFirst({
				where: (room, { eq }) => eq(room.id, roomId),
			});
			return !!room;
		}, "Room not found"),
	title: z.string().trim().min(1, "Story title is required"),
	description: z.string().trim().nullable(),
});
