"use client";

import { LogOut, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { authClient } from "@/lib/auth/auth-client";
import { ThemeSelector } from "./ThemeToggle";

interface UserDropdownProps {
	user: {
		name: string;
		email: string;
		image?: string | null;
	};
}

export const UserDropdown = ({ user }: UserDropdownProps) => {
	const initials = user.name
		.split(" ")
		.slice(0, 2)
		.map(name => name[0])
		.join("");

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="rounded-full ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
					<Avatar className="size-9 cursor-pointer">
						{user.image && <AvatarImage src={user.image} alt={user.name} />}
						<AvatarFallback className="uppercase">{initials}</AvatarFallback>
					</Avatar>
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="text-sm leading-none font-medium">{user.name}</p>
						<p className="text-xs leading-none text-muted-foreground">
							{user.email}
						</p>
					</div>
				</DropdownMenuLabel>

				<DropdownMenuSeparator />

				<DropdownMenuGroup>
					<DropdownMenuItem asChild>
						<Link href="/rooms">
							<Users />
							My Rooms
						</Link>
					</DropdownMenuItem>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				<DropdownMenuItem className="block focus:bg-transparent">
					<p className="mb-2 ml-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
						Theme
					</p>
					<ThemeSelector />
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				<DropdownMenuItem
					variant="destructive"
					onClick={() => authClient.signOut()}
				>
					<LogOut />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
