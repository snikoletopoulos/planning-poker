"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type PropsWithChildren,
} from "react";
import { z } from "zod";

import { useCurrentUser } from "@/components/CurrentUserProvider";
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
}: PropsWithChildren<{
	room: Room;
	stories: StoryWithVotes[];
	members: Pick<Member, "id" | "name">[];
}>) => {
	const currentUser = useCurrentUser();
	const ws = useRef<WebSocket | null>(null);

	const [stories, setStories] = useState(initialStories);
	const [members, setMembers] = useState(initialMembers);

	const [activeStory, setActiveStory] = useState(
		() => stories.find(story => !story.isCompleted) ?? stories[0],
	);
	const [selectedCard, setSelectedCard] = useState<number | "?" | null>(() => {
		const userVote = activeStory.votes.find(
			vote => vote.memberId === currentUser.id,
		);
		if (!userVote) return null;
		return userVote.vote ? +userVote.vote : "?";
	});
	const [isLiveUpdating, setIsLiveUpdating] = useState(false);

	const changeActiveStory = useCallback(
		(storyId: Story["id"]) => {
			const story = stories.find(story => story.id === storyId);
			if (!story) throw new Error("Story not found");

			setActiveStory(story);

			const userVote = story.votes.find(
				vote => vote.memberId === currentUser.id,
			);
			if (!userVote) {
				setSelectedCard(null);
				return;
			}
			setSelectedCard(userVote.vote ? +userVote.vote : "?");
		},
		[stories, currentUser],
	);

	const selectCard = useCallback(
		async (card: number | "?" | null) => {
			setSelectedCard(card);
			await voteForStoryAction({
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

	const nextStory = useCallback(() => {
		if (!ws.current) return;
		ws.current.send(JSON.stringify({ action: "next_story" }));
	}, []);

	useEffect(() => {
		const socket = new WebSocket(
			`${process.env.NEXT_PUBLIC_WS_PROTOCOL}://${process.env.NEXT_PUBLIC_WS_URI}`,
			["Authentication", "test"],
		);

		socket.addEventListener("open", () => setIsLiveUpdating(true));
		socket.addEventListener("close", () => setIsLiveUpdating(false));
		socket.addEventListener("error", error => {
			console.error("WebSocket Error", error);
			setIsLiveUpdating(false);
			socket.send("leave");
			socket.close();
		});

		socket.addEventListener("message", event => {
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

			const data = WsEventSchema.parse(JSON.parse(event.data as string));
			console.log("🪚 data:", data);

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
							story.votes[exitingVoteIndex].vote = data.vote;
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
					const nextStory = stories.find(story => !story.isCompleted);
					if (!nextStory) return;
					changeActiveStory(nextStory.id);
					break;
				}
			}
		});

		ws.current = socket;

		return () => {
			if (socket.readyState !== WebSocket.OPEN) return;
			socket.send(JSON.stringify({ action: "leave" }));
			socket.close();
		};
	}, [currentUser.id]);

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
			isLiveUpdating,
			nextStory,
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
			isLiveUpdating,
			nextStory,
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
