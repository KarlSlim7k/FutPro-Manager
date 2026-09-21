"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { GlobalSearchTrigger } from "@/components/search/global-search-trigger";
import type { UserNotification } from "@/types/database";

interface DashboardHeaderProps {
  userLabel: string;
  avatarUrl?: string | null;
  displayName?: string | null;
  notifications?: UserNotification[];
}

export function DashboardHeader({
  userLabel,
  avatarUrl,
  displayName,
  notifications = [],
}: DashboardHeaderProps) {
  const supabase = useMemo(() => createClient(), []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await supabase.auth.signOut();
    } catch {
      // Silenciar error del cliente
    }

    // Redirección completa a /api/auth/sign-out para revocar y destruir sesiones en Logto y Supabase
    window.location.href = "/api/auth/sign-out";
  };

  const nameToShow = displayName || userLabel;

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link
          href="/dashboard/profile"
          className="group flex items-center gap-3 rounded-lg p-1 transition hover:bg-gray-50"
          title="Ver y editar mi perfil"
        >
          <Avatar src={avatarUrl} fallback={nameToShow} size="md" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700">
                {nameToShow}
              </span>
              <span className="text-xs text-gray-400 group-hover:text-gray-600">→</span>
            </div>
            <p className="text-xs text-gray-500">Sesión activa • Editar perfil</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <GlobalSearchTrigger className="hidden md:inline-flex" />
          <NotificationBell notifications={notifications} />
          {error ? (
            <p className="text-xs text-red-600 sm:text-sm">{error}</p>
          ) : null}
          <Button
            variant="secondary"
            onClick={handleSignOut}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? "Cerrando sesión..." : "Cerrar sesión"}
          </Button>
        </div>
      </div>
    </header>
  );
}
