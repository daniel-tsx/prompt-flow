"use client";

import { useActionState } from "react";
import { Eye, KeyRound, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { unlock, enterDemo, type UnlockState } from "@/lib/actions/auth";

export function UnlockForm() {
  const [state, formAction, pending] = useActionState<UnlockState, FormData>(unlock, {});

  return (
    <div className="flex flex-col gap-5">
      <form action={formAction}>
        <FieldGroup>
          <Field data-invalid={!!state.error}>
            <FieldLabel htmlFor="passcode" className="text-xs text-muted-foreground">
              Passcode
            </FieldLabel>
            <Input
              id="passcode"
              name="passcode"
              type="password"
              autoFocus
              autoComplete="current-password"
              placeholder="Enter your passcode"
              aria-invalid={!!state.error}
            />
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          </Field>
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
            Unlock my library
          </Button>
        </FieldGroup>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <form action={enterDemo}>
        <Button type="submit" variant="outline" className="w-full">
          <Eye className="size-4" /> See the demo
        </Button>
      </form>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Sparkles className="size-3" /> Demo is read-only and shows sample data.
      </p>
    </div>
  );
}
