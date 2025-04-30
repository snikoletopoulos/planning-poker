"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";

import { NavBar } from "@/components/NavBar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 1000));

		setIsSubmitted(true);
		setIsLoading(false);
	};

	return (
		<>
			<NavBar />
			<div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
				<Card className="mx-auto max-w-sm">
					<CardHeader>
						<CardTitle className="text-2xl">Reset password</CardTitle>
						<CardDescription>
							Enter your email to reset your password
						</CardDescription>
					</CardHeader>
					{isSubmitted ? (
						<CardContent className="space-y-4">
							<Alert>
								<AlertDescription>
									If an account exists with that email, we&apos;ve sent password
									reset instructions.
								</AlertDescription>
							</Alert>
							<div className="text-center">
								<Link
									href="/auth/login"
									className="text-primary underline-offset-4 hover:underline"
								>
									Back to login
								</Link>
							</div>
						</CardContent>
					) : (
						<form onSubmit={handleSubmit}>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										placeholder="m@example.com"
										value={email}
										onChange={e => setEmail(e.target.value)}
										required
									/>
								</div>
							</CardContent>
							<CardFooter className="flex flex-col">
								<Button className="w-full" type="submit" disabled={isLoading}>
									{isLoading ? "Sending..." : "Send reset instructions"}
								</Button>
								<p className="text-muted-foreground mt-4 text-center text-sm">
									Remember your password?{" "}
									<Link
										href="/auth/login"
										className="text-primary underline-offset-4 hover:underline"
									>
										Login
									</Link>
								</p>
							</CardFooter>
						</form>
					)}
				</Card>
			</div>
		</>
	);
};

export default ForgotPasswordPage;
