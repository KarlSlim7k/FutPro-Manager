"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import {
  getNavigationForRole,
  getRoleDisplayName,
  type UserDashboardRole,
} from "@/components/dashboard/navigation-config";
import { createClient } from "@/lib/supabase/client";
import { logtoSignOut } from "@/app/logto-actions";
import { useRouter } from "next/navigation";

interface DashboardMobileNavProps {
  role: UserDashboardRole;
  userLabel: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export function DashboardMobileNav({
  role,
  userLabel,
  displayName,
  avatarUrl,
}: DashboardMobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const { primary, drawer } = getNavigationForRole(role);
  const roleLabel = getRoleDisplayName(role);
  const nameToShow = displayName || userLabel;

  // Cerrar drawer si cambia de ruta
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setDrawerOpen(false);
  }

  // Bloquear scroll de fondo cuando el drawer está abierto
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    // Cerrar también la sesión Logto (si no, el proxy te devuelve al dashboard).
    try {
      await logtoSignOut();
    } catch {
      router.replace("/login");
      router.refresh();
    }
  };

  const isMoreActive = drawer.some(
    (item) =>
      item.href === pathname ||
      (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`))
  );

  return (
    <>
      {/* Barra de Navegación Inferior Fija (BottomNav) */}
      <nav
        aria-label="Navegación móvil"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-800 bg-gray-950/95 pb-[calc(env(safe-area-inset-bottom,0px)+0.25rem)] pt-1.5 backdrop-blur-md md:hidden"
      >
        <div className="grid grid-cols-5 items-center px-1">
          {primary.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-[48px] flex-col items-center justify-center rounded-lg py-1 text-center transition touch-manipulation active:scale-95",
                  isActive
                    ? "text-emerald-400 font-semibold"
                    : "text-gray-400 hover:text-gray-200 active:text-white"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} aria-hidden />
                <span className="mt-1 text-[10px] leading-tight truncate max-w-[64px]">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Botón Más / Menú */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            aria-label="Abrir menú secundario"
            className={cn(
              "flex min-h-[48px] flex-col items-center justify-center rounded-lg py-1 text-center transition touch-manipulation active:scale-95",
              isMoreActive || drawerOpen
                ? "text-emerald-400 font-semibold"
                : "text-gray-400 hover:text-gray-200 active:text-white"
            )}
          >
            <Menu className="h-5 w-5" aria-hidden />
            <span className="mt-1 text-[10px] leading-tight">Más</span>
          </button>
        </div>
      </nav>

      {/* Drawer Móvil (Slide-over desde el fondo/derecha) */}
      {drawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menú completo del dashboard"
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="flex max-h-[85dvh] w-full flex-col rounded-t-2xl border-t border-gray-800 bg-gray-950 p-5 text-gray-100 shadow-2xl safe-area-pb"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Drawer */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar src={avatarUrl} fallback={nameToShow} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {nameToShow}
                  </p>
                  <span className="inline-block rounded bg-emerald-950 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-800/60">
                    {roleLabel}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Cerrar menú"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white touch-manipulation"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            {/* Lista de Navegación del Drawer */}
            <div className="flex-1 overflow-y-auto py-3 space-y-1">
              <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Módulos adicionales
              </p>
              {drawer.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex min-h-[48px] items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition touch-manipulation active:bg-gray-800",
                      isActive
                        ? "bg-emerald-900/60 text-emerald-300 font-semibold border border-emerald-700/50"
                        : "text-gray-300 hover:bg-gray-900 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-500" aria-hidden />
                  </Link>
                );
              })}
            </div>

            {/* Footer con Cerrar Sesión */}
            <div className="border-t border-gray-800 pt-3">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-rose-400 transition hover:bg-rose-950/40 hover:text-rose-300 active:bg-rose-950/60 touch-manipulation disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                {isSigningOut ? "Cerrando sesión..." : "Cerrar sesión"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
