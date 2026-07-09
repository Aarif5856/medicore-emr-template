import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader } from "@/components/coming-soon";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ConversationList } from "@/components/messages/conversation-list";
import { ConversationThread } from "@/components/messages/conversation-thread";
import { StaffProfileSheet } from "@/components/staff/profile-sheet";
import { STAFF, type StaffMember } from "@/data/staff";
import { toast } from "sonner";
import { CONVERSATIONS, type Conversation, type Message } from "@/data/messages";

export const Route = createFileRoute("/_app/messages")({
  head: () => ({ meta: [{ title: "Messages — MediCore EMR" }] }),
  component: MessagesPage,
});

function MessagesPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS);
  const [activeId, setActiveId] = useState<string | null>(CONVERSATIONS[0]?.id ?? null);
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");
  const [staffProfile, setStaffProfile] = useState<StaffMember | null>(null);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const handleSelect = (id: string) => {
    setActiveId(id);
    setMobileView("thread");
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    );
  };

  const handleSend = (text: string) => {
    if (!activeId) return;
    const newMsg: Message = {
      id: `MSG-${Date.now()}`,
      direction: "out",
      text,
      at: new Date().toISOString(),
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId ? { ...c, messages: [...c.messages, newMsg] } : c,
      ),
    );
  };

  const handleViewProfile = () => {
    if (!active) return;
    if (active.kind === "patient") {
      navigate({ to: "/patients/$patientId", params: { patientId: active.refId } });
      return;
    }
    const member = STAFF.find((s) => s.id === active.refId);
    if (member) setStaffProfile(member);
    else toast.error("Staff profile not found");
  };

  return (
    <div className="flex h-full min-h-0 flex-col space-y-4">
      <Breadcrumbs />
      <PageHeader
        title="Messages"
        description="Secure conversations with colleagues and patients — right in the clinic workspace."
      />

      <Card className="card-glass min-h-0 flex-1 overflow-hidden p-0">
        <div className="grid h-[calc(100vh-14rem)] min-h-[540px] grid-cols-1 md:grid-cols-[340px_minmax(0,1fr)]">
          <aside
            className={cn(
              "min-h-0 border-r border-border/60 bg-card/40",
              mobileView === "thread" ? "hidden md:block" : "block",
            )}
          >
            <ConversationList
              conversations={conversations}
              activeId={activeId}
              onSelect={handleSelect}
            />
          </aside>

          <section
            className={cn(
              "min-h-0",
              mobileView === "list" ? "hidden md:block" : "block",
            )}
          >
            {active ? (
              <ConversationThread
                conversation={active}
                onSend={handleSend}
                onBack={() => setMobileView("list")}
                onViewProfile={handleViewProfile}
              />
            ) : (
              <div className="grid h-full place-items-center p-8 text-center">
                <div className="max-w-sm space-y-3">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary glow-primary">
                    <MessageSquare className="h-7 w-7" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">No conversation selected</h2>
                  <p className="text-sm text-muted-foreground">
                    Select a conversation to start messaging.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </Card>
    </div>
  );
}
