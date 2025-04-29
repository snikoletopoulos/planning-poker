"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { useAuth } from "./auth-context";

export interface RoomHistory {
	id: string;
	name: string;
	createdAt: string;
	lastVisited: string;
	stories: number;
	participants: number;
}

interface RoomContextType {
	rooms: RoomHistory[];
	addRoom: (room: Omit<RoomHistory, "lastVisited">) => void;
	updateRoomVisit: (roomId: string) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
	const [rooms, setRooms] = useState<RoomHistory[]>([]);
	const { user } = useAuth();

	// Load rooms from localStorage on initial render and when user changes
	useEffect(() => {
		if (user) {
			const storedRooms = localStorage.getItem(`rooms_${user.id}`);
			if (storedRooms) {
				try {
					setRooms(JSON.parse(storedRooms));
				} catch (error) {
					console.error("Failed to parse stored rooms", error);
					localStorage.removeItem(`rooms_${user.id}`);
				}
			}
		} else {
			setRooms([]);
		}
	}, [user]);

	// Save rooms to localStorage whenever they change
	useEffect(() => {
		if (user && rooms.length > 0) {
			localStorage.setItem(`rooms_${user.id}`, JSON.stringify(rooms));
		}
	}, [rooms, user]);

	const addRoom = (room: Omit<RoomHistory, "lastVisited">) => {
		if (!user) return;

		const newRoom = {
			...room,
			lastVisited: new Date().toISOString(),
		};

		setRooms(prev => {
			// Check if room already exists
			const existingRoomIndex = prev.findIndex(r => r.id === room.id);

			if (existingRoomIndex !== -1) {
				// Update existing room
				const updatedRooms = [...prev];
				updatedRooms[existingRoomIndex] = {
					...updatedRooms[existingRoomIndex],
					lastVisited: new Date().toISOString(),
				};
				return updatedRooms;
			} else {
				// Add new room
				return [newRoom, ...prev];
			}
		});
	};

	const updateRoomVisit = (roomId: string) => {
		if (!user) return;

		setRooms(prev => {
			const roomIndex = prev.findIndex(r => r.id === roomId);
			if (roomIndex === -1) return prev;

			const updatedRooms = [...prev];
			updatedRooms[roomIndex] = {
				...updatedRooms[roomIndex],
				lastVisited: new Date().toISOString(),
			};

			return updatedRooms;
		});
	};

	return (
		<RoomContext.Provider value={{ rooms, addRoom, updateRoomVisit }}>
			{children}
		</RoomContext.Provider>
	);
}

export function useRooms() {
	const context = useContext(RoomContext);
	if (context === undefined) {
		throw new Error("useRooms must be used within a RoomProvider");
	}
	return context;
}
