"use client";

import type React from "react";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { MainNav } from "@/components/main-nav";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";

const SecurityPage = () => {
	const { user, updatePassword, isLoading: authLoading } = useAuth();
	const router = useRouter();
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");

	// Redirect if not logged in
	if (!authLoading && !user) {
		router.push("/auth/login");
		return null;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess(false);

		if (newPassword !== confirmPassword) {
			setError("New passwords do not match");
			return;
		}

		setIsLoading(true);

		try {
			const success = await updatePassword(currentPassword, newPassword);
			if (success) {
				setSuccess(true);
				setCurrentPassword("");
				setNewPassword("");
				setConfirmPassword("");
			} else {
				setError("Current password is incorrect");
			}
		} catch (err) {
			setError("An error occurred. Please try again.");
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	if (authLoading) {
		return (
			<>
				<MainNav />
				<div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
					<Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
				</div>
			</>
		);
	}

	return (
		<>
			<MainNav />
			<div className="container py-12">
				<div className="mx-auto max-w-4xl">
					<h1 className="mb-6 text-3xl font-bold">Account Settings</h1>

					<Tabs defaultValue="security">
						<TabsList className="mb-6">
							<TabsTrigger
								value="profile"
								onClick={() => router.push("/profile")}
							>
								Profile
							</TabsTrigger>
							<TabsTrigger value="security">Security</TabsTrigger>
						</TabsList>

						<TabsContent value="security">
							<Card>
								<CardHeader>
									<CardTitle>Change Password</CardTitle>
									<CardDescription>
										Update your account password
									</CardDescription>
								</CardHeader>
								<form onSubmit={handleSubmit}>
									<CardContent className="space-y-6">
										{error && (
											<Alert variant="destructive">
												<AlertDescription>{error}</AlertDescription>
											</Alert>
										)}
										{success && (
											<Alert>
												<AlertDescription>
													Password updated successfully!
												</AlertDescription>
											</Alert>
										)}

										<div className="space-y-2">
											<Label htmlFor="currentPassword">Current Password</Label>
											<Input
												id="currentPassword"
												type="password"
												value={currentPassword}
												onChange={e => setCurrentPassword(e.target.value)}
												required
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="newPassword">New Password</Label>
											<Input
												id="newPassword"
												type="password"
												value={newPassword}
												onChange={e => setNewPassword(e.target.value)}
												required
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="confirmPassword">
												Confirm New Password
											</Label>
											<Input
												id="confirmPassword"
												type="password"
												value={confirmPassword}
												onChange={e => setConfirmPassword(e.target.value)}
												required
											/>
										</div>
									</CardContent>
									<CardFooter>
										<Button type="submit" disabled={isLoading}>
											{isLoading ? "Updating..." : "Update password"}
										</Button>
									</CardFooter>
								</form>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</>
	);
};

export default SecurityPage;
