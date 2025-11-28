"use client";

import {Check, Monitor, Moon, Sun} from "lucide-react";

import {CommandItem, CommandSubtitle} from "@/components/ui/command";
import {useAppContext} from "@/state/app-state";

export function CommandThemes() {
  const {theme, updateTheme, closeCmdK} = useAppContext();

  const handleSelect = (updatedTheme: typeof theme) => {
    updateTheme(updatedTheme);
    closeCmdK();
  };

  return (
    <>
      <CommandItem
        onSelect={() => handleSelect("light")}
        keywords={["light", "light theme", "light mode", "mode"]}
      >
        <Sun />
        <span>Change theme to Light</span>

        {theme === "light" && (
          <CommandSubtitle className="shrink-0">
            <Check className="h-4 w-4" />
          </CommandSubtitle>
        )}
      </CommandItem>

      <CommandItem
        onSelect={() => handleSelect("dark")}
        keywords={["dark", "dark theme", "dark mode", "mode"]}
      >
        <Moon />
        <span>Change theme to Dark</span>

        {theme === "dark" && (
          <CommandSubtitle className="shrink-0">
            <Check className="h-4 w-4" />
          </CommandSubtitle>
        )}
      </CommandItem>

      <CommandItem onSelect={() => handleSelect("system")}>
        <Monitor />
        <span>Change theme to system</span>

        {theme === "system" && (
          <CommandSubtitle className="shrink-0">
            <Check className="h-4 w-4" />
          </CommandSubtitle>
        )}
      </CommandItem>
    </>
  );
}
