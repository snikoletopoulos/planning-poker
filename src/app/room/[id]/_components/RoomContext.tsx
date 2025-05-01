"use client";

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type PropsWithChildren,
} from "react";

import { USER_ID } from "@/data";
import type { Member, Room, Story, Vote } from "@/lib/db/schema";
import {
	completeStory as completeStoryAction,
	voteForStory,
} from "../_actions/stories";

interface StoryWithVotes extends Story {
	votes: Vote[];
}

interface RoomContextData {
	room: Room;
	stories: StoryWithVotes[];
	members: Member[];
	activeStory: StoryWithVotes;
	changeActiveStory: (storyId: Story["id"]) => void;
	selectedCard: number | "?" | null;
	selectCard: (card: number | "?" | null) => void;
	completeStory: () => void;
}

const RoomContext = createContext<RoomContextData | null>(null);

export const RoomProvider = ({
	room,
	stories,
	members,
	children,
}: PropsWithChildren<{
	room: Room;
	stories: StoryWithVotes[];
	members: Member[];
}>) => {
	const [activeStory, setActiveStory] = useState(stories[0]);
	const [selectedCard, setSelectedCard] = useState<number | "?" | null>(null);

	const changeActiveStory = useCallback(
		(storyId: Story["id"]) => {
			const story = stories.find(story => story.id === storyId);
			if (!story) throw new Error("Story not found");

			setActiveStory(story);

			const userVote = story.votes.find(vote => vote.memberId === USER_ID);
			console.log("🪚 userVote:", userVote);
			if (!userVote) {
				setSelectedCard(null);
				return;
			}
			setSelectedCard(userVote.vote ? +userVote.vote : "?");
		},
		[stories],
	);

	const selectCard = useCallback(
		async (card: number | "?" | null) => {
			setSelectedCard(card);
			await voteForStory({
				storyId: activeStory.id,
				vote: card === "?" ? null : card,
			});
		},
		[activeStory.id],
	);

	const completeStory = useCallback(
		async () => await completeStoryAction({ storyId: activeStory.id }),
		[activeStory.id],
	);

	const value = useMemo(
		() => ({
			room,
			stories,
			members,
			activeStory,
			changeActiveStory,
			selectedCard,
			selectCard,
			completeStory,
		}),
		[
			room,
			stories,
			members,
			activeStory,
			changeActiveStory,
			selectedCard,
			selectCard,
			completeStory,
		],
	);

	return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};

export const useRoom = () => {
	const context = useContext(RoomContext);

	if (!context) {
		throw new Error("useRoom must be used within a RoomProvider");
	}

	return context;
};
