"use client";

import { useState } from "react";
import { ArrowRight, Clock, Loader2, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { MainNav } from "@/components/main-nav";
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
import { useAuth } from "@/contexts/auth-context";
import { useRooms } from "@/contexts/room-context";

const DashboardPage = () => {
	const { user, isLoading: authLoading } = useAuth();
	const { rooms } = useRooms();
	const router = useRouter();
	const [roomCode, setRoomCode] = useState("");
	const [name, setName] = useState(user?.name || "");

	// Redirect if not logged in
	if (!authLoading && !user) {
		router.push("/auth/login");
		return null;
	}

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "numeric",
			minute: "numeric",
		}).format(date);
	};

	const joinRoom = () => {
		if (roomCode) {
			router.push(`/room/${roomCode}`);
		}
	};

	const createRoom = () => {
		router.push("/room/new");
	};

	if (authLoading) {
		return (
			<>
				<MainNav />
				<div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
					<Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
				</div>
			</>
		);
	}

	return (
		<>
			<MainNav />
			<div className="container py-12">
				<div className="mx-auto max-w-6xl">
					<h1 className="mb-2 text-3xl font-bold">Welcome, {user?.name}</h1>
					<p className="text-muted-foreground mb-8">
						Manage your planning poker sessions
					</p>

					<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
						<div className="space-y-6 md:col-span-2">
							<Card>
								<CardHeader>
									<CardTitle>Recent Rooms</CardTitle>
									<CardDescription>
										Your recently visited planning poker rooms
									</CardDescription>
								</CardHeader>
								<CardContent>
									{rooms.length === 0 ? (
										<div className="text-muted-foreground py-6 text-center">
											<p>You haven&apos;t joined any rooms yet.</p>
											<p>Create or join a room to get started.</p>
										</div>
									) : (
										<div className="space-y-4">
											{rooms.map(room => (
												<div
													key={room.id}
													className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
												>
													<div className="space-y-1">
														<h3 className="font-medium">
															{room.name || `Room ${room.id}`}
														</h3>
														<div className="text-muted-foreground flex items-center gap-4 text-sm">
															<div className="flex items-center gap-1">
																<Clock className="h-3 w-3" />
																<span>
																	Last visited: {formatDate(room.lastVisited)}
																</span>
															</div>
															<div className="flex items-center gap-1">
																<Users className="h-3 w-3" />
																<span>{room.participants} participants</span>
															</div>
														</div>
													</div>
													<Button asChild size="sm" variant="ghost">
														<Link href={`/room/${room.id}`}>
															Join
															<ArrowRight className="ml-2 h-4 w-4" />
														</Link>
													</Button>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</div>

						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Join a Room</CardTitle>
									<CardDescription>
										Enter a room code to join an existing session
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="roomCode">Room Code</Label>
										<Input
											id="roomCode"
											placeholder="Enter room code"
											value={roomCode}
											onChange={e => setRoomCode(e.target.value)}
										/>
									</div>
								</CardContent>
								<CardFooter>
									<Button
										className="w-full"
										onClick={joinRoom}
										disabled={!roomCode}
									>
										Join Room
									</Button>
								</CardFooter>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Create a Room</CardTitle>
									<CardDescription>
										Start a new planning poker session
									</CardDescription>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground text-sm">
										Create a new room to start estimating with your team
									</p>
								</CardContent>
								<CardFooter>
									<Button
										className="w-full"
										onClick={createRoom}
										variant="outline"
									>
										<Plus className="mr-2 h-4 w-4" />
										Create New Room
									</Button>
								</CardFooter>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default DashboardPage;
