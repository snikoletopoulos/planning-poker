"use server";

import { and, eq } from "drizzle-orm";

import { getCurrentUser } from "@/helpers/user";
import { db } from "@/lib/db";
import { stories, votes, type Room, type Story } from "@/lib/db/schema";
import { Updater } from "@/services/live-update";
import type { AddStoryData } from "../_components/StoriesSidebar";

export const addStory = async ({
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

	await Updater.newStory(result[0]);
};

export const completeStory = async ({ storyId }: { storyId: Story["id"] }) => {
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

	await Updater.completeStory(storyId);
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
	const user = await getCurrentUser(story.roomId);
	if (!user) throw new Error("Unauthorized");

	const existingVote = story.votes.find(vote => vote.memberId === user.id);
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
			memberId: user.id,
			storyId,
			vote: typeof vote === "number" ? vote : null,
		});
	}

	await Updater.userVoted(user.id, story.id);
};
