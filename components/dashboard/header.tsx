"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  userLabel: string;
}

export function DashboardHeader({ userLabel }: DashboardHeaderProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setError(null);
    setIsLoading(true);

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError("No se pudo cerrar sesión. Inténtalo nuevamente.");
      setIsLoading(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-gray-500">Sesión activa</p>
          <p className="text-sm font-semibold text-gray-900">{userLabel}</p>
        </div>

        <div className="flex items-center gap-3">
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
