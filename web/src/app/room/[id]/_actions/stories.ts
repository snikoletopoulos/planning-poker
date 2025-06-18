"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser, getUserToken } from "@/helpers/user";
import { db } from "@/lib/db";
import { stories, votes } from "@/lib/db/schema";
import { updateClients } from "@/services/live-update";

const AddStoryInputSchema = z.object({
	roomId: z
		.string()
		.trim()
		.refine(async roomId => {
			const room = await db.query.rooms.findFirst({
				where: (rooms, { eq }) => eq(rooms.id, roomId),
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
	if (!result.success) throw new Error(result.error.message);
	const { roomId, title, description } = result.data;

	const storiesResult = await db
		.insert(stories)
		.values({
			roomId,
			title,
			description,
			isCompleted: false,
		})
		.returning();

	if (!storiesResult[0]) throw new Error("Story not found");

	try {
		const token = await getUserToken(roomId);
		if (!token) throw new Error("Unauthorized");
		await updateClients(token, "addStory", {
			story: storiesResult[0],
		});
	} catch (error) {
		console.error("Error updating live data: (newStory)", error);
		revalidatePath(`/room/${roomId}`);
	}
};

const CompleteStoryInputSchema = z.object({
	storyId: z
		.string()
		.trim()
		.refine(async storyId => {
			const story = await db.query.stories.findFirst({
				where: (stories, { eq }) => eq(stories.id, storyId),
			});
			return !!story;
		}, "Story not found"),
});

export const completeStoryAction = async (
	data: z.infer<typeof CompleteStoryInputSchema>,
) => {
	const result = await CompleteStoryInputSchema.safeParseAsync(data);
	if (!result.success) throw new Error(result.error.message);
	const { storyId } = result.data;

	const story = await db.query.stories.findFirst({
		where: (stories, { eq }) => eq(stories.id, storyId),
		with: { votes: true },
	});

	if (!story) throw new Error("Story not found");
	if (story.votes.length === 0)
		throw new Error("A Story needs votes to be completed");

	await db
		.update(stories)
		.set({ isCompleted: true })
		.where(eq(stories.id, storyId));

	try {
		const token = await getUserToken(story.roomId);
		if (!token) throw new Error("Unauthorized");
		await updateClients(token, "completeStory", { storyId });
	} catch (error) {
		console.error("Error updating live data: (completeStory)", error);
		revalidatePath(`/room/${story.roomId}`);
	}
};

const UncompleteStoryInputSchema = z
	.string()
	.trim()
	.refine(async storyId => {
		const story = await db.query.stories.findFirst({
			where: (stories, { eq }) => eq(stories.id, storyId),
		});
		return !!story;
	}, "Story not found");

export const uncompleteStoryAction = async (
	data: z.infer<typeof UncompleteStoryInputSchema>,
) => {
	const result = await UncompleteStoryInputSchema.safeParseAsync(data);
	if (!result.success) throw new Error(result.error.message);
	const storyId = result.data;

	const story = db.transaction(tx => {
		const story = tx
			.update(stories)
			.set({ isCompleted: false })
			.where(eq(stories.id, storyId))
			.returning()
			.get();

		tx.delete(votes).where(eq(votes.storyId, storyId)).run();
		return story;
	});

	const token = await getUserToken(story.roomId);
	if (!token) throw new Error("Unauthorized");
	await updateClients(token, "uncompleteStory", { storyId });
};

const VoteForStoryInputSchema = z.object({
	storyId: z
		.string()
		.trim()
		.refine(async storyId => {
			const story = await db.query.stories.findFirst({
				where: (stories, { eq }) => eq(stories.id, storyId),
			});
			return !!story;
		}, "Story not found"),
	vote: z.number().nullable(),
});

export const voteForStoryAction = async (
	data: z.infer<typeof VoteForStoryInputSchema>,
) => {
	const result = await VoteForStoryInputSchema.safeParseAsync(data);
	if (!result.success) throw new Error(result.error.message);
	const { vote, storyId } = result.data;

	const story = await db.query.stories.findFirst({
		where: (stories, { eq }) => eq(stories.id, storyId),
		with: { votes: true },
	});

	if (!story) throw new Error("Story not found");
	if (story.isCompleted) throw new Error("Story is already completed");
	const currentUser = await getCurrentUser(story.roomId);
	if (!currentUser) throw new Error("Unauthorized");

	const existingVote = story.votes.find(
		vote => vote.memberId === currentUser.id,
	);
	if (existingVote) {
		await db
			.update(votes)
			.set({ vote: typeof vote === "number" ? vote : null })
			.where(
				and(
					eq(votes.memberId, existingVote.memberId),
					eq(votes.storyId, existingVote.storyId),
				),
			);
	} else {
		await db.insert(votes).values({
			memberId: currentUser.id,
			storyId,
			vote: typeof vote === "number" ? vote : null,
		});
	}

	try {
		const token = await getUserToken(story.roomId);
		if (!token) throw new Error("Unauthorized");
		await updateClients(token, "userVoted", {
			memberId: currentUser.id,
			storyId,
			// vote,
		});
	} catch (error) {
		console.error("Error updating live data: (userVoted)", error);
		revalidatePath(`/room/${story.roomId}`);
	}
};
