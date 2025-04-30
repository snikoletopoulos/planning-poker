"use server";

import { db } from "@/lib/db";
import { stories, type Room } from "@/lib/db/schema";
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
