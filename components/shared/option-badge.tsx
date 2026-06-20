import { Badge } from "@/components/ui/badge";
import { accentBadge, type Option } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function OptionBadge({
  option,
  withIcon = true,
  className,
}: {
  option?: Option;
  withIcon?: boolean;
  className?: string;
}) {
  if (!option) return null;
  const Icon = option.icon;
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 font-medium", accentBadge[option.accent], className)}
    >
      {withIcon && Icon ? <Icon className="size-3" /> : null}
      {option.label}
    </Badge>
  );
}
