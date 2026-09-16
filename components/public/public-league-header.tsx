import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PublicShareButton } from "@/components/public/public-share-button";
import type { League } from "@/types/database";

type PublicLeagueHeaderProps = {
  league: Pick<League, "name" | "slug" | "description" | "status"> & { logo_url?: string | null };
};

export function PublicLeagueHeader({ league }: PublicLeagueHeaderProps) {
  return (
    <Card className="border-gray-200 bg-white">
      <CardContent className="space-y-2 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/explorar"
            className="inline-flex min-h-[44px] items-center gap-1.5 py-2 text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded touch-manipulation"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Explorar ligas
          </Link>
          <PublicShareButton title={league.name} />
        </div>
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {league.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={league.logo_url}
              alt={`Logo de ${league.name}`}
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg border border-gray-200 object-contain shrink-0"
            />
          ) : null}
          <h1 className="min-w-0 text-xl font-bold tracking-tight text-gray-900 sm:text-3xl break-words">
            {league.name}
          </h1>
        </div>
        {league.description ? (
          <p className="text-sm text-gray-600 break-words">{league.description}</p>
        ) : null}
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {league.status === "active" ? "Liga activa" : `Estado: ${league.status}`}
        </p>
      </CardContent>
    </Card>
  );
}
