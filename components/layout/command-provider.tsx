"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CommandMenu } from "@/components/search/command-menu";
import { QuickCaptureDialog } from "@/components/notes/quick-capture-dialog";
import type { PickerProject, RecentPrompt } from "@/types";

type CommandContextValue = {
  openCommandMenu: () => void;
  openQuickCapture: (type?: string) => void;
};

const CommandContext = createContext<CommandContextValue | null>(null);

export function useCommands() {
  const ctx = useContext(CommandContext);
  if (!ctx) throw new Error("useCommands must be used within CommandProvider");
  return ctx;
}

export function CommandProvider({
  projects,
  recentPrompts,
  account,
  children,
}: {
  projects: PickerProject[];
  recentPrompts: RecentPrompt[];
  account: "owner" | "demo";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const readOnly = account === "demo";
  const [commandOpen, setCommandOpen] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [captureType, setCaptureType] = useState("quick-note");

  const openQuickCapture = useCallback(
    (type = "quick-note") => {
      if (readOnly) {
        toast.error("This is the read-only demo — enter your passcode to capture.");
        return;
      }
      setCaptureType(type);
      setCaptureOpen(true);
    },
    [readOnly],
  );

  const openCommandMenu = useCallback(() => setCommandOpen(true), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      if (meta && !e.shiftKey && key === "k") {
        e.preventDefault();
        setCommandOpen((o) => !o);
      } else if (meta && e.shiftKey && key === "n") {
        e.preventDefault();
        openQuickCapture("quick-note");
      } else if (meta && e.shiftKey && key === "p") {
        e.preventDefault();
        if (readOnly) toast.error("Read-only demo — enter your passcode to create.");
        else router.push("/prompts/new");
      } else if (meta && e.shiftKey && key === "t") {
        e.preventDefault();
        openQuickCapture("task");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openQuickCapture, router, readOnly]);

  return (
    <CommandContext.Provider value={{ openCommandMenu, openQuickCapture }}>
      {children}
      <CommandMenu
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onCapture={openQuickCapture}
        recentPrompts={recentPrompts}
        readOnly={readOnly}
      />
      <QuickCaptureDialog
        open={captureOpen}
        onOpenChange={setCaptureOpen}
        defaultType={captureType}
        projects={projects}
      />
    </CommandContext.Provider>
  );
}
