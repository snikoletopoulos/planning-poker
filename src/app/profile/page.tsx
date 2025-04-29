"use client";

import type React from "react";
import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

import { MainNav } from "@/components/main-nav";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const ProfilePage = () => {
	const { user, updateProfile, isLoading: authLoading } = useAuth();
	const router = useRouter();
	const [name, setName] = useState(user?.name || "");
	const [profilePicture, setProfilePicture] = useState<string | undefined>(
		user?.profilePicture,
	);
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
		setIsLoading(true);

		try {
			const success = await updateProfile({ name, profilePicture });
			if (success) {
				setSuccess(true);
			} else {
				setError("Failed to update profile");
			}
		} catch (err) {
			setError("An error occurred. Please try again.");
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Convert to base64 for demo purposes
		// In a real app, you'd upload to a storage service
		const reader = new FileReader();
		reader.onloadend = () => {
			setProfilePicture(reader.result as string);
		};
		reader.readAsDataURL(file);
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

					<Tabs defaultValue="profile">
						<TabsList className="mb-6">
							<TabsTrigger value="profile">Profile</TabsTrigger>
							<TabsTrigger
								value="security"
								onClick={() => router.push("/profile/security")}
							>
								Security
							</TabsTrigger>
						</TabsList>

						<TabsContent value="profile">
							<Card>
								<CardHeader>
									<CardTitle>Profile Information</CardTitle>
									<CardDescription>
										Update your account profile information
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
													Profile updated successfully!
												</AlertDescription>
											</Alert>
										)}

										<div className="flex flex-col items-center space-y-4">
											<Avatar className="h-24 w-24">
												{profilePicture ? (
													<AvatarImage
														src={profilePicture || "/placeholder.svg"}
														alt={name}
													/>
												) : null}
												<AvatarFallback className="text-2xl">
													{name.substring(0, 2).toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div className="flex items-center gap-2">
												<Label
													htmlFor="picture"
													className="text-primary flex cursor-pointer items-center gap-1 text-sm"
												>
													<Upload className="h-4 w-4" />
													Upload picture
												</Label>
												<Input
													id="picture"
													type="file"
													accept="image/*"
													className="hidden"
													onChange={handleImageUpload}
												/>
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="name">Name</Label>
											<Input
												id="name"
												value={name}
												onChange={e => setName(e.target.value)}
												required
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="email">Email</Label>
											<Input id="email" value={user?.email} disabled />
											<p className="text-muted-foreground text-sm">
												Your email cannot be changed
											</p>
										</div>
									</CardContent>
									<CardFooter>
										<Button type="submit" disabled={isLoading}>
											{isLoading ? "Saving..." : "Save changes"}
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

export default ProfilePage;
