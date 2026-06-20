import { cn } from "@/lib/utils";

export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {Icon && (
            <span className="mt-0.5 flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm ring-1 ring-inset ring-primary/25">
              <Icon className="size-[1.15rem]" />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-balance">{title}</h1>
            {description && (
              <p className="mt-1 text-sm leading-snug text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
