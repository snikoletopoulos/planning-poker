"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextProps {
	theme?: Theme;
	setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextProps>({
	setTheme: () => {},
});

interface ThemeProviderProps {
	children: React.ReactNode;
	attribute?: string;
	defaultTheme?: Theme;
	enableSystem?: boolean;
	storageKey?: string;
}

const ThemeProvider = ({
	children,
	attribute = "class",
	defaultTheme = "system",
	enableSystem = true,
	storageKey = "vite-ui-theme",
}: ThemeProviderProps) => {
	const [theme, setTheme] = React.useState<Theme>(defaultTheme);

	React.useEffect(() => {
		const root = window.document.documentElement;

		const initialTheme =
			(localStorage.getItem(storageKey) as Theme) || defaultTheme;
		setTheme(initialTheme);

		const updateTheme = () => {
			if (theme === "system" && enableSystem) {
				const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
					.matches
					? "dark"
					: "light";
				root.setAttribute(attribute, systemTheme);
				return;
			}

			root.setAttribute(attribute, theme);
		};

		updateTheme();

		// Save theme to localStorage
		if (theme !== "system") {
			localStorage.setItem(storageKey, theme);
		}

		// Listen for system theme changes
		if (enableSystem) {
			const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
			const handleChange = () => {
				if (theme === "system") {
					updateTheme();
				}
			};

			mediaQuery.addEventListener("change", handleChange);
			return () => mediaQuery.removeEventListener("change", handleChange);
		}
	}, [theme, attribute, storageKey, enableSystem, defaultTheme]);

	return (
		<ThemeContext.Provider value={{ theme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

function useTheme() {
	return React.useContext(ThemeContext);
}

export { ThemeProvider, useTheme };
