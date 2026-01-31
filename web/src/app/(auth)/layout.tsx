import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";

const AuthLayout = async ({ children }: LayoutProps<"/">) => {
	const session = await auth.api.getSession({ headers: await headers() });
	if (session) redirect("/");

	return (
		<div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background p-4">
			<main className="w-full max-w-md space-y-8">
				<header className="text-center">
					<h1 className="text-4xl font-bold tracking-tight text-foreground">
						Planning Poker
					</h1>

					<p className="mt-3 text-muted-foreground">
						Estimate your tasks collaboratively with your team
					</p>
				</header>

				{children}

				<div className="text-center text-sm text-muted-foreground">
					<p>
						Plan better, estimate faster, and build consensus with your team
					</p>
				</div>
			</main>
		</div>
	);
};

export default AuthLayout;
