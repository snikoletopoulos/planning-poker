import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/styles/globals.css";

import { NavBar } from "@/components/NavBar";
import { ThemeProvider } from "@/components/ThemeContext";
import { AuthProvider } from "@/contexts/auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: {
		template: "%s | Planning Poker",
		default: "Planning Poker",
	},
	description: "Estimate your tasks collaboratively with your team",
};

const RootLayout = ({ children }: { children: ReactNode }) => (
	<html lang="en" suppressHydrationWarning>
		<body className={inter.className}>
			<ThemeProvider>
				<AuthProvider>
					<NavBar />
					{children}
				</AuthProvider>
			</ThemeProvider>
		</body>
	</html>
);

export default RootLayout;
