import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { League, Season } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug">;
type SeasonDetail = Pick<
  Season,
  "id" | "name" | "slug" | "status" | "start_date" | "end_date" | "created_at"
>;

interface SeasonDetailPageProps {
  params: Promise<{ slug: string; seasonSlug: string }>;
}

function formatStatus(status: Season["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
  }).format(new Date(date));
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(date));
}

export default async function SeasonDetailPage({ params }: SeasonDetailPageProps) {
  const { slug, seasonSlug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: leagueData, error: leagueError } = await supabase
    .from("leagues")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (leagueError) {
    throw leagueError;
  }

  if (!leagueData) {
    notFound();
  }

  const league = leagueData as LeagueSummary;

  const { data: seasonData, error: seasonError } = await supabase
    .from("seasons")
    .select("id, name, slug, status, start_date, end_date, created_at")
    .eq("league_id", league.id)
    .eq("slug", seasonSlug)
    .maybeSingle();

  if (seasonError) {
    throw seasonError;
  }

  if (!seasonData) {
    notFound();
  }

  const season = seasonData as SeasonDetail;

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <Link
          href={`/dashboard/leagues/${league.slug}/seasons`}
          className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
        >
          Volver a temporadas
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{season.name}</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Liga: <span className="font-medium text-gray-900">{league.name}</span>
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de temporada</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Nombre</p>
            <p className="mt-1 text-sm text-gray-900">{season.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Slug</p>
            <p className="mt-1 text-sm text-gray-900">{season.slug}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</p>
            <p className="mt-1 text-sm text-gray-900">{formatStatus(season.status)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Fecha de creación
            </p>
            <p className="mt-1 text-sm text-gray-900">{formatDateTime(season.created_at)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Fecha de inicio
            </p>
            <p className="mt-1 text-sm text-gray-900">{formatDate(season.start_date)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Fecha de fin
            </p>
            <p className="mt-1 text-sm text-gray-900">{formatDate(season.end_date)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Equipos de la temporada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Consulta el catálogo de equipos de la liga para gestionar registros por temporada.
            </p>
            <Link
              href={`/dashboard/leagues/${league.slug}/teams`}
              className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
            >
              Ver equipos de la liga
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Partidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Módulo en preparación.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tabla de posiciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Módulo en preparación.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
