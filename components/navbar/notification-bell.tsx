"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Bell, Trash2, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  deleteNotification,
  deleteAllNotifications,
} from "@/action/notification.action";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Notification = Awaited<ReturnType<typeof getMyNotifications>>[number];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [, startTransition] = useTransition();
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const unread = notifications.filter((n) => !n.read).length;

  async function fetchNotifications() {
    try {
      const data = await getMyNotifications();
      setNotifications(data);
    } catch {
      // silently ignore
    }
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    });
  }

  function handleClickNotification(n: Notification) {
    startTransition(async () => {
      if (!n.read) {
        await markNotificationRead(n.id);
        setNotifications((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
        );
      }
      setOpen(false);
      if (n.link) router.push(n.link);
    });
  }

  function handleDeleteOne() {
    if (confirmDeleteId === null) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    startTransition(async () => {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    });
  }

  function handleDeleteAll() {
    setConfirmDeleteAll(false);
    startTransition(async () => {
      await deleteAllNotifications();
      setNotifications([]);
    });
  }

  function timeAgo(date: Date) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  return (
    <>
      <ConfirmDialog
        open={confirmDeleteId !== null}
        onConfirm={handleDeleteOne}
        onCancel={() => setConfirmDeleteId(null)}
        title="Delete Notification"
        description="Are you sure you want to delete this notification? This cannot be undone."
        confirmLabel="Delete"
      />
      <ConfirmDialog
        open={confirmDeleteAll}
        onConfirm={handleDeleteAll}
        onCancel={() => setConfirmDeleteAll(false)}
        title="Delete All Notifications"
        description="Are you sure you want to delete all notifications? This cannot be undone."
        confirmLabel="Delete All"
      />

      <div className="relative" ref={panelRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="relative flex items-center justify-center rounded-md p-2 text-sidebar-foreground hover:bg-white/10 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold text-foreground">
                Notifications
                {unread > 0 && (
                  <span className="ml-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </span>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button
                    onClick={handleMarkAll}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={() => setConfirmDeleteAll(true)}
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    title="Delete all notifications"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {notifications.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No notifications yet
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-1 pr-2 hover:bg-muted/50 transition-colors ${
                      !n.read ? "bg-primary/5" : ""
                    }`}
                  >
                    {/* Clickable text area */}
                    <button
                      onClick={() => handleClickNotification(n)}
                      className="flex-1 text-left px-4 py-3 min-w-0"
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                        <div className={!n.read ? "" : "pl-4"}>
                          <p className="text-xs font-semibold text-foreground leading-snug">
                            {n.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
                            {n.message}
                          </p>
                          <p className="mt-1 text-[10px] text-muted-foreground/60">
                            {timeAgo(n.createdAt)}
                          </p>
                          {n.link && (
                            <span className="mt-1.5 inline-flex items-center gap-0.5 text-[10px] font-semibold text-primary hover:underline">
                              View <ArrowRight className="h-2.5 w-2.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                    {/* Delete single */}
                    <button
                      onClick={() => setConfirmDeleteId(n.id)}
                      className="mt-3 shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="Delete notification"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
