"use server";

import { and, eq } from "drizzle-orm";

import { USER_ID } from "@/data";
import { db } from "@/lib/db";
import { stories, votes, type Room, type Story } from "@/lib/db/schema";
import type { AddStoryData } from "../_components/StoriesSidebar";

export const addStory = async ({
	roomId,
	title,
	description,
}: AddStoryData & { roomId: Room["id"] }) => {
	await db.insert(stories).values({
		roomId,
		title,
		description,
		isCompleted: false,
	});
};

export const completeStory = async ({ storyId }: { storyId: Story["id"] }) => {
	await db
		.update(stories)
		.set({ isCompleted: true })
		.where(eq(stories.id, storyId));
};

export const voteForStory = async ({
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

	const existingVote = story.votes.find(vote => vote.memberId === USER_ID);
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
		return;
	}

	await db.insert(votes).values({
		memberId: USER_ID,
		storyId,
		vote: typeof vote === "number" ? vote : null,
	});
};
