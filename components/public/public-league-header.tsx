import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PublicShareButton } from "@/components/public/public-share-button";
import type { League } from "@/types/database";

type PublicLeagueHeaderProps = {
  league: Pick<League, "name" | "slug" | "description" | "status"> & { logo_url?: string | null };
};

export function PublicLeagueHeader({ league }: PublicLeagueHeaderProps) {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-slate-900/70 p-5 sm:p-6 backdrop-blur-xl shadow-xl text-white">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/explorar"
            className="group inline-flex min-h-[40px] items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" aria-hidden />
            <span>Explorar ligas</span>
          </Link>
          <PublicShareButton title={league.name} />
        </div>

        <div className="flex items-center gap-3 sm:gap-4 min-w-0 pt-1">
          {league.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={league.logo_url}
              alt={`Logo de ${league.name}`}
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl border border-white/15 object-contain shrink-0 bg-white/5 p-1"
            />
          ) : null}
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-3xl break-words">
              {league.name}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {league.status === "active" ? "Liga activa" : `Estado: ${league.status}`}
              </span>
            </div>
          </div>
        </div>

        {league.description ? (
          <p className="text-sm leading-relaxed text-gray-300 break-words pt-1">{league.description}</p>
        ) : null}
      </div>
    </div>
  );
}
