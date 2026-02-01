"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import * as z from "zod";

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import {
	story as storyTable,
	vote as voteTable,
} from "@/lib/db/schemas/schema";
import { updateClients } from "@/services/live-update";

const AddStoryInputSchema = z.object({
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

export const addStoryAction = async (
	data: z.infer<typeof AddStoryInputSchema>,
) => {
	const result = await AddStoryInputSchema.safeParseAsync(data);
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

const UncompleteStoryInputSchema = z
	.string()
	.trim()
	.refine(async storyId => {
		const story = await db.query.story.findFirst({
			where: (story, { eq }) => eq(story.id, storyId),
		});
		return !!story;
	}, "Story not found");

export const uncompleteStoryAction = async (
	data: z.infer<typeof UncompleteStoryInputSchema>,
) => {
	const result = await UncompleteStoryInputSchema.safeParseAsync(data);
	if (!result.success) return { error: result.error.message };
	const storyId = result.data;

	const story = await db.transaction(async tx => {
		const storyPromise =  tx
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

const VoteForStoryInputSchema = z.object({
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

export const voteForStoryAction = async (
	data: z.infer<typeof VoteForStoryInputSchema>,
) => {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return { error: "Unauthorized" };
	const userId = session.user.id;

	const result = await VoteForStoryInputSchema.safeParseAsync(data);
	if (!result.success) return { error: result.error.message };
	const { vote, storyId } = result.data;

	const story = await db.query.story.findFirst({
		where: (story, { eq }) => eq(story.id, storyId),
		with: { votes: true },
	});

	if (!story) return { error: "Story not found" };
	if (story.isCompleted) return { error: "Story is already completed" };

	const existingVote = story.votes.find(vote => vote.userId === userId);
	if (existingVote) {
		await db
			.update(voteTable)
			.set({ vote: typeof vote === "number" ? vote : null })
			.where(
				and(
					eq(voteTable.userId, existingVote.userId),
					eq(voteTable.storyId, existingVote.storyId),
				),
			);
	} else {
		await db.insert(voteTable).values({
			userId,
			storyId,
			vote: typeof vote === "number" ? vote : null,
		});
	}

	try {
		return await updateClients(null, "userVoted", {
			userId,
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
