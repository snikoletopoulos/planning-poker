"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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

export const JoinRoomForm = ({
	onSubmitAction,
}: {
	onSubmitAction: (data: z.infer<typeof JoinRoomSchema>) => Promise<void>;
}) => {
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { isValid, isSubmitting, errors },
		setError,
	} = useForm({
		resolver: zodResolver(JoinRoomSchema),
	});

	const handleJoinRoom = handleSubmit(async data => {
		try {
			const result = await onSubmitAction(data);

			// TODO: Register user for room
			// router.push(`/room/${result.room.id}`);
		} catch (error) {
			console.log("[CREATE_ROOM:SUBMIT]", error);
			setError("root", { message: "Internal server error" });
		}
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Join a Session</CardTitle>

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
				<Button variant="outline" asChild>
					<Link href="/room/new">
						Create Room
						<ArrowRight className="ml-2 h-4 w-4" />
					</Link>
				</Button>

				<Button onClick={handleJoinRoom} disabled={!isValid || isSubmitting}>
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
