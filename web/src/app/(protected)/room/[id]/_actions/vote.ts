"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import * as z from "zod";

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import {
	vote as voteTable,
} from "@/lib/db/schemas/schema";
import { updateClients } from "@/services/live-update";

export const voteAction = async (data: z.infer<typeof VoteInputSchema>) => {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return { error: "Unauthorized" };

	const result = await VoteInputSchema.safeParseAsync(data);
	if (!result.success) return { error: result.error.message };
	const { vote, storyId } = result.data;

	const story = await db.query.story.findFirst({
		where: (story, { eq }) => eq(story.id, storyId),
		with: { votes: true },
	});

	if (!story) return { error: "Story not found" };
	if (story.isCompleted) return { error: "Story is already completed" };

	await db
		.insert(voteTable)
		.values({
			userId: session.user.id,
			storyId,
			vote: typeof vote === "number" ? vote : null,
		})
		.onConflictDoUpdate({
			target: [voteTable.userId, voteTable.storyId],
			set: { vote: typeof vote === "number" ? vote : null },
		});

	try {
		return await updateClients(null, "userVoted", {
			userId: session.user.id,
			storyId,
			vote,
		});
	} catch (error) {
		console.error("Error updating live data: (userVoted)", error);
		revalidatePath(`/room/${story.roomId}`);
		if (error instanceof Error) return { error: error.message };
		return { error: "Error updating live data" };
	}
};

const VoteInputSchema = z.object({
	storyId: z
		.string()
		.trim()
		.refine(async storyId => {
			const story = await db.query.story.findFirst({
				where: (story, { eq }) => eq(story.id, storyId),
			});
			return !!story;
		}, "Story not found"),
	vote: z.number().nullable(),
});
