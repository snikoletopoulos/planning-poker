import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/styles/globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { RoomProvider } from "@/contexts/room-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Planning Poker",
	description: "Estimate your tasks collaboratively with your team",
	generator: "v0.dev",
};

const RootLayout = ({ children }: { children: ReactNode }) => (
	<html lang="en" suppressHydrationWarning>
		<body className={inter.className}>
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				<AuthProvider>
					<RoomProvider>{children}</RoomProvider>
				</AuthProvider>
			</ThemeProvider>
		</body>
	</html>
);

export default RootLayout;
