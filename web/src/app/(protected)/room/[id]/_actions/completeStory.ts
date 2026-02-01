"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import * as z from "zod";

import { db } from "@/lib/db";
import { story as storyTable } from "@/lib/db/schemas/schema";
import { updateClients } from "@/services/live-update";

export const completeStoryAction = async (
	data: z.infer<typeof CompleteStoryInputSchema>,
) => {
	const result = await CompleteStoryInputSchema.safeParseAsync(data);
	if (!result.success) return { error: result.error.message };
	const { storyId } = result.data;

	const story = await db.query.story.findFirst({
		where: (story, { eq }) => eq(story.id, storyId),
		with: { votes: true },
	});

	if (!story) return { error: "Story not found" };
	if (story.votes.length === 0)
		return { error: "A Story needs votes to be completed" };

	await db
		.update(storyTable)
		.set({ isCompleted: true })
		.where(eq(storyTable.id, storyId));

	try {
		return await updateClients(null, "completeStory", { storyId });
	} catch (error) {
		console.error("Error updating live data: (completeStory)", error);
		revalidatePath(`/room/${story.roomId}`);
		if (error instanceof Error) return { error: error.message };
		return { error: "Error updating live data" };
	}
};

const CompleteStoryInputSchema = z.object({
	storyId: z
		.string()
		.trim()
		.refine(async storyId => {
			const story = await db.query.story.findFirst({
				where: (story, { eq }) => eq(story.id, storyId),
			});
			return !!story;
		}, "Story not found"),
});
