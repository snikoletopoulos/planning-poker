"use client";

import { DoorOpen, Users } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useRoom } from "./RoomContext";

export const Header = () => {
	const { room, members } = useRoom();

	return (
		<header className="mb-8 flex items-center justify-between">
			<div>
				<h1 className="text-foreground text-3xl font-bold">{room.name}</h1>
				<div className="mt-2 flex items-center">
					<Badge variant="outline" className="mr-2">
						Room: {room.id}
					</Badge>

					<Badge className="flex items-center">
						<Users className="mr-1 h-3 w-3" />
						{members.length} Members
					</Badge>
				</div>
			</div>

			<Button asChild variant="outline">
				<Link href="/">
					<DoorOpen className="mr-2 h-4 w-4" />
					Exit Room
				</Link>
			</Button>
		</header>
	);
};
