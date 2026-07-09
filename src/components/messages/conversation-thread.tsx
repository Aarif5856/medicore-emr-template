import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowLeft,
  MoreHorizontal,
  Paperclip,
  Phone,
  Send,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { dayLabel, timeLabel, type Conversation, type Message } from "@/data/messages";

interface Props {
  conversation: Conversation;
  onSend: (text: string) => void;
  onBack?: () => void;
  onViewProfile?: () => void;
}

interface DayGroup {
  day: string;
  messages: Message[];
}

function groupByDay(messages: Message[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const m of messages) {
    const label = dayLabel(m.at);
    const last = groups[groups.length - 1];
    if (last && last.day === label) last.messages.push(m);
    else groups.push({ day: label, messages: [m] });
  }
  return groups;
}

export function ConversationThread({ conversation, onSend, onBack, onViewProfile }: Props) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const groups = useMemo(() => groupByDay(conversation.messages), [conversation.messages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conversation.id, conversation.messages.length]);

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onBack}
            aria-label="Back to conversations"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <span
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-semibold",
            conversation.kind === "staff"
              ? "bg-primary/15 text-primary"
              : "bg-[color:var(--accent-teal)]/15 text-[color:var(--accent-teal)]",
          )}
        >
          {conversation.initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground">
            {conversation.name}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {conversation.subtitle}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Voice call">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Video call">
            <Video className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onViewProfile?.()}>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Mark Unread</DropdownMenuItem>
              <DropdownMenuItem>Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto bg-background px-4 py-4">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {groups.map((g) => (
            <div key={g.day} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border/60" />
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {g.day}
                </span>
                <div className="h-px flex-1 bg-border/60" />
              </div>

              {g.messages.map((m) => {
                const outgoing = m.direction === "out";
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "flex items-end gap-2",
                      outgoing ? "justify-end" : "justify-start",
                    )}
                  >
                    {!outgoing && (
                      <span
                        className={cn(
                          "grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold",
                          conversation.kind === "staff"
                            ? "bg-primary/15 text-primary"
                            : "bg-[color:var(--accent-teal)]/15 text-[color:var(--accent-teal)]",
                        )}
                      >
                        {conversation.initials}
                      </span>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                        outgoing
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm bg-muted text-foreground",
                      )}
                    >
                      <div className="whitespace-pre-wrap break-words">{m.text}</div>
                      <div
                        className={cn(
                          "mt-1 text-[10px] tabular-nums",
                          outgoing
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {timeLabel(m.at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border/60 bg-background p-3">
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-border bg-card px-2 py-1.5">
          <Button variant="ghost" size="icon" aria-label="Attach file" className="shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={`Message ${conversation.name}...`}
            rows={1}
            className="max-h-40 min-h-[36px] flex-1 resize-none bg-transparent px-1 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <Button
            type="button"
            size="icon"
            onClick={submit}
            disabled={!draft.trim()}
            aria-label="Send message"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
