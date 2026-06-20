"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeSetting() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex gap-2">
      {OPTIONS.map((o) => {
        const active = theme === o.value;
        return (
          <Button
            key={o.value}
            variant={active ? "secondary" : "outline"}
            size="sm"
            onClick={() => setTheme(o.value)}
            className={cn(active && "border-primary/40")}
          >
            <o.icon className="size-4" /> {o.label}
          </Button>
        );
      })}
    </div>
  );
}
