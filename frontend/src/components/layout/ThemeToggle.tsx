import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-secondary px-2 py-1">
      <Sun className="size-3.5 text-muted-foreground" />
      <Switch
        checked={theme === "dark"}
        onCheckedChange={toggleTheme}
        aria-label="Toggle dark mode"
      />
      <Moon className="size-3.5 text-muted-foreground" />
    </div>
  );
}
