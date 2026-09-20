"use client";

import { useEffect, useState, useCallback } from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import {
  getUnsyncedEvents,
  getUnsyncedScore,
  markEventAsSynced,
  markScoreAsSynced,
  clearAllOfflineSynced,
  type OfflineMatchEvent,
  type OfflineMatchScore,
} from "@/lib/offline/offline-store";
import { syncOfflineMatchDataAction } from "@/app/dashboard/leagues/[slug]/matches/[matchId]/offline/actions";

interface OfflineStatusBannerProps {
  leagueSlug: string;
  matchId: string;
  onSyncComplete?: () => void;
}

export function OfflineStatusBanner({
  leagueSlug,
  matchId,
  onSyncComplete,
}: OfflineStatusBannerProps) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingEvents, setPendingEvents] = useState<OfflineMatchEvent[]>([]);
  const [pendingScore, setPendingScore] = useState<OfflineMatchScore | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const refreshPendingCount = useCallback(async () => {
    try {
      const [events, score] = await Promise.all([
        getUnsyncedEvents(matchId),
        getUnsyncedScore(matchId),
      ]);
      setPendingEvents(events);
      setPendingScore(score);
    } catch {
      // IndexedDB might not be available
    }
  }, [matchId]);

  const handleSync = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;
    if (pendingEvents.length === 0 && !pendingScore) return;

    setIsSyncing(true);
    setSyncFeedback(null);

    try {
      const res = await syncOfflineMatchDataAction(leagueSlug, matchId, {
        events: pendingEvents.map((e) => ({
          id: e.id,
          teamId: e.teamId,
          playerId: e.playerId,
          eventType: e.eventType,
          minute: e.minute,
          notes: e.notes,
        })),
        score: pendingScore
          ? {
              homeScore: pendingScore.homeScore,
              awayScore: pendingScore.awayScore,
              status: pendingScore.status,
            }
          : null,
      });

      if (res.success) {
        // Mark synced in local store
        await Promise.all([
          ...res.syncedEventIds.map((id) => markEventAsSynced(id)),
          res.scoreSynced && pendingScore ? markScoreAsSynced(matchId) : Promise.resolve(),
        ]);
        await clearAllOfflineSynced();
        await refreshPendingCount();

        setSyncFeedback("¡Datos sincronizados exitosamente con el servidor!");
        setTimeout(() => setSyncFeedback(null), 3000);
        if (onSyncComplete) onSyncComplete();
      } else {
        setSyncFeedback(`Error de sincronización: ${res.error}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Fallo de conexión";
      setSyncFeedback(`Error: ${msg}`);
    } finally {
      setIsSyncing(false);
    }
  }, [leagueSlug, matchId, pendingEvents, pendingScore, isSyncing, onSyncComplete, refreshPendingCount]);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    refreshPendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      refreshPendingCount();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodic check for unsynced changes
    const interval = setInterval(refreshPendingCount, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [refreshPendingCount]);

  // Auto-sync when coming back online if pending items exist
  useEffect(() => {
    if (isOnline && (pendingEvents.length > 0 || pendingScore)) {
      handleSync();
    }
  }, [isOnline, pendingEvents.length, pendingScore, handleSync]);

  const totalPending = pendingEvents.length + (pendingScore ? 1 : 0);

  if (isOnline && totalPending === 0 && !syncFeedback) {
    return null; // Silent when everything is synchronized and connected
  }

  return (
    <div
      className={`rounded-lg p-3 text-xs font-medium transition-all shadow-md flex items-center justify-between gap-3 ${
        !isOnline
          ? "bg-amber-950/80 border border-amber-800 text-amber-200"
          : totalPending > 0
          ? "bg-blue-950/80 border border-blue-800 text-blue-200"
          : "bg-emerald-950/80 border border-emerald-800 text-emerald-200"
      }`}
    >
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <WifiOff className="h-4 w-4 text-amber-400 flex-shrink-0 animate-pulse" />
        ) : totalPending > 0 ? (
          <RefreshCw className="h-4 w-4 text-blue-400 flex-shrink-0" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
        )}

        <span>
          {!isOnline
            ? `Modo Cancha sin señal. Los cambios se guardan localmente (${totalPending} pendientes).`
            : totalPending > 0
            ? `${totalPending} registro(s) pendientes de subir a la nube.`
            : syncFeedback}
        </span>
      </div>

      {isOnline && totalPending > 0 && (
        <button
          type="button"
          disabled={isSyncing}
          onClick={handleSync}
          className="inline-flex items-center gap-1 rounded bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Subiendo..." : "Sincronizar"}
        </button>
      )}
    </div>
  );
}
