"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import type { Room } from "@/lib/db/schema";

export const JoinRoomForm = ({
	onSubmitAction,
	roomName,
	roomCode,
}: {
	onSubmitAction: (
		data: z.infer<typeof JoinRoomSchema>,
	) => Promise<{ error: string }>;
	roomName?: string;
	roomCode?: Room["id"];
}) => {
	const {
		register,
		handleSubmit,
		formState: { isValid, isSubmitting, errors },
		setError,
	} = useForm({
		resolver: zodResolver(JoinRoomSchema),
		defaultValues: {
			name: "",
			roomCode: roomCode ?? "",
		},
	});

	const handleJoinRoom = handleSubmit(async data => {
		try {
			const result = await onSubmitAction(data);
			toast.error(result.error);
		} catch (error) {
			console.error("[JOIN_ROOM:SUBMIT]", error);
			setError("root", { message: "Internal server error" });
		}
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Join {roomName ?? "a Room"}</CardTitle>

				<CardDescription>
					Enter a room code or create a new room
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="room-code">Room Code</Label>
					<Input
						id="room-code"
						{...register("roomCode")}
						disabled={!!roomCode}
						placeholder="Enter room code"
					/>
					{errors.roomCode && (
						<p className="text-sm text-red-500">{errors.roomCode.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="name">Your Name</Label>
					<Input
						id="name"
						{...register("name")}
						placeholder="Enter your name"
					/>
					{errors.name && (
						<p className="text-sm text-red-500">{errors.name.message}</p>
					)}
				</div>
			</CardContent>

			<CardFooter className="flex justify-between">
				{!roomCode && (
					<Button variant="outline" asChild>
						<Link href="/room/new">
							Create Room
							<ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>
				)}

				<Button
					className="ml-auto"
					onClick={handleJoinRoom}
					disabled={!isValid || isSubmitting}
				>
					Join Room
					<Users className="ml-2 h-4 w-4" />
				</Button>
			</CardFooter>
		</Card>
	);
};

const JoinRoomSchema = z.object({
	roomCode: z.string().min(1, "Room code is required"),
	name: z.string().min(1, "Name is required"),
});
