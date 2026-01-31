"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card, CardFooter } from "@/components/ui/Card";
import { SignIn } from "./sign-in";
import { SignUp } from "./sign-up";

const LoginPage = () => {
	const [isLogin, setIsLogin] = useState(true);

	return (
		<Card className="max-w-md">
			{isLogin ? <SignIn /> : <SignUp />}

			<CardFooter>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="text-sm text-muted-foreground">
							{isLogin ? "Don't have an account?" : "Already have an account?"}
						</span>

						<Button
							variant="link"
							size="sm"
							onClick={() => setIsLogin(!isLogin)}
						>
							{isLogin ? "Sign up" : "Sign in"}
						</Button>
					</div>
				</div>
			</CardFooter>
		</Card>
	);
};

export default LoginPage;
