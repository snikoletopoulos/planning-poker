"use client";

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type PropsWithChildren,
} from "react";

import type { Member, Room, Story, Vote } from "@/lib/db/schema";

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
	setSelectedCard: (card: number | "?" | null) => void;
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

			// TODO: set selectedCard if story is completed
			setSelectedCard(null);
		},
		[stories],
	);

	const completeStory = useCallback(() => {}, []);

	stories[0].isCompleted = true;

	const value = useMemo(
		() => ({
			room,
			stories,
			members,
			activeStory,
			changeActiveStory,
			selectedCard,
			setSelectedCard,
			completeStory,
		}),
		[
			room,
			stories,
			members,
			activeStory,
			changeActiveStory,
			selectedCard,
			setSelectedCard,
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
