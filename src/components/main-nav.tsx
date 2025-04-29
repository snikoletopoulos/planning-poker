"use client";

import { History, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";

export const MainNav = () => {
	const { user, logout } = useAuth();
	const pathname = usePathname();

	const isActive = (path: string) => pathname === path;

	return (
		<header className="bg-background border-b">
			<div className="container flex h-16 items-center justify-between">
				<div className="flex items-center gap-6">
					<Link href="/" className="text-xl font-bold">
						Planning Poker
					</Link>
					{user && (
						<nav className="hidden gap-4 md:flex">
							<Link
								href="/dashboard"
								className={`hover:text-primary text-sm font-medium transition-colors ${
									isActive("/dashboard")
										? "text-primary"
										: "text-muted-foreground"
								}`}
							>
								Dashboard
							</Link>
						</nav>
					)}
				</div>

				<div className="flex items-center gap-2">
					<ThemeToggle />

					{user ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="relative h-8 w-8 rounded-full"
								>
									<Avatar className="h-8 w-8">
										{user.profilePicture ? (
											<AvatarImage
												src={user.profilePicture || "/placeholder.svg"}
												alt={user.name}
											/>
										) : null}
										<AvatarFallback>
											{user.name.substring(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56" align="end" forceMount>
								<DropdownMenuLabel className="font-normal">
									<div className="flex flex-col space-y-1">
										<p className="text-sm leading-none font-medium">
											{user.name}
										</p>
										<p className="text-muted-foreground text-xs leading-none">
											{user.email}
										</p>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href="/profile">
										<User className="mr-2 h-4 w-4" />
										<span>Profile</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/dashboard">
										<History className="mr-2 h-4 w-4" />
										<span>Room History</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/profile/security">
										<Settings className="mr-2 h-4 w-4" />
										<span>Security</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={logout}>
									<LogOut className="mr-2 h-4 w-4" />
									<span>Log out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Button asChild variant="outline" size="sm">
							<Link href="/auth/login">Login</Link>
						</Button>
					)}
				</div>
			</div>
		</header>
	);
}
