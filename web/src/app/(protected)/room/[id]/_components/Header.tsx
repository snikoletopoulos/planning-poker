"use client";

import { DoorOpen, Users } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/styles/utils";
import { useRoom } from "./RoomContext";

export const Header = () => {
	const { room, members, isLiveUpdating } = useRoom();

	return (
		<header className="mb-8 flex items-center justify-between">
			<div>
				<h1 className="text-3xl font-bold text-foreground">{room.name}</h1>
				<div className="mt-2 flex items-center">
					<Badge
						variant="outline"
						className={cn("mr-2", {
							"bg-green-500 dark:bg-green-900": isLiveUpdating,
							"bg-red-600 text-white dark:bg-red-900": !isLiveUpdating,
						})}
					>
						{isLiveUpdating ? "Online" : "Offline"}
					</Badge>

					<Badge className="flex items-center">
						<Users className="mr-1 size-3" />
						{members.length} Members
					</Badge>
				</div>
			</div>

			<Button asChild variant="outline">
				<Link href="/">
					<DoorOpen className="mr-2 size-4" />
					Exit Room
				</Link>
			</Button>
		</header>
	);
};
