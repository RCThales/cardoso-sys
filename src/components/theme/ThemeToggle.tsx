import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check if theme is saved in localStorage
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      // Use system preference if no saved preference
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="  z-50 rounded-lg shadow-lg bg-card backdrop-blur-sm border border-border w-full"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <>
          <Moon className="w-2xl" />
          <p>Trocar para Dark</p>
        </>
      ) : (
        <>
          <Sun className="w-2xl" />
          <p>Trocar para Light</p>
        </>
      )}
    </Button>
  );
};
