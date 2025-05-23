import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  border: string;
  card: string;
}

const lightThemeColors: ThemeColors = {
  primary: "#FFE6A8",
  secondary: "#4E4187",
  background: "#FFFFFF",
  text: "#4E4187",
  border: "#4E4187",
  card: "#F8F8F8",
};

const darkThemeColors: ThemeColors = {
  primary: "#4E4187",
  secondary: "#ffe6a8",
  background: "#1c1c1c",
  text: "#ffe6a8",
  border: "#ffe6a8",
  card: "#1E1E1E",
};

interface ThemeContextType {
  theme: "light" | "dark";
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "userChosenTheme";

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme === "light" || storedTheme === "dark") {
          setTheme(storedTheme);
        }
      } catch (e) {
        console.error("Error al cargar la preferencia de tema:", e);
      }
    };
    loadThemePreference();
  }, []);

  const toggleTheme = useCallback(async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.error("Error al guardar la preferencia de tema:", e);
    }
  }, [theme]);

  const colors = theme === "light" ? lightThemeColors : darkThemeColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  }
  return context;
};
