"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/Button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { cn } from "@/lib/styles/utils";

export const ThemeToggle = () => (
	<DropdownMenu>
		<DropdownMenuTrigger asChild>
			<Button variant="outline" size="icon" className="rounded-full">
				<Sun className="size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
				<Moon className="absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
			</Button>
		</DropdownMenuTrigger>

		<DropdownMenuContent align="end">
			<DropdownMenuItem className="block focus:bg-transparent">
				<p className="mb-2 ml-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
					Theme
				</p>
				<ThemeSelector />
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
);

export const ThemeSelector = ({ className }: { className?: string }) => {
	const { theme, setTheme } = useTheme();

	return (
		<div className={cn("flex items-center gap-1", className)}>
			<Button
				variant={theme === "light" ? "default" : "outline"}
				className="h-auto flex-1"
				onClick={() => setTheme("light")}
			>
				<Sun
					className={cn(
						"size-4",
						theme === "light" && "text-primary-foreground",
					)}
				/>
			</Button>

			<Button
				variant={theme === "dark" ? "default" : "outline"}
				className="h-auto flex-1"
				onClick={() => setTheme("dark")}
			>
				<Moon
					className={cn(
						"size-4",
						theme === "dark" && "text-primary-foreground",
					)}
				/>
			</Button>

			<Button
				variant={theme === "system" ? "default" : "outline"}
				className="h-auto flex-1"
				onClick={() => setTheme("system")}
			>
				<Monitor
					className={cn(
						"size-4",
						theme === "system" && "text-primary-foreground",
					)}
				/>
			</Button>
		</div>
	);
};
