"use client";

import { useCurrentUser } from "@/components/CurrentUserProvider";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Card, CardContent } from "@/components/ui/Card";
import { useRoom } from "./RoomContext";

export const Members = () => {
	const currentUser = useCurrentUser();
	const { members, activeStory } = useRoom();

	const showVotes = activeStory.isCompleted;

	return (
		<Card>
			<CardContent className="p-6">
				<h3 className="mb-4 text-lg font-medium">Team Members</h3>

				<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
					{members.map(member => {
						const voteData = activeStory.votes.find(
							vote => vote.userId === member.id,
						);

						let vote: number | "?" | null = null;
						if (voteData) {
							vote = voteData.vote ?? "?";
						}

						const memberName = member.name
							.split(" ")
							.map((name, index) => (index === 0 ? name : `${name[0] ?? ""}.`))
							.join(" ");

						return (
							<div key={member.id} className="flex flex-col items-center">
								<div className="relative">
									<Avatar className="size-16">
										<AvatarFallback className="bg-muted text-muted-foreground">
											{showVotes
												? (vote ?? "X")
												: member.name.substring(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>

									{vote != null && !showVotes && (
										<div className="absolute -right-2 -bottom-2 flex size-8 items-center justify-center rounded-full border-2 border-border bg-muted text-sm font-bold text-muted-foreground">
											✓
										</div>
									)}
								</div>

								<span className="mt-2 text-sm font-medium">
									{memberName}
									{member.id === currentUser.id && " (You)"}
								</span>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
};
