import { createContext, useContext, useEffect, useState } from "react";

const KEY = "dope-theme";
const ThemeCtx = createContext({ theme: "light", setTheme: () => {}, toggle: () => {} });

function getInitial() {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "light" || v === "dark") return v;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch { return "light"; }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitial);

  const setTheme = (v) => {
    setThemeState(v);
    try { localStorage.setItem(KEY, v); } catch {}
    document.documentElement.classList.toggle("dark", v === "dark");
  };
  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // keep in sync across tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === KEY && (e.newValue === "light" || e.newValue === "dark")) {
        setThemeState(e.newValue);
        document.documentElement.classList.toggle("dark", e.newValue === "dark");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return <ThemeCtx.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() { return useContext(ThemeCtx); }
