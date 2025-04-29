import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";

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

const HomePage = () => (
	<>
		<MainNav />
		<div className="bg-background flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<h1 className="text-foreground text-4xl font-bold tracking-tight">
						Planning Poker
					</h1>
					<p className="text-muted-foreground mt-3">
						Estimate your tasks collaboratively with your team
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Join a Session</CardTitle>
						<CardDescription>
							Enter a room code or create a new room
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="roomCode">Room Code</Label>
							<Input id="roomCode" placeholder="Enter room code" />
						</div>
						<div className="space-y-2">
							<Label htmlFor="name">Your Name</Label>
							<Input id="name" placeholder="Enter your name" />
						</div>
					</CardContent>
					<CardFooter className="flex justify-between">
						<Button variant="outline" asChild>
							<Link href="/room/new">
								Create Room
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
						<Button asChild>
							<Link href="/room/join">
								Join Room
								<Users className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</CardFooter>
				</Card>

				<div className="text-muted-foreground text-center text-sm">
					<p>
						Plan better, estimate faster, and build consensus with your team
					</p>
				</div>
			</div>
		</div>
	</>
);

export default HomePage;
