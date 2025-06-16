"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getCurrentUser, getUserToken } from "@/helpers/user";
import { db } from "@/lib/db";
import { stories, votes, type Room, type Story } from "@/lib/db/schema";
import { updateClients } from "@/services/live-update";
import type { AddStoryData } from "../_components/StoriesSidebar";

// TODO: validate data

export const addStoryAction = async ({
	roomId,
	title,
	description,
}: AddStoryData & { roomId: Room["id"] }) => {
	const result = await db
		.insert(stories)
		.values({
			roomId,
			title,
			description,
			isCompleted: false,
		})
		.returning();

	if (!result[0]) throw new Error("Story not found");

	try {
		const token = await getUserToken(roomId);
		if (!token) throw new Error("Unauthorized");
		await updateClients(token, "addStory", {
			story: result[0],
		});
	} catch (error) {
		console.error("Error updating live data: (newStory)", error);
		revalidatePath(`/room/${roomId}`);
	}
};

export const completeStoryAction = async ({
	storyId,
}: {
	storyId: Story["id"];
}) => {
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

export const uncompleteStoryAction = async (storyId: Story["id"]) => {
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

export const voteForStoryAction = async ({
	storyId,
	vote,
}: {
	storyId: Story["id"];
	vote: number | null;
}) => {
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
			vote,
		});
	} catch (error) {
		console.error("Error updating live data: (userVoted)", error);
		revalidatePath(`/room/${story.roomId}`);
	}
};
