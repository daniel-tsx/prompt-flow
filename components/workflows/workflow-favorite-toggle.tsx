"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleWorkflowFavorite } from "@/lib/actions/workflows";
import { cn } from "@/lib/utils";

export function WorkflowFavoriteToggle({
  id,
  favorite,
  size = "icon-sm",
}: {
  id: string;
  favorite: boolean;
  size?: "icon-sm" | "icon";
}) {
  const [fav, setFav] = useState(favorite);
  const [, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      aria-label={fav ? "Unfavorite" : "Favorite"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const next = !fav;
        setFav(next);
        startTransition(async () => {
          await toggleWorkflowFavorite(id, next);
        });
      }}
    >
      <Star className={cn("size-4", fav ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
    </Button>
  );
}
