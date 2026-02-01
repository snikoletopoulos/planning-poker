import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { member } from "@/lib/db/schemas/schema";

export const metadata: Metadata = {
	title: "My Rooms",
};

const RoomsPage = async () => {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) throw new Error("Unauthorized");

	const userRooms = await db.query.member.findMany({
		where: eq(member.userId, session.user.id),
		with: {
			room: true,
		},
	});

	return (
		<div className="container mx-auto py-8">
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">My Rooms</h1>
					<p className="text-muted-foreground">
						View and join your planning poker rooms
					</p>
				</div>

				<Button asChild>
					<Link href="/room/new">Create New Room</Link>
				</Button>
			</div>

			{userRooms.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<p className="mb-4 text-muted-foreground">
							You haven&apos;t joined any rooms yet.
						</p>
						<div className="flex gap-4">
							<Button asChild variant="outline">
								<Link href="/">Join a Room</Link>
							</Button>
							<Button asChild>
								<Link href="/room/new">Create New Room</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{userRooms.map(({ room }) => (
						<Link key={room.id} href={`/room/${room.id}`}>
							<Card className="transition-colors hover:bg-accent">
								<CardHeader>
									<CardTitle className="text-lg">{room.name}</CardTitle>
									<CardDescription>Room ID: {room.id}</CardDescription>
								</CardHeader>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
};

export default RoomsPage;
