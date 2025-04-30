"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { addStory } from "../_actions/AddStory";
import { useRoom } from "./RoomContext";

export const StoriesSidebar = () => (
	<Tabs defaultValue="stories">
		<TabsList className="grid w-full grid-cols-2">
			<TabsTrigger value="stories">Stories</TabsTrigger>
			<TabsTrigger value="add">Add Story</TabsTrigger>
		</TabsList>

		<TabsContent value="stories" className="mt-4">
			<StoryList />
		</TabsContent>

		<TabsContent value="add" className="mt-4">
			<AddStory />
		</TabsContent>
	</Tabs>
);

const StoryList = () => {
	const { stories, activeStory, changeActiveStory } = useRoom();

	return (
		<Card>
			<CardContent className="space-y-2 p-4">
				{stories.map(story => (
					<div
						key={story.id}
						className={`hover:bg-muted cursor-pointer rounded-md p-3 ${activeStory.id === story.id ? "bg-muted border-border border" : ""}`}
						onClick={() => changeActiveStory(story.id)}
					>
						<h4 className="font-medium">{story.title}</h4>

						<p className="text-muted-foreground truncate text-sm">
							{story.description}
						</p>
					</div>
				))}
			</CardContent>
		</Card>
	);
};

const AddStory = () => {
	const { room } = useRoom();

	const {
		register,
		handleSubmit,
		formState: { isValid, isSubmitting, errors },
		setError,
	} = useForm({
		resolver: zodResolver(AddStorySchema),
	});

	const handleAddStory = handleSubmit(async data => {
		try {
			await addStory({ ...data, roomId: room.id });
		} catch (error) {
			console.log("[CREATE_ROOM:SUBMIT]", error);
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
