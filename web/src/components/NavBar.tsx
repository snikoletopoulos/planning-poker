import { ThemeToggle } from "@/components/ThemeToggle";

export const NavBar = () => (
	<header className="border-b bg-background">
		<div className="container mx-auto flex h-16 items-center justify-between">
			<h1 className="text-xl font-bold">Planning Poker</h1>
			<ThemeToggle />
		</div>
	</header>
);
