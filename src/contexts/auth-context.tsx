"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface User {
	id: string;
	name: string;
	email: string;
	profilePicture?: string;
	createdAt: string;
}

type UserWithPassword = User & { password: string };

interface AuthContextType {
	user: User | null;
	login: (email: string, password: string) => Promise<boolean>;
	register: (name: string, email: string, password: string) => Promise<boolean>;
	logout: () => void;
	updateProfile: (data: Partial<User>) => Promise<boolean>;
	updatePassword: (
		currentPassword: string,
		newPassword: string,
	) => Promise<boolean>;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	// Load user from localStorage on initial render
	useEffect(() => {
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			try {
				setUser(JSON.parse(storedUser));
			} catch (error) {
				console.error("Failed to parse stored user", error);
				localStorage.removeItem("user");
			}
		}
		setIsLoading(false);
	}, []);

	// Helper to get users from localStorage
	const getUsers = (): UserWithPassword[] => {
		const users = localStorage.getItem("users");
		return users ? JSON.parse(users) : [];
	};

	// Helper to save users to localStorage
	const saveUsers = (users: UserWithPassword[]) => {
		localStorage.setItem("users", JSON.stringify(users));
	};

	const login = async (email: string, password: string) => {
		// Simulate API call delay
		await new Promise(resolve => setTimeout(resolve, 500));

		const users = getUsers();
		const foundUser = users.find(
			u => u.email === email && u.password === password,
		);

		if (foundUser) {
			// Don't store password in the user state
			const { password: _, ...userWithoutPassword } = foundUser;
			setUser(userWithoutPassword);
			localStorage.setItem("user", JSON.stringify(userWithoutPassword));
			return true;
		}

		return false;
	};

	const register = async (name: string, email: string, password: string) => {
		// Simulate API call delay
		await new Promise(resolve => setTimeout(resolve, 500));

		const users = getUsers();

		// Check if user already exists
		if (users.some(u => u.email === email)) {
			return false;
		}

		// Create new user
		const newUser: UserWithPassword = {
			id: Date.now().toString(),
			name,
			email,
			password,
			createdAt: new Date().toISOString(),
		};

		// Save to "database"
		saveUsers([...users, newUser]);

		// Log user in
		const { password: _, ...userWithoutPassword } = newUser;
		setUser(userWithoutPassword);
		localStorage.setItem("user", JSON.stringify(userWithoutPassword));

		return true;
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem("user");
		router.push("/");
	};

	const updateProfile = async (data: Partial<User>) => {
		if (!user) return false;

		// Simulate API call delay
		await new Promise(resolve => setTimeout(resolve, 500));

		const users = getUsers();
		const userIndex = users.findIndex(u => u.id === user.id);

		if (userIndex === -1) return false;

		// Update user
		const updatedUser = { ...users[userIndex], ...data };
		users[userIndex] = updatedUser;
		saveUsers(users);

		// Update current user state
		const { password: _, ...userWithoutPassword } = updatedUser;
		setUser(userWithoutPassword);
		localStorage.setItem("user", JSON.stringify(userWithoutPassword));

		return true;
	};

	const updatePassword = async (
		currentPassword: string,
		newPassword: string,
	) => {
		if (!user) return false;

		// Simulate API call delay
		await new Promise(resolve => setTimeout(resolve, 500));

		const users = getUsers();
		const userIndex = users.findIndex(
			u => u.id === user.id && u.password === currentPassword,
		);

		if (userIndex === -1) return false;

		// Update password
		users[userIndex].password = newPassword;
		saveUsers(users);

		return true;
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				login,
				register,
				logout,
				updateProfile,
				updatePassword,
				isLoading,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
