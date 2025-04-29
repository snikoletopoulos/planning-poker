"use client";

import { useState } from "react";
import { ArrowLeft, LogIn } from "lucide-react";
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

export default function JoinRoomPage() {
	const router = useRouter();
	const [roomCode, setRoomCode] = useState("");
	const [yourName, setYourName] = useState("");

	const joinRoom = () => {
		if (roomCode && yourName) {
			router.push(`/room/${roomCode}`);
		}
	};

	return (
		<div className="bg-background min-h-screen p-4">
			<div className="mx-auto max-w-md">
				<div className="mb-6 flex items-center justify-between">
					<Button variant="ghost" onClick={() => router.push("/")}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Home
					</Button>
					<ThemeToggle />
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Join a Planning Poker Room</CardTitle>
						<CardDescription>
							Enter the room code and your name to join
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="roomCode">Room Code</Label>
							<Input
								id="roomCode"
								value={roomCode}
								onChange={e => setRoomCode(e.target.value)}
								placeholder="Enter room code"
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
					</CardContent>
					<CardFooter>
						<Button
							onClick={joinRoom}
							className="w-full"
							disabled={!roomCode.trim() || !yourName.trim()}
						>
							<LogIn className="mr-2 h-4 w-4" />
							Join Room
						</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
