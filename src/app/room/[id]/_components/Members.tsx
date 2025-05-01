"use client";

import { useCurrentUser } from "@/components/CurrentUserProvider";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/styles/utils";
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
							v => v.memberId === member.id,
						);

						let vote: number | "?" | null = null;
						if (voteData) {
							vote = voteData.vote ?? "?";
						}

						return (
							<div key={member.id} className="flex flex-col items-center">
								<div className="relative">
									<Avatar className="h-16 w-16">
										<AvatarFallback className="bg-muted text-muted-foreground">
											{showVotes
												? (vote ?? "X")
												: member.name.substring(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>

									{vote && !showVotes && (
										<div
											className={cn(
												"absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
												showVotes
													? "bg-primary/20 text-primary border-primary/30 border-2"
													: "bg-muted text-muted-foreground border-border border-2",
											)}
										>
											✓
										</div>
									)}
								</div>

								<span className="mt-2 text-sm font-medium">
									{member.name}
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
