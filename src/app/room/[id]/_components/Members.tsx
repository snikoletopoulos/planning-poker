"use client";

import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Card, CardContent } from "@/components/ui/Card";
import { useRoom } from "./RoomContext";

export const Members = () => {
	const { members, activeStory } = useRoom();
	const showVotes = activeStory.isCompleted;

	return (
		<Card>
			<CardContent className="p-6">
				<h3 className="mb-4 text-lg font-medium">Team Members</h3>

				<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
					{members.map(member => {
						const vote = activeStory.votes.find(
							v => v.memberId === member.id,
						)?.vote;

						return (
							<div key={member.id} className="flex flex-col items-center">
								<div className="relative">
									<Avatar className="h-16 w-16">
										<AvatarFallback className="bg-muted text-muted-foreground">
											{member.name.substring(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>

									{vote && (
										<div
											className={`absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
												showVotes
													? "bg-primary/20 text-primary border-primary/30 border-2"
													: "bg-muted text-muted-foreground border-border border-2"
											}`}
										>
											{showVotes ? vote : "✓"}
										</div>
									)}
								</div>

								<span className="mt-2 text-sm font-medium">
									{member.name}
									{/* TODO */}
									{/* {member.id === user?.id && " (You)"} */}
								</span>

								{showVotes && vote && (
									<span className="text-primary mt-1 text-sm font-medium">
										Voted: {vote}
									</span>
								)}
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
};
