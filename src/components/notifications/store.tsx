import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  NOTIFICATIONS_SEED,
  type NotificationItem,
} from "@/data/notifications";

interface NotificationsCtx {
  notifications: NotificationItem[];
  unreadCount: number;
  markRead: (id: string) => void;
  markUnread: (id: string) => void;
  toggleRead: (id: string) => void;
  dismiss: (id: string) => void;
  markAllRead: () => void;
}

const Ctx = createContext<NotificationsCtx | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    () => NOTIFICATIONS_SEED,
  );

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);
  const markUnread = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: false } : n)),
    );
  }, []);
  const toggleRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
    );
  }, []);
  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);
  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const value = useMemo<NotificationsCtx>(
    () => ({
      notifications,
      unreadCount,
      markRead,
      markUnread,
      toggleRead,
      dismiss,
      markAllRead,
    }),
    [notifications, unreadCount, markRead, markUnread, toggleRead, dismiss, markAllRead],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNotifications(): NotificationsCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useNotifications must be used within NotificationsProvider");
  return v;
}
