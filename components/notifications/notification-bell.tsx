"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, ExternalLink } from "lucide-react";
import { markNotificationAsReadAction, markAllNotificationsAsReadAction } from "@/app/dashboard/notifications/actions";
import type { UserNotification } from "@/types/database";

interface NotificationBellProps {
  notifications: UserNotification[];
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return "Hace un momento";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `Hace ${diffDays} d`;

    return new Intl.DateTimeFormat("es-MX", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function NotificationBell({ notifications }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsAsReadAction();
    });
  };

  const handleNotificationClick = (notification: UserNotification) => {
    if (!notification.read_at) {
      startTransition(async () => {
        await markNotificationAsReadAction(notification.id);
      });
    }
    if (notification.link_url) {
      setIsOpen(false);
      router.push(notification.link_url);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Notificaciones (${unreadCount} no leídas)`}
        aria-expanded={isOpen}
        className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-gray-200 bg-white shadow-lg ring-1 ring-black/5 z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 bg-gray-50/70">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">Notificaciones</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                  {unreadCount} nuevas
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isPending}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800 disabled:opacity-50"
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          <div className="max-h-96 divide-y divide-gray-100 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center px-4">
                <Bell className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Sin notificaciones pendientes</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const isUnread = !notification.read_at;
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    role={notification.link_url ? "button" : undefined}
                    tabIndex={notification.link_url ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleNotificationClick(notification);
                      }
                    }}
                    className={`flex items-start gap-3 p-3.5 text-left transition-colors cursor-pointer hover:bg-gray-50 ${
                      isUnread ? "bg-emerald-50/30" : ""
                    }`}
                  >
                    <div className="mt-1 shrink-0">
                      {isUnread ? (
                        <span className="block h-2 w-2 rounded-full bg-emerald-600" aria-label="No leída" />
                      ) : (
                        <Check className="h-3.5 w-3.5 text-gray-300" aria-hidden="true" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-gray-400">
                        <span>{formatRelativeTime(notification.created_at)}</span>
                        {notification.link_url && (
                          <span className="flex items-center gap-0.5 text-emerald-700 font-medium hover:underline">
                            Ver detalle <ExternalLink className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
