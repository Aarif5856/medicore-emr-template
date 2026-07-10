import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type MiniStatTone = "primary" | "teal" | "warning" | "destructive" | "neutral";

const DOT_STYLES: Record<MiniStatTone, string> = {
  primary: "bg-primary",
  teal: "bg-[color:var(--accent-teal)]",
  warning: "bg-warning",
  destructive: "bg-destructive",
  neutral: "bg-muted-foreground/40",
};

export interface MiniStatCardProps {
  label: string;
  value: string;
  tone: MiniStatTone;
  /** Show the semantic status dot. Defaults to true. */
  showDot?: boolean;
  /** Optional longer label shown on hover / to assistive tech. */
  title?: string;
}

/**
 * Compact 2/4-up stat card used on list pages (Billing, Patients, Doctors, etc).
 *
 * Layout rules:
 *  - Stacked vertically so label wrap never pushes the value out of the row.
 *  - Label reserves two lines of height (line-clamp-2 + min-h) so values
 *    across the row share a baseline regardless of label length.
 *  - Value uses responsive sizing (text-base → sm:text-lg) with tabular-nums
 *    and whitespace-nowrap so long currency values never clip at ~316px.
 */
export function MiniStatCard({
  label,
  value,
  tone,
  showDot = true,
  title,
}: MiniStatCardProps) {
  return (
    <Card className="card-glass p-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          {showDot && (
            <span
              aria-hidden
              className={cn(
                "mt-[5px] h-2 w-2 shrink-0 rounded-full",
                DOT_STYLES[tone],
              )}
            />
          )}
          <div
            className="min-w-0 flex-1 text-[11px] font-medium leading-[1.35] text-muted-foreground line-clamp-2 min-h-[calc(2*1.35em)]"
            title={title ?? label}
          >
            {label}
          </div>
        </div>
        <div
          className="text-base font-semibold leading-tight tracking-tight text-foreground tabular whitespace-nowrap sm:text-lg"
          title={title}
        >
          {value}
        </div>
      </div>
    </Card>
  );
}
