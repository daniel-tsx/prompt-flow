"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { accentDot, type Option } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function OptionSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  className,
  id,
  ariaInvalid,
}: {
  value: string | undefined;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  id?: string;
  ariaInvalid?: boolean;
}) {
  return (
    <Select value={value ?? null} onValueChange={(v) => onChange(v ?? "")}>
      <SelectTrigger id={id} className={cn("w-full", className)} aria-invalid={ariaInvalid}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <span className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full", accentDot[opt.accent])} />
                {opt.label}
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
