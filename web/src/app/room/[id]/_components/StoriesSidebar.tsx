"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { cn } from "@/lib/styles/utils";
import { addStoryAction } from "../_actions/stories";
import { useRoom } from "./RoomContext";

export const StoriesSidebar = () => {
	const [activeTab, setActiveTab] = useState("stories");

	return (
		<Tabs defaultValue="stories" value={activeTab} onValueChange={setActiveTab}>
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="stories">Stories</TabsTrigger>
				<TabsTrigger value="add">Add Story</TabsTrigger>
			</TabsList>

			<TabsContent value="stories" className="mt-4">
				<StoryList />
			</TabsContent>

			<TabsContent value="add" className="mt-4">
				<AddStory onComplete={() => setActiveTab("stories")} />
			</TabsContent>
		</Tabs>
	);
};

const StoryList = () => {
	const { stories, activeStory, changeActiveStory } = useRoom();

	return (
		<Card>
			<CardContent className="space-y-4 p-4">
				{stories.map(story => {
					const calculateAverage = () => {
						const numericVotes = story.votes.reduce((acc, { vote }) => {
							if (vote == null) return acc;
							if (isNaN(+vote)) return acc;
							acc.push(+vote);
							return acc;
						}, [] as number[]);

						if (numericVotes.length === 0) return "N/A";

						const sum = numericVotes.reduce((acc, vote) => acc + vote, 0);
						return (sum / numericVotes.length).toFixed(1);
					};

					return (
						<button
							key={story.id}
							className={cn(
								"flex w-full cursor-pointer items-center justify-between rounded-md p-3",
								{
									"bg-primary text-primary-foreground border-border border":
										activeStory.id === story.id,
									"hover:bg-muted": activeStory.id !== story.id,
									"bg-muted": !activeStory.isCompleted && story.isCompleted,
								},
							)}
							onClick={() => changeActiveStory(story.id)}
						>
							<div>
								<h4 className="font-medium">{story.title}</h4>

								<p className="text-muted-foreground truncate text-sm">
									{story.description}
								</p>
							</div>

							{story.isCompleted && <p>{calculateAverage()}</p>}
						</button>
					);
				})}
			</CardContent>
		</Card>
	);
};

const AddStory = ({ onComplete }: { onComplete: () => void }) => {
	const { room } = useRoom();

	const {
		register,
		handleSubmit,
		formState: { isValid, isSubmitting, errors },
		setError,
		reset,
	} = useForm({
		resolver: zodResolver(AddStorySchema),
	});

	const handleAddStory = handleSubmit(async data => {
		try {
			await addStoryAction({ ...data, roomId: room.id });
			reset();
			onComplete();
		} catch (error) {
			console.error("[CREATE_ROOM:SUBMIT]", error);
			setError("root", { message: "Internal server error" });
		}
	});

	return (
		<Card>
			<CardContent className="space-y-4 p-4">
				<form onSubmit={handleAddStory} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="story-title">Story Title</Label>
						<Input
							id="story-title"
							{...register("title")}
							placeholder="Enter story title"
						/>
						{errors.title && (
							<p className="text-sm text-red-500">{errors.title.message}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="story-description">Description</Label>
						<Input
							id="story-description"
							{...register("description")}
							placeholder="Enter description"
						/>
						{errors.description && (
							<p className="text-sm text-red-500">
								{errors.description.message}
							</p>
						)}
					</div>

					<Button className="w-full" disabled={!isValid || isSubmitting}>
						<Plus className="mr-2 h-4 w-4" />
						Add Story
					</Button>
				</form>
			</CardContent>
		</Card>
	);
};

const AddStorySchema = z.object({
	title: z.string().min(1, "Story title is required"),
	description: z.string(),
});

export type AddStoryData = z.infer<typeof AddStorySchema>;
