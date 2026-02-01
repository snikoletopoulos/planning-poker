import type { Metadata } from "next";

import { joinRoomAction } from "@/app/(protected)/_actions/JoinRoom";
import { JoinRoomForm } from "@/components/JoinRoomForm";

export const metadata: Metadata = {
	title: "Join | Planning Poker",
};

const HomePage = () => (
	<div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background p-4">
		<main className="w-full max-w-md space-y-8">
			<header className="text-center">
				<h1 className="text-4xl font-bold tracking-tight text-foreground">
					Planning Poker
				</h1>

				<p className="mt-3 text-muted-foreground">
					Estimate your tasks collaboratively with your team
				</p>
			</header>

			<JoinRoomForm onSubmitAction={joinRoomAction} />

			<div className="text-center text-sm text-muted-foreground">
				<p>Plan better, estimate faster, and build consensus with your team</p>
			</div>
		</main>
	</div>
);

export default HomePage;
