import { useState } from "react";
import { Bell, Moon, Search, Sun, User, LogOut, Settings as SettingsIcon } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/hooks/use-theme";
import { useNotifications } from "@/components/notifications/store";
import { visualFor } from "@/components/notifications/visuals";
import { relativeNotificationTime, type NotificationItem } from "@/data/notifications";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const { theme, toggleTheme, mounted } = useTheme();
  const { notifications, unreadCount, markRead } = useNotifications();
  const navigate = useNavigate();

  const recent = notifications.slice(0, 5);

  const handleItemClick = (n: NotificationItem) => {
    if (!n.read) markRead(n.id);
    if (n.patientId) {
      navigate({ to: "/patients/$patientId", params: { patientId: n.patientId } });
      return;
    }
    switch (n.href) {
      case "/appointments":
        navigate({ to: "/appointments" });
        break;
      case "/laboratory":
        navigate({ to: "/laboratory" });
        break;
      case "/billing":
        navigate({ to: "/billing" });
        break;
      case "/pharmacy":
        navigate({ to: "/pharmacy" });
        break;
      case "/staff":
        navigate({ to: "/staff" });
        break;
      default:
        navigate({ to: "/notifications" });
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-md sm:px-4">
      <SidebarTrigger className="h-9 w-9" />
      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Search */}
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search patients, doctors, records…"
          className="h-9 bg-muted/60 ps-9 pe-16 text-sm focus-visible:bg-background"
        />
        <kbd className="pointer-events-none absolute end-2 top-1/2 hidden -translate-y-1/2 select-none items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
          ⌘K
        </kbd>
      </div>

      <div className="ms-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="relative"
        >
          {mounted && theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute end-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground tabular">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-[22rem] p-0"
          >
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
              <div className="text-sm font-semibold text-foreground">Notifications</div>
              <span className="text-[11px] text-muted-foreground">
                {unreadCount} unread
              </span>
            </div>
            {recent.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No notifications
              </div>
            ) : (
              <ul className="max-h-[22rem] divide-y divide-border/60 overflow-y-auto">
                {recent.map((n) => {
                  const v = visualFor(n);
                  const Icon = v.Icon;
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => handleItemClick(n)}
                        className={cn(
                          "grid w-full grid-cols-[auto_minmax(0,1fr)] items-start gap-3 px-4 py-3 text-start transition-colors hover:bg-muted/40",
                          !n.read && "bg-primary/[0.04]",
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-9 w-9 shrink-0 place-items-center rounded-full",
                            v.wrapClass,
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <div
                            className={cn(
                              "truncate text-xs",
                              n.read ? "font-medium text-foreground/80" : "font-semibold text-foreground",
                            )}
                          >
                            {n.title}
                          </div>
                          <div className="line-clamp-2 text-[11px] text-muted-foreground">
                            {n.description}
                          </div>
                          <div className="mt-0.5 text-[10px] tabular-nums text-muted-foreground">
                            {relativeNotificationTime(n.at)}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="border-t border-border/60 p-2">
              <Link
                to="/notifications"
                className="block rounded-md px-3 py-2 text-center text-xs font-medium text-primary hover:bg-primary/10"
              >
                View all notifications
              </Link>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="ms-1 h-9 gap-2 px-1.5">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-semibold">
                  DR
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-start leading-tight sm:block">
                <div className="text-xs font-semibold text-foreground">Dr. Reyes</div>
                <div className="text-[10px] text-muted-foreground">Administrator</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="me-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SettingsIcon className="me-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="me-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
