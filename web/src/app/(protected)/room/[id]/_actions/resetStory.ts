"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import * as z from "zod";

import { db } from "@/lib/db";
import {
	story as storyTable,
	vote as voteTable,
} from "@/lib/db/schemas/schema";
import { updateClients } from "@/services/live-update";

export const resetStoryAction = async (
	data: z.infer<typeof ResetStoryInputSchema>,
) => {
	const result = await ResetStoryInputSchema.safeParseAsync(data);
	if (!result.success) return { error: result.error.message };
	const storyId = result.data;

	const story = await db.transaction(async tx => {
		const storyPromise = tx
			.update(storyTable)
			.set({ isCompleted: false })
			.where(eq(storyTable.id, storyId))
			.returning();

		await tx.delete(voteTable).where(eq(voteTable.storyId, storyId));
		return (await storyPromise)[0];
	});

	try {
		return await updateClients(null, "uncompleteStory", { storyId });
	} catch (error) {
		console.error("Error updating live data: (uncompleteStory)", error);
		revalidatePath(`/room/${story?.roomId ?? ""}`);
		if (error instanceof Error) return { error: error.message };
		return { error: "Error updating live data" };
	}
};

const ResetStoryInputSchema = z
	.string()
	.trim()
	.refine(async storyId => {
		const story = await db.query.story.findFirst({
			where: (story, { eq }) => eq(story.id, storyId),
		});
		return !!story;
	}, "Story not found");
