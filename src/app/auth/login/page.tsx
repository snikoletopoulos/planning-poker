"use client";

import type React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { SplitNewLines } from "@/components/ui/SplitNewLines";
import { useAuth } from "@/contexts/auth-context";

const LoginPage = () => {
	const router = useRouter();
	const { login } = useAuth();

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting, isValid },
	} = useForm({
		resolver: zodResolver(LoginSchema),
	});

	const handleLogin = handleSubmit(async ({ email, password }) => {
		try {
			const success = await login(email, password);
			if (!success) {
				setError("root", { message: "Invalid email or password" });
				return;
			}

			router.push("/dashboard");
		} catch (error) {
			setError("root", { message: "An error occurred. Please try again." });
			console.error(error);
		}
	});

	return (
		<>
			<NavBar />

			<div className="bg-background flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
				<Card className="mx-auto max-w-sm">
					<CardHeader>
						<CardTitle className="text-2xl">Login</CardTitle>

						<CardDescription>
							Enter your email below to login to your account
						</CardDescription>
					</CardHeader>

					<form onSubmit={handleLogin}>
						<CardContent className="space-y-4">
							{Object.keys(errors).length > 0 && (
								<Alert variant="destructive">
									{Object.entries(errors).map(
										([key, error]) =>
											error?.message && (
												<AlertDescription key={key}>
													<SplitNewLines message={error.message} />
												</AlertDescription>
											),
									)}
								</Alert>
							)}

							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									{...register("email")}
									type="email"
									placeholder="john.doe@example.com"
									required
								/>
							</div>

							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label htmlFor="password">Password</Label>
									<Link
										href="/auth/forgot-password"
										className="text-primary text-sm underline-offset-4 hover:underline"
									>
										Forgot password?
									</Link>
								</div>

								<Input {...register("password")} type="password" required />
							</div>
						</CardContent>

						<CardFooter className="flex flex-col">
							<Button
								className="w-full"
								type="submit"
								disabled={isSubmitting || !isValid}
							>
								{isSubmitting ? "Logging in..." : "Login"}
							</Button>

							<p className="text-muted-foreground mt-4 text-center text-sm">
								Don&apos;t have an account?{" "}
								<Link
									href="/auth/register"
									className="text-primary underline-offset-4 hover:underline"
								>
									Sign up
								</Link>
							</p>
						</CardFooter>
					</form>
				</Card>
			</div>
		</>
	);
};

export default LoginPage;

const LoginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
});
