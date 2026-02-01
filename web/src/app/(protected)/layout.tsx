import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";

const ProtectedLayout = async ({ children }: LayoutProps<"/">) => {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/login");

	return children;
};

export default ProtectedLayout;
