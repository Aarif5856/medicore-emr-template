import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry: () => void;
  retryLabel?: string;
  className?: string;
  compact?: boolean;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this data. Check your connection and try again.",
  onRetry,
  retryLabel = "Retry",
  className,
  compact = false,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 text-center",
        compact ? "py-8" : "py-14",
        className,
      )}
    >
      <div className="grid h-10 w-10 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-5 w-5" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mx-auto max-w-sm text-xs text-muted-foreground">{description}</p>
      </div>
      <Button size="sm" variant="outline" onClick={onRetry} className="gap-2">
        <RefreshCw className="h-3.5 w-3.5" aria-hidden />
        {retryLabel}
      </Button>
    </div>
  );
}
