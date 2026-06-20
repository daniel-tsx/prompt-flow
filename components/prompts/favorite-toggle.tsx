"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { togglePromptFavorite } from "@/lib/actions/prompts";
import { cn } from "@/lib/utils";

export function FavoriteToggle({
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
          await togglePromptFavorite(id, next);
        });
      }}
    >
      <Star
        className={cn(
          "size-4 transition-colors",
          fav ? "fill-amber-400 text-amber-400" : "text-muted-foreground",
        )}
      />
    </Button>
  );
}
