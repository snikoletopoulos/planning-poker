"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Separator } from "@/components/ui/Separator";
import { authClient } from "@/lib/auth/auth-client";

export const SignIn = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleLogin = async () => {
		// await authClient.signIn.social({
		// 	provider: "microsoft",
		// 	callbackURL: "/dashboard",
		// 	fetchOptions: {
		// 		onRequest: () => {
		// 			setLoading(true);
		// 		},
		// 		onResponse: () => {
		// 			setLoading(false);
		// 		},
		// 	},
		// });
		await authClient.signIn.email({
			email,
			password,
			callbackURL: "/",
			fetchOptions: {
				onRequest: () => {
					setLoading(true);
				},
				onResponse: () => {
					setLoading(false);
				},
			},
		});
	};

	return (
		<>
			<CardHeader>
				<CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
				<CardDescription className="text-xs md:text-sm">
					Enter your email below to login to your account
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form action={handleLogin}>
					<div className="space-y-4">
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="john.doe@example.com"
								required
								onChange={event => {
									setEmail(event.target.value);
								}}
								value={email}
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								placeholder="password"
								autoComplete="password"
								value={password}
								onChange={event => setPassword(event.target.value)}
							/>
						</div>

						<Button className="w-full" disabled={loading} onClick={handleLogin}>
							{loading ? (
								<Loader2 size={16} className="animate-spin" />
							) : (
								"Login"
							)}
						</Button>
					</div>

					<Separator className="my-6" />

					<Button variant="outline" className="w-full gap-2" disabled={loading}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="1em"
							height="1em"
							viewBox="0 0 24 24"
						>
							<path
								fill="#00A4EF"
								d="M2 3h9v9H2zm9 19H2v-9h9zM21 3v9h-9V3zm0 19h-9v-9h9z"
							/>
						</svg>
						Sign in with Microsoft
					</Button>
				</form>
			</CardContent>
		</>
	);
};
