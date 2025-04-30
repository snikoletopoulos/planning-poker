"use client";

import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type PropsWithChildren,
} from "react";

const LOCAL_STORAGE_KEY = "theme";

export type Theme = "light" | "dark" | "system";

interface ThemeContextProps {
	theme: Theme;
	setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextProps | null>(null);

export const ThemeProvider = ({ children }: PropsWithChildren) => {
	const [theme, setTheme] = useState<Theme>(() => {
		if (typeof window === "undefined") return "system";
		return (
			(window.localStorage.getItem(LOCAL_STORAGE_KEY) as Theme | null) ??
			"system"
		);
	});

	useEffect(() => {
		const root = window.document.documentElement;

		const updateTheme = () => {
			localStorage.setItem(LOCAL_STORAGE_KEY, theme);

			if (theme === "system") {
				const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
					.matches
					? "dark"
					: "light";
				root.setAttribute("class", systemTheme);
				return;
			}

			root.setAttribute("class", theme);
		};

		updateTheme();

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => theme === "system" && updateTheme();
		mediaQuery.addEventListener("change", handleChange);

		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme]);

	const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
};

export const useTheme = () => {
	const context = useContext(ThemeContext);

	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}

	return context;
};
