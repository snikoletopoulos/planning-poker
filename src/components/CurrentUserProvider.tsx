"use client";

import { createContext, useContext, type PropsWithChildren } from "react";

import type { Member } from "@/lib/db/schema";

export interface CurrentUser {
	id: Member["id"];
	name: string;
}

interface CurrentUserProviderProps {
	user: CurrentUser;
}

const CurrentUserContext = createContext<CurrentUser | null>(null);

export const CurrentUserProvider = ({
	children,
	user,
}: PropsWithChildren<CurrentUserProviderProps>) => (
	<CurrentUserContext.Provider value={user}>
		{children}
	</CurrentUserContext.Provider>
);

export const useCurrentUser = () => {
	const context = useContext(CurrentUserContext);

	if (!context) {
		throw new Error("useCurrentUser must be used within a CurrentUserProvider");
	}

	return context;
};
