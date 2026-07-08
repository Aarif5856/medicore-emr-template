import { useMemo, useState } from "react";
import {
  addDays,
  addMinutes,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { AppointmentStatusBadge, STATUS_STYLES } from "@/components/appointments/status-badge";
import { AppointmentDetail } from "@/components/appointments/appointment-detail";
import { HOURS_END, HOURS_START, type Appointment } from "@/data/appointments";

type Mode = "day" | "week" | "month";

interface Handlers {
  onReschedule: (a: Appointment) => void;
  onCancel: (a: Appointment) => void;
  onConfirm: (a: Appointment) => void;
}

const WEEK_START = 1 as const; // Monday
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarView({
  appointments,
  ...handlers
}: {
  appointments: Appointment[];
} & Handlers) {
  const [mode, setMode] = useState<Mode>("month");
  const [cursor, setCursor] = useState<Date>(new Date());

  const label = useMemo(() => {
    if (mode === "month") return format(cursor, "MMMM yyyy");
    if (mode === "week") {
      const s = startOfWeek(cursor, { weekStartsOn: WEEK_START });
      const e = endOfWeek(cursor, { weekStartsOn: WEEK_START });
      return isSameMonth(s, e)
        ? `${format(s, "MMM d")} – ${format(e, "d, yyyy")}`
        : `${format(s, "MMM d")} – ${format(e, "MMM d, yyyy")}`;
    }
    return format(cursor, "EEEE, MMM d, yyyy");
  }, [mode, cursor]);

  const nav = (dir: -1 | 1) => {
    if (mode === "month") setCursor((c) => (dir < 0 ? subMonths(c, 1) : addMonths(c, 1)));
    else if (mode === "week") setCursor((c) => addDays(c, dir * 7));
    else setCursor((c) => addDays(c, dir));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => nav(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => setCursor(new Date())}
          >
            Today
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => nav(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="ml-2 text-sm font-semibold text-foreground tabular">{label}</div>
        </div>

        <div className="flex rounded-lg border bg-card p-0.5">
          {(["day", "week", "month"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "h-8 rounded-md px-3 text-xs font-semibold capitalize transition-colors",
                mode === m
                  ? "bg-primary text-primary-foreground glow-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {mode === "month" && (
        <MonthView cursor={cursor} appointments={appointments} {...handlers} />
      )}
      {mode === "week" && (
        <WeekView cursor={cursor} appointments={appointments} {...handlers} />
      )}
      {mode === "day" && (
        <DayView cursor={cursor} appointments={appointments} {...handlers} />
      )}
    </div>
  );
}

/* -------------------------- Month view -------------------------- */

function MonthView({
  cursor,
  appointments,
  ...handlers
}: {
  cursor: Date;
  appointments: Appointment[];
} & Handlers) {
  const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: WEEK_START });
  const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: WEEK_START });
  const days = eachDayOfInterval({ start, end });

  const byDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of appointments) {
      const key = format(parseISO(a.start), "yyyy-MM-dd");
      const list = map.get(key);
      if (list) list.push(a);
      else map.set(key, [a]);
    }
    for (const list of map.values()) list.sort((x, y) => x.start.localeCompare(y.start));
    return map;
  }, [appointments]);

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="grid grid-cols-7 border-b bg-muted/40">
        {WEEKDAY_LABELS.map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 auto-rows-fr">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const items = byDay.get(key) ?? [];
          const outside = !isSameMonth(day, cursor);
          const visibleCount = 3;
          const visible = items.slice(0, visibleCount);
          const overflow = items.length - visible.length;
          const today = isToday(day);

          return (
            <div
              key={key}
              className={cn(
                "min-h-[110px] border-b border-r p-1.5 [&:nth-child(7n)]:border-r-0",
                outside ? "bg-muted/20" : "bg-card",
              )}
            >
              <div className="mb-1 flex items-center justify-between px-1">
                <span
                  className={cn(
                    "grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs font-semibold tabular",
                    today
                      ? "bg-primary text-primary-foreground"
                      : outside
                        ? "text-muted-foreground/60"
                        : "text-foreground",
                  )}
                >
                  {format(day, "d")}
                </span>
                {items.length > 0 && !outside && (
                  <span className="text-[10px] font-medium text-muted-foreground tabular">
                    {items.length}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {visible.map((a) => (
                  <MonthChip key={a.id} appointment={a} {...handlers} />
                ))}
                {overflow > 0 && (
                  <DayOverflowPopover
                    day={day}
                    items={items}
                    label={`+${overflow} more`}
                    {...handlers}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthChip({
  appointment,
  ...handlers
}: { appointment: Appointment } & Handlers) {
  const s = STATUS_STYLES[appointment.status];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-1 truncate rounded-md border-l-[3px] px-1.5 py-0.5 text-left text-[10px] font-medium transition-colors hover:brightness-110",
            s.leftBorder,
            s.chip,
            appointment.status === "Cancelled" && "line-through opacity-70",
          )}
        >
          <span className="tabular">{format(parseISO(appointment.start), "HH:mm")}</span>
          <span className="hidden truncate sm:inline">· {appointment.patientName}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <AppointmentDetail appointment={appointment} {...handlers} />
      </PopoverContent>
    </Popover>
  );
}

function DayOverflowPopover({
  day,
  items,
  label,
}: {
  day: Date;
  items: Appointment[];
  label: string;
} & Handlers) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full rounded-md bg-muted/70 px-1.5 py-0.5 text-left text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-muted"
        >
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="border-b bg-muted/30 px-4 py-3">
          <div className="text-sm font-semibold text-foreground">
            {format(day, "EEEE, MMM d")}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {items.length} appointment{items.length === 1 ? "" : "s"}
          </div>
        </div>
        <div className="max-h-[320px] space-y-1 overflow-y-auto p-2">
          {items.map((a) => {
            const s = STATUS_STYLES[a.status];
            return (
              <div
                key={a.id}
                className={cn(
                  "flex items-center gap-2 rounded-md border-l-4 bg-muted/40 px-3 py-2",
                  s.leftBorder,
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-foreground">
                    {a.patientName}
                  </div>
                  <div className="truncate text-[10px] text-muted-foreground tabular">
                    {format(parseISO(a.start), "HH:mm")} · {a.doctorName}
                  </div>
                </div>
                <AppointmentStatusBadge status={a.status} />
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* -------------------------- Week view -------------------------- */

const HOUR_HEIGHT_WEEK = 60;

interface LaidOut {
  appointment: Appointment;
  column: number;
  columnCount: number;
}

/**
 * Group overlapping appointments into clusters and assign each a column index
 * plus the cluster's total column count. Standard Google/Outlook algorithm.
 */
function layoutOverlaps(items: Appointment[]): LaidOut[] {
  const sorted = [...items].sort((a, b) => a.start.localeCompare(b.start));
  const result: LaidOut[] = [];
  let cluster: { appt: Appointment; endMin: number; column: number }[] = [];
  let clusterStartIndex = 0;

  const flush = () => {
    const cols = cluster.reduce((m, e) => Math.max(m, e.column + 1), 0);
    for (let i = 0; i < cluster.length; i++) {
      result[clusterStartIndex + i] = {
        appointment: cluster[i]!.appt,
        column: cluster[i]!.column,
        columnCount: cols,
      };
    }
  };

  for (const a of sorted) {
    const startD = parseISO(a.start);
    const startMin = startD.getHours() * 60 + startD.getMinutes();
    const endMin = startMin + a.durationMin;

    const clusterMaxEnd = cluster.reduce((m, e) => Math.max(m, e.endMin), 0);
    if (cluster.length > 0 && startMin >= clusterMaxEnd) {
      flush();
      clusterStartIndex = result.length;
      cluster = [];
    }

    // Pick lowest free column
    const used = new Set(
      cluster.filter((e) => e.endMin > startMin).map((e) => e.column),
    );
    let col = 0;
    while (used.has(col)) col++;

    cluster.push({ appt: a, endMin, column: col });
    result.push({ appointment: a, column: col, columnCount: 0 }); // placeholder; overwritten on flush
  }
  if (cluster.length > 0) flush();
  return result;
}

function WeekView({
  cursor,
  appointments,
  ...handlers
}: {
  cursor: Date;
  appointments: Appointment[];
} & Handlers) {
  const weekStart = startOfWeek(cursor, { weekStartsOn: WEEK_START });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: HOURS_END - HOURS_START }, (_, i) => HOURS_START + i);

  const byDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of appointments) {
      const key = format(parseISO(a.start), "yyyy-MM-dd");
      const list = map.get(key);
      if (list) list.push(a);
      else map.set(key, [a]);
    }
    return map;
  }, [appointments]);

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] border-b bg-muted/40">
            <div />
            {days.map((d) => {
              const today = isToday(d);
              return (
                <div
                  key={d.toISOString()}
                  className={cn(
                    "border-l border-border/60 px-2 py-2 text-center",
                    today && "bg-primary/5",
                  )}
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {format(d, "EEE")}
                  </div>
                  <div
                    className={cn(
                      "mt-0.5 inline-grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-sm font-semibold tabular",
                      today ? "bg-primary text-primary-foreground" : "text-foreground",
                    )}
                  >
                    {format(d, "d")}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))]">
            <div>
              {hours.map((h) => (
                <div
                  key={h}
                  className="h-[60px] border-b border-border/60 pr-2 pt-1 text-right text-[10px] font-medium text-muted-foreground tabular"
                >
                  {String(h).padStart(2, "0")}:00
                </div>
              ))}
            </div>
            {days.map((d) => {
              const items = byDay.get(format(d, "yyyy-MM-dd")) ?? [];
              return (
                <div key={d.toISOString()} className="relative border-l border-border/60">
                  {hours.map((h) => (
                    <div key={h} className="h-[60px] border-b border-border/60" />
                  ))}
                  {layoutOverlaps(items).map(({ appointment: a, column, columnCount }) => {
                    const startD = parseISO(a.start);
                    const startMin = startD.getHours() * 60 + startD.getMinutes();
                    const top =
                      ((startMin - HOURS_START * 60) / 60) * HOUR_HEIGHT_WEEK;
                    const height = (a.durationMin / 60) * HOUR_HEIGHT_WEEK;
                    if (top < 0 || top >= hours.length * HOUR_HEIGHT_WEEK) return null;
                    return (
                      <WeekApptBlock
                        key={a.id}
                        appointment={a}
                        top={top}
                        height={height}
                        column={column}
                        columnCount={columnCount}
                        {...handlers}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function WeekApptBlock({
  appointment,
  top,
  height,
  column,
  columnCount,
  ...handlers
}: {
  appointment: Appointment;
  top: number;
  height: number;
  column: number;
  columnCount: number;
} & Handlers) {
  const s = STATUS_STYLES[appointment.status];
  const startD = parseISO(appointment.start);
  const endD = addMinutes(startD, appointment.durationMin);
  const cancelled = appointment.status === "Cancelled";
  const finalHeight = Math.max(height - 2, 22);
  const gapPct = columnCount > 1 ? 1 : 0;
  const widthPct = 100 / columnCount - gapPct;
  const leftPct = (100 / columnCount) * column;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "absolute overflow-hidden rounded-md border-l-4 px-1.5 py-1 text-left shadow-sm transition-transform hover:z-20 hover:scale-[1.02]",
            s.leftBorder,
            s.chip,
            cancelled && "opacity-60",
          )}
          style={{
            top: `${top}px`,
            height: `${finalHeight}px`,
            left: `calc(${leftPct}% + 2px)`,
            width: `calc(${widthPct}% - 4px)`,
          }}
        >
          <div
            className={cn(
              "truncate text-[11px] font-semibold text-foreground",
              cancelled && "line-through",
            )}
          >
            {appointment.patientName}
          </div>
          {finalHeight > 34 && (
            <div className="truncate text-[10px] text-muted-foreground tabular">
              {format(startD, "HH:mm")}–{format(endD, "HH:mm")}
            </div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <AppointmentDetail appointment={appointment} {...handlers} />
      </PopoverContent>
    </Popover>
  );
}

/* -------------------------- Day view -------------------------- */

const HOUR_HEIGHT_DAY = 84;

function DayView({
  cursor,
  appointments,
  ...handlers
}: {
  cursor: Date;
  appointments: Appointment[];
} & Handlers) {
  const day = cursor;
  const hours = Array.from({ length: HOURS_END - HOURS_START }, (_, i) => HOURS_START + i);
  const items = useMemo(
    () =>
      appointments
        .filter((a) => isSameDay(parseISO(a.start), day))
        .sort((x, y) => x.start.localeCompare(y.start)),
    [appointments, day],
  );

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {format(day, "EEEE")}
          </div>
          <div className="text-lg font-semibold text-foreground tabular">
            {format(day, "MMM d, yyyy")}
          </div>
        </div>
        <div className="text-xs text-muted-foreground tabular">
          {items.length} appointment{items.length === 1 ? "" : "s"}
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="grid min-w-[520px] grid-cols-[70px_1fr]">
          <div>
            {hours.map((h) => (
              <div
                key={h}
                className="h-[84px] border-b border-border/60 pr-2 pt-1 text-right text-xs font-medium text-muted-foreground tabular"
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>
          <div className="relative border-l border-border/60">
            {hours.map((h) => (
              <div key={h} className="h-[84px] border-b border-border/60" />
            ))}
            {items.map((a) => {
              const startD = parseISO(a.start);
              const startMin = startD.getHours() * 60 + startD.getMinutes();
              const top = ((startMin - HOURS_START * 60) / 60) * HOUR_HEIGHT_DAY;
              const height = (a.durationMin / 60) * HOUR_HEIGHT_DAY;
              if (top < 0 || top >= hours.length * HOUR_HEIGHT_DAY) return null;
              return (
                <DayApptBlock
                  key={a.id}
                  appointment={a}
                  top={top}
                  height={height}
                  {...handlers}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function DayApptBlock({
  appointment,
  top,
  height,
  ...handlers
}: {
  appointment: Appointment;
  top: number;
  height: number;
} & Handlers) {
  const s = STATUS_STYLES[appointment.status];
  const startD = parseISO(appointment.start);
  const endD = addMinutes(startD, appointment.durationMin);
  const [first = "", last = ""] = appointment.doctorName.replace("Dr. ", "").split(" ");
  const cancelled = appointment.status === "Cancelled";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "absolute left-2 right-2 flex flex-col overflow-hidden rounded-lg border-l-4 px-3 py-2 text-left shadow-sm transition-transform hover:z-10 hover:scale-[1.01]",
            s.leftBorder,
            s.chip,
            cancelled && "opacity-60",
          )}
          style={{ top: `${top}px`, height: `${Math.max(height - 4, 42)}px` }}
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-background/70 text-[10px] font-semibold text-foreground">
                {(first[0] ?? "") + (last[0] ?? "")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  "truncate text-sm font-semibold text-foreground",
                  cancelled && "line-through",
                )}
              >
                {appointment.patientName}
              </div>
              <div className="truncate text-[11px] text-muted-foreground tabular">
                {format(startD, "HH:mm")}–{format(endD, "HH:mm")} · {appointment.doctorName}
              </div>
            </div>
            <AppointmentStatusBadge status={appointment.status} />
          </div>
          {height > 70 && appointment.reason && (
            <div className="mt-1 truncate pl-8 text-[11px] text-muted-foreground">
              {appointment.reason}
            </div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <AppointmentDetail appointment={appointment} {...handlers} />
      </PopoverContent>
    </Popover>
  );
}
