"use client";

import { useRef } from "react";
import { Eye, Pencil } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/markdown";
import { EDITOR_SECTIONS, EDITOR_SECTION_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your prompt in markdown…",
  minHeight = "min-h-[320px]",
  showHelpers = true,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  showHelpers?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function insertSection(key: keyof typeof EDITOR_SECTIONS) {
    const snippet = EDITOR_SECTIONS[key];
    const el = ref.current;
    if (!el) {
      onChange(value ? `${value}\n\n${snippet}` : snippet);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const before = value.slice(0, start);
    const after = value.slice(start);
    const prefix = before && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
    const next = `${before}${prefix}${snippet}${after}`;
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = (before + prefix + snippet).length;
      el.setSelectionRange(pos, pos);
    });
  }

  return (
    <Tabs defaultValue="write" className="gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TabsList>
          <TabsTrigger value="write">
            <Pencil className="size-3.5" /> Write
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="size-3.5" /> Preview
          </TabsTrigger>
        </TabsList>
        <span className="text-xs tabular-nums text-muted-foreground">
          {value.length.toLocaleString()} chars
        </span>
      </div>

      {showHelpers && (
        <div className="flex flex-wrap gap-1.5">
          {EDITOR_SECTION_LABELS.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              type="button"
              variant="outline"
              size="xs"
              onClick={() => insertSection(key)}
            >
              <Icon className="size-3" /> {label}
            </Button>
          ))}
        </div>
      )}

      <TabsContent value="write">
        <Textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn("resize-y font-mono text-sm leading-relaxed", minHeight)}
        />
      </TabsContent>
      <TabsContent value="preview">
        <div className={cn("rounded-lg border bg-muted/30 p-4", minHeight)}>
          {value ? (
            <Markdown>{value}</Markdown>
          ) : (
            <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
