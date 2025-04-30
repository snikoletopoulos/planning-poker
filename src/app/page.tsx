import { Metadata } from "next";

import { JoinRoomForm } from "./_components/JoinRoomForm";

export const metadata: Metadata = {
	title: "Join | Planning Poker",
};

const HomePage = () => {
	const joinRoom = async () => {
		"use server";
		console.log("🪚 Join room");
	};

	return (
		<div className="bg-background flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
			<main className="w-full max-w-md space-y-8">
				<header className="text-center">
					<h1 className="text-foreground text-4xl font-bold tracking-tight">
						Planning Poker
					</h1>

					<p className="text-muted-foreground mt-3">
						Estimate your tasks collaboratively with your team
					</p>
				</header>

				<JoinRoomForm onSubmitAction={joinRoom} />

				<div className="text-muted-foreground text-center text-sm">
					<p>
						Plan better, estimate faster, and build consensus with your team
					</p>
				</div>
			</main>
		</div>
	);
};

export default HomePage;
