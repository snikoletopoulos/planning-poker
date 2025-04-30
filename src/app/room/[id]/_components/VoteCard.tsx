"use client";

import { ArrowRightIcon, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useRoom } from "./RoomContext";

const cardValues = [1, 2, 3, 5, 8, 13, 21, "?"] as const;

export const VoteCard = () => {
	const { activeStory, selectedCard, setSelectedCard, completeStory } =
		useRoom();
	const showVotes = activeStory.isCompleted;

	return (
		<Card>
			<CardContent className="p-6">
				<div className="mb-4">
					<h2 className="text-xl font-semibold">{activeStory.title}</h2>
					<p className="text-muted-foreground mt-1">
						{activeStory.description}
					</p>
				</div>

				<div className="mt-6">
					<h3 className="text-muted-foreground mb-3 text-sm font-medium">
						Select your estimate:
					</h3>

					<div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
						{cardValues.map(value => (
							<button
								key={value}
								onClick={() => setSelectedCard(value)}
								disabled={!!showVotes}
								className={`flex aspect-[2/3] items-center justify-center rounded-lg border-2 text-lg font-bold transition-all ${
									selectedCard === value
										? "border-primary bg-primary/10 text-primary -translate-y-1 transform shadow-md"
										: "border-border hover:border-primary/50 hover:bg-muted"
								}`}
							>
								{value}
							</button>
						))}
					</div>
				</div>

				<div className="mt-8 flex justify-center gap-8">
					<Button
						onClick={completeStory}
						// TODO
						disabled={selectedCard == null || !!showVotes}
					>
						{showVotes ? (
							<>
								<EyeOff className="mr-2 h-5 w-5" />
								Revealed
							</>
						) : (
							<>
								<Eye className="mr-2 h-5 w-5" />
								Reveal Cards
							</>
						)}
					</Button>

					<Button variant="outline">
						Next story
						<ArrowRightIcon className="ml-2 h-5 w-5" />
					</Button>
				</div>

				{showVotes && <Summary />}
			</CardContent>
		</Card>
	);
};

const Summary = () => {
	const { activeStory, members } = useRoom();

	const calculateAverage = () => {
		const numericVotes = activeStory.votes
			.filter(({ vote }) => vote !== null && vote !== "?")
			.map(({ vote }) => +vote)
			.filter(vote => !isNaN(vote));

		if (numericVotes.length === 0) return "N/A";

		const sum = numericVotes.reduce((acc, vote) => acc + vote, 0);
		return (sum / numericVotes.length).toFixed(1);
	};

	return (
		<div className="bg-muted border-border mt-8 rounded-lg border p-4">
			<h3 className="mb-4 text-center font-medium">Results</h3>

			<div className="flex items-center justify-center space-x-4">
				<div className="text-center">
					<div className="text-muted-foreground text-sm">Average</div>

					<div className="text-2xl font-bold">{calculateAverage()}</div>
				</div>

				<div className="text-center">
					<div className="text-muted-foreground text-sm">Consensus</div>

					<div className="text-2xl font-bold">
						{new Set(members.map(p => p.vote).filter(Boolean)).size === 1
							? "Yes"
							: "No"}
					</div>
				</div>
			</div>
		</div>
	);
};
