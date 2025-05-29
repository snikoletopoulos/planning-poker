"use client";

import { ArrowRightIcon, Eye, EyeOff, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/styles/utils";
import { uncompleteStoryAction } from "../_actions/stories";
import { useRoom } from "./RoomContext";

const CARD_VALUES = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, "?"] as const;

export const VoteCard = () => {
	const { activeStory, selectedCard, selectCard, completeStory, nextStory } =
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

					<div className="flex flex-wrap justify-center gap-2">
						{CARD_VALUES.map(value => (
							<button
								key={value}
								onClick={() => selectCard(value)}
								disabled={!!showVotes}
								className={cn(
									"border-border flex aspect-[2/3] h-28 items-center justify-center rounded-lg border-2 text-lg font-bold transition-all",
									{
										"border-primary bg-primary/10 text-primary -translate-y-1 transform shadow-md":
											selectedCard === value,
										"hover:border-primary/50 hover:bg-muted":
											!activeStory.isCompleted && selectedCard !== value,
										"bg-muted text-muted-foreground": activeStory.isCompleted,
									},
								)}
							>
								{value}
							</button>
						))}
					</div>
				</div>

				<div className="mt-8 flex justify-center gap-8">
					{activeStory.isCompleted ? (
						<Button onClick={() => uncompleteStoryAction(activeStory.id)}>
							<RefreshCcw className="h-5 w-5" />
							Repoker story
						</Button>
					) : (
						<Button
							onClick={completeStory}
							disabled={!!showVotes || activeStory.votes.length === 0}
						>
							{showVotes ? (
								<>
									<EyeOff className="h-5 w-5" />
									Revealed
								</>
							) : (
								<>
									<Eye className="h-5 w-5" />
									Reveal Cards
								</>
							)}
						</Button>
					)}

					<Button
						variant="outline"
						onClick={nextStory}
						disabled={!activeStory.isCompleted}
					>
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
	const { activeStory } = useRoom();

	const calculateAverage = () => {
		const numericVotes = activeStory.votes.reduce((acc, { vote }) => {
			if (vote == null) return acc;
			if (isNaN(+vote)) return acc;
			acc.push(+vote);
			return acc;
		}, [] as number[]);

		if (numericVotes.length === 0) return "N/A";

		const sum = numericVotes.reduce((acc, vote) => acc + vote, 0);
		return (sum / numericVotes.length).toFixed(1);
	};

	const calculateDifference = () => {
		const votes = activeStory.votes.map(({ vote }) => vote);

		if (votes.length === 0) return "N/A";

		const { min, max } = votes.reduce(
			(acc, vote) => {
				if (vote == null) return acc;

				const voteNumber = +vote;
				if (isNaN(voteNumber)) return acc;

				if (voteNumber < acc.min) acc.min = voteNumber;
				if (voteNumber > acc.max) acc.max = voteNumber;

				return acc;
			},
			{ min: Infinity, max: -Infinity },
		);

		return max - min;
	};

	return (
		<div className="bg-muted border-border mt-8 rounded-lg border p-4">
			<h3 className="mb-4 text-center font-medium">Results</h3>

			<div className="flex items-center justify-center space-x-4">
				<div className="text-center">
					<p className="text-muted-foreground text-sm">Average</p>
					<p className="text-2xl font-bold">{calculateAverage()}</p>
				</div>

				<div className="text-center">
					<p className="text-muted-foreground text-sm">Consensus</p>
					<p className="text-2xl font-bold">{calculateDifference()}</p>
				</div>
			</div>
		</div>
	);
};
