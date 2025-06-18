"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type PropsWithChildren,
} from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { toast } from "sonner";
import { z } from "zod";

import { useCurrentUser } from "@/components/CurrentUserProvider";
import { getWsToken } from "@/helpers/ws";
import type { Member, Room, Story, Vote } from "@/lib/db/schema";
import { completeStoryAction, voteForStoryAction } from "../_actions/stories";

interface StoryWithVotes extends Story {
	votes: Vote[];
}

interface RoomContextData {
	room: Room;
	stories: StoryWithVotes[];
	members: Pick<Member, "id" | "name">[];
	activeStory: StoryWithVotes;
	changeActiveStory: (storyId: Story["id"]) => void;
	selectedCard: number | "?" | null;
	selectCard: (card: number | "?" | null) => void;
	completeStory: () => void;
	isLiveUpdating: boolean;
	nextStory: () => void;
}

const RoomContext = createContext<RoomContextData | null>(null);

export const RoomProvider = ({
	room,
	stories: initialStories,
	members: initialMembers,
	children,
	authToken,
}: PropsWithChildren<{
	room: Room;
	stories: StoryWithVotes[];
	members: Pick<Member, "id" | "name">[];
	authToken: string;
}>) => {
	const currentUser = useCurrentUser();

	const [stories, setStories] = useState(initialStories);
	const [members, setMembers] = useState(initialMembers);

	const [activeStoryIndex, setActiveStoryIndex] = useState(() => {
		const index = stories.findIndex(story => !story.isCompleted);
		return index === -1 ? 0 : index;
	});
	const activeStory = stories[activeStoryIndex];
	const [selectedCard, setSelectedCard] = useState<number | "?" | null>(() => {
		const userVote = activeStory?.votes.find(
			vote => vote.memberId === currentUser.id,
		);
		if (!userVote) return null;
		return userVote.vote ? +userVote.vote : "?";
	});
	const [isLiveUpdating, setIsLiveUpdating] = useState(false);

	useEffect(() => {
		const story = stories[activeStoryIndex];
		if (!story) throw new Error("Story not found");

		const userVote = story.votes.find(vote => vote.memberId === currentUser.id);
		if (!userVote) {
			setSelectedCard(null);
			return;
		}
		setSelectedCard(userVote.vote != null ? +userVote.vote : "?");
	}, [stories, activeStoryIndex, currentUser.id]);

	const selectCard = useCallback(
		async (card: number | "?" | null) => {
			if (!activeStory) return;
			setSelectedCard(card);
			const result = await voteForStoryAction({
				storyId: activeStory.id,
				vote: card === "?" ? null : card,
			});
			if (result) toast.error(result.error);
		},
		[activeStory],
	);

	const completeStory = useCallback(async () => {
		if (!activeStory) return;
		const result = await completeStoryAction({ storyId: activeStory.id });
		if (result) toast.error(result.error);
	}, [activeStory]);

	const getWsUrl = useCallback(async () => {
		const token = await getWsToken(authToken);
		return `${process.env.NEXT_PUBLIC_UPDATER_WS_URL}?token=${encodeURIComponent(token)}`;
	}, [authToken]);

	const { lastJsonMessage, readyState, sendJsonMessage } = useWebSocket(
		getWsUrl,
		{
			retryOnError: true,
			shouldReconnect: () => true,
			onOpen: () => setIsLiveUpdating(true),
			onClose: () => setIsLiveUpdating(false),
			onError: error => console.error("[WEBSOCKET]", error),
		},
	);

	const nextStory = useCallback(() => {
		if (readyState !== ReadyState.OPEN) return;
		sendJsonMessage({ action: "next_story" });
	}, [sendJsonMessage, readyState]);

	useEffect(() => {
		if (!lastJsonMessage) return;
		const data = WsEventSchema.parse(lastJsonMessage);
		switch (data.action) {
			case "self_voted": {
				setStories(stories => {
					const story = stories.find(story => story.id === data.storyId);
					if (!story) return stories;
					const exitingVoteIndex = story.votes.findIndex(
						vote => vote.memberId === currentUser.id,
					);

					if (exitingVoteIndex === -1) {
						story.votes.push({
							vote: data.vote,
							storyId: data.storyId,
							memberId: currentUser.id,
							createdAt: new Date(),
						});
					} else {
						story.votes[exitingVoteIndex]!.vote = data.vote;
					}

					return [...stories];
				});
				setSelectedCard(data.vote ?? "?");
				break;
			}
			case "user_voted": {
				if (data.memberId === currentUser.id) return;
				setStories(stories => {
					const story = stories.find(story => story.id === data.storyId);
					if (!story) return stories;
					const exitingVoteIndex = story.votes.findIndex(
						vote => vote.memberId === data.memberId,
					);

					if (exitingVoteIndex === -1) {
						story.votes.push({
							vote: null,
							storyId: data.storyId,
							memberId: data.memberId,
							createdAt: new Date(),
						});
					}

					return [...stories];
				});
				break;
			}
			case "reveal_story": {
				setStories(stories => {
					const story = stories.find(story => story.id === data.storyId);
					if (!story) return stories;

					story.votes = data.votes.map(story => ({
						...story,
						createdAt: new Date(story.createdAt),
					}));

					story.isCompleted = true;

					return [...stories];
				});
				toast("Story revealed");
				break;
			}
			case "unreveal_story": {
				setStories(stories => {
					const story = stories.find(story => story.id === data.storyId);
					if (!story) return stories;

					story.votes = [];
					story.isCompleted = false;

					return [...stories];
				});
				toast("Story is restarted");
				break;
			}
			case "member_joined": {
				setMembers(members => [...members, data.member]);
				break;
			}
			case "new_story": {
				setStories(stories => [
					...stories,
					{
						...data.story,
						createdAt: new Date(data.story.createdAt),
						votes: [],
					},
				]);
				break;
			}
			case "next_story": {
				setActiveStoryIndex(prevIndex => prevIndex + 1);
				toast("Moving to next story");
				break;
			}
		}
	}, [lastJsonMessage, currentUser.id]);

	const changeActiveStory = useCallback(
		(storyId: Story["id"]) => {
			const storyIndex = stories.findIndex(story => story.id === storyId);
			if (storyIndex === -1) return;
			setActiveStoryIndex(storyIndex);
		},
		[stories],
	);

	const value = useMemo(() => {
		if (!activeStory) return null;
		return {
			room,
			stories,
			members,
			activeStory,
			changeActiveStory,
			selectedCard,
			selectCard,
			completeStory,
			isLiveUpdating,
			nextStory,
		};
	}, [
		room,
		stories,
		members,
		activeStory,
		changeActiveStory,
		selectedCard,
		selectCard,
		completeStory,
		isLiveUpdating,
		nextStory,
	]);

	if (!value) return null;

	return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};

export const useRoom = () => {
	const context = useContext(RoomContext);

	if (!context) {
		throw new Error("useRoom must be used within a RoomProvider");
	}

	return context;
};

const WsEventSchema = z.discriminatedUnion("action", [
	z.object({
		action: z.literal("self_voted"),
		storyId: z.string(),
		vote: z.number().nullable(),
	}),
	z.object({
		action: z.literal("user_voted"),
		storyId: z.string(),
		memberId: z.string(),
	}),
	z.object({
		action: z.literal("reveal_story"),
		storyId: z.string(),
		votes: z.array(
			z.object({
				vote: z.number().nullable(),
				memberId: z.string(),
				createdAt: z.string(),
				storyId: z.string(),
			} satisfies Record<keyof Vote, z.ZodTypeAny>),
		),
	}),
	z.object({
		action: z.literal("unreveal_story"),
		storyId: z.string(),
	}),
	z.object({
		action: z.literal("member_joined"),
		member: z.object({
			id: z.string(),
			name: z.string(),
		}),
	}),
	z.object({
		action: z.literal("new_story"),
		story: z.object({
			id: z.string(),
			title: z.string(),
			description: z.string(),
			isCompleted: z.boolean(),
			roomId: z.string(),
			createdAt: z.string(),
		}),
	}),
	z.object({ action: z.literal("next_story") }),
]);
