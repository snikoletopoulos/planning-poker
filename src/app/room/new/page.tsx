"use client";

import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewRoomPage() {
	const router = useRouter();
	const [roomName, setRoomName] = useState("");
	const [yourName, setYourName] = useState("");
	const [stories, setStories] = useState<
		{ title: string; description: string }[]
	>([{ title: "", description: "" }]);

	const addStory = () => {
		setStories([...stories, { title: "", description: "" }]);
	};

	const updateStory = (
		index: number,
		field: "title" | "description",
		value: string,
	) => {
		const updatedStories = [...stories];
		updatedStories[index][field] = value;
		setStories(updatedStories);
	};

	const removeStory = (index: number) => {
		if (stories.length > 1) {
			const updatedStories = [...stories];
			updatedStories.splice(index, 1);
			setStories(updatedStories);
		}
	};

	const createRoom = () => {
		// In a real app, you would create the room on the server
		// For now, we'll just generate a random room ID
		const roomId = Math.random().toString(36).substring(2, 8);
		router.push(`/room/${roomId}`);
	};

	return (
		<div className="bg-background min-h-screen p-4">
			<div className="mx-auto max-w-2xl">
				<div className="mb-6 flex items-center justify-between">
					<Button variant="ghost" onClick={() => router.push("/")}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Home
					</Button>
					<ThemeToggle />
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Create a New Planning Poker Room</CardTitle>
						<CardDescription>
							Set up your session and invite your team
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="roomName">Room Name</Label>
								<Input
									id="roomName"
									value={roomName}
									onChange={e => setRoomName(e.target.value)}
									placeholder="Sprint Planning"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="yourName">Your Name</Label>
								<Input
									id="yourName"
									value={yourName}
									onChange={e => setYourName(e.target.value)}
									placeholder="Enter your name"
								/>
							</div>
						</div>

						<div>
							<Label>Stories to Estimate</Label>
							<div className="mt-2 space-y-4">
								{stories.map((story, index) => (
									<div key={index} className="bg-muted rounded-md border p-4">
										<div className="mb-2 flex items-center justify-between">
											<h4 className="font-medium">Story {index + 1}</h4>
											{stories.length > 1 && (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => removeStory(index)}
													className="text-muted-foreground h-8 hover:text-red-500"
												>
													Remove
												</Button>
											)}
										</div>
										<div className="space-y-3">
											<div>
												<Label htmlFor={`story-title-${index}`}>Title</Label>
												<Input
													id={`story-title-${index}`}
													value={story.title}
													onChange={e =>
														updateStory(index, "title", e.target.value)
													}
													placeholder="User Authentication"
													className="mt-1"
												/>
											</div>
											<div>
												<Label htmlFor={`story-desc-${index}`}>
													Description
												</Label>
												<Textarea
													id={`story-desc-${index}`}
													value={story.description}
													onChange={e =>
														updateStory(index, "description", e.target.value)
													}
													placeholder="Implement user login and registration functionality"
													className="mt-1"
													rows={2}
												/>
											</div>
										</div>
									</div>
								))}

								<Button variant="outline" onClick={addStory} className="w-full">
									<Plus className="mr-2 h-4 w-4" />
									Add Another Story
								</Button>
							</div>
						</div>
					</CardContent>
					<CardFooter>
						<Button
							onClick={createRoom}
							className="w-full"
							disabled={!yourName.trim()}
						>
							Create Room
						</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
