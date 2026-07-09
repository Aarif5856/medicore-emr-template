import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { relativeTime, type Conversation } from "@/data/messages";

type Filter = "all" | "unread" | "staff" | "patients";

export function ConversationList({
  conversations,
  activeId,
  onSelect,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return conversations.filter((c) => {
      if (filter === "unread" && c.unread === 0) return false;
      if (filter === "staff" && c.kind !== "staff") return false;
      if (filter === "patients" && c.kind !== "patient") return false;
      if (!query) return true;
      return (
        c.name.toLowerCase().includes(query) ||
        c.subtitle.toLowerCase().includes(query) ||
        c.messages.some((m) => m.text.toLowerCase().includes(query))
      );
    });
  }, [conversations, q, filter]);

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-border/60 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search conversations..."
            className="pl-9"
          />
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
            <TabsTrigger value="staff" className="text-xs">Staff</TabsTrigger>
            <TabsTrigger value="patients" className="text-xs">Patients</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No conversations match.
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            {filtered.map((c) => {
              const last = c.messages[c.messages.length - 1];
              const active = c.id === activeId;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className={cn(
                      "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 px-3 py-3 text-left transition-colors",
                      active
                        ? "bg-primary/10"
                        : "hover:bg-muted/40",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-semibold",
                        c.kind === "staff"
                          ? "bg-primary/15 text-primary"
                          : "bg-[color:var(--accent-teal)]/15 text-[color:var(--accent-teal)]",
                      )}
                    >
                      {c.initials}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {c.name}
                        </span>
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {c.subtitle}
                      </div>
                      <div className="mt-1 truncate text-xs text-muted-foreground">
                        {last?.direction === "out" ? "You: " : ""}
                        {last?.text}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {last ? relativeTime(last.at) : ""}
                      </span>
                      {c.unread > 0 && (
                        <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
