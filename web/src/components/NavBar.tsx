import { headers } from "next/headers";
import Link from "next/link";

import { ThemeToggle } from "@/components/ThemeToggle";
import { UserDropdown } from "@/components/UserDropdown";
import { auth } from "@/lib/auth/auth";

export const NavBar = async () => {
	const session = await auth.api.getSession({ headers: await headers() });

	return (
		<header className="border-b bg-background">
			<div className="container mx-auto flex h-16 items-center justify-between">
				<Link href="/">
					<h1 className="text-xl font-bold">Planning Poker</h1>
				</Link>

				{session?.user ? (
					<UserDropdown user={session.user} />
				) : (
					<ThemeToggle />
				)}
			</div>
		</header>
	);
};
