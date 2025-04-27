import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeType = "light" | "dark" | "system";

interface ThemeContextType {
  theme: ThemeType;
  isDark: boolean;
  setTheme: (theme: ThemeType) => void;
  colors: {
    background: string;
    card: string;
    text: string;
    border: string;
    primary: string;
    success: string;
    danger: string;
    warning: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>("system");

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme");
        if (savedTheme) {
          setThemeState(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error("Failed to load theme preference:", error);
      }
    };

    loadTheme();
  }, []);

  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem("theme", newTheme);
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  const isDark =
    theme === "system" ? systemColorScheme === "dark" : theme === "dark";

  const colors = {
    background: isDark ? "#121212" : "#f9fafb",
    card: isDark ? "#1e1e1e" : "#ffffff",
    text: isDark ? "#e5e7eb" : "#1f2937",
    border: isDark ? "#2e2e2e" : "#e5e7eb",
    primary: "#6366f1",
    success: "#10b981",
    danger: "#ef4444",
    warning: "#f59e0b",
  };

  const value = {
    theme,
    isDark,
    setTheme,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
