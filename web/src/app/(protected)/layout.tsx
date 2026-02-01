import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { CurrentUserProvider } from "@/components/CurrentUserProvider";
import { auth } from "@/lib/auth/auth";

const ProtectedLayout = async ({ children }: LayoutProps<"/">) => {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/login");

	return (
		<CurrentUserProvider user={session.user}>{children}</CurrentUserProvider>
	);
};

export default ProtectedLayout;
