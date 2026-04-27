import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { League, Team } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug">;
type TeamDetail = Pick<
  Team,
  | "id"
  | "name"
  | "slug"
  | "status"
  | "logo_url"
  | "primary_color"
  | "secondary_color"
  | "founded_year"
  | "created_at"
>;

interface TeamDetailPageProps {
  params: Promise<{ slug: string; teamSlug: string }>;
}

function formatStatus(status: Team["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(date));
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { slug, teamSlug } = await params;
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

  const { data: teamData, error: teamError } = await supabase
    .from("teams")
    .select("id, name, slug, status, logo_url, primary_color, secondary_color, founded_year, created_at")
    .eq("league_id", league.id)
    .eq("slug", teamSlug)
    .maybeSingle();

  if (teamError) {
    throw teamError;
  }

  if (!teamData) {
    notFound();
  }

  const team = teamData as TeamDetail;

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={`/dashboard/leagues/${league.slug}/teams`}
            className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
          >
            Volver a equipos
          </Link>
          <Link
            href={`/dashboard/leagues/${league.slug}/teams/${team.slug}/edit`}
            className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
          >
            Editar equipo
          </Link>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{team.name}</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Liga: <span className="font-medium text-gray-900">{league.name}</span>
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del equipo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Nombre</p>
            <p className="mt-1 text-sm text-gray-900">{team.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Slug</p>
            <p className="mt-1 text-sm text-gray-900">{team.slug}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</p>
            <p className="mt-1 text-sm text-gray-900">{formatStatus(team.status)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Fecha de creación
            </p>
            <p className="mt-1 text-sm text-gray-900">{formatDateTime(team.created_at)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Logo</p>
            <p className="mt-1 text-sm text-gray-900">
              {team.logo_url ? (
                <a
                  href={team.logo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-emerald-700 hover:text-emerald-600"
                >
                  Ver logo
                </a>
              ) : (
                "No definido"
              )}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Año de fundación
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {team.founded_year ? String(team.founded_year) : "No definido"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Color primario</p>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-900">
              {team.primary_color ? (
                <>
                  <span
                    className="inline-flex h-4 w-4 rounded border border-gray-300"
                    style={{ backgroundColor: team.primary_color }}
                  />
                  {team.primary_color}
                </>
              ) : (
                "No definido"
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Color secundario
            </p>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-900">
              {team.secondary_color ? (
                <>
                  <span
                    className="inline-flex h-4 w-4 rounded border border-gray-300"
                    style={{ backgroundColor: team.secondary_color }}
                  />
                  {team.secondary_color}
                </>
              ) : (
                "No definido"
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Plantilla / Jugadores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Registra jugadores por temporada y consulta la plantilla activa del equipo.
            </p>
            <Link
              href={`/dashboard/leagues/${league.slug}/teams/${team.slug}/roster`}
              className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
            >
              Ver plantilla por temporada
            </Link>
            <Link
              href={`/dashboard/leagues/${league.slug}/players`}
              className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
            >
              Ver jugadores de la liga
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Módulo en preparación.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Partidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Consulta la programación de partidos de la liga.
            </p>
            <Link
              href={`/dashboard/leagues/${league.slug}/matches`}
              className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
            >
              Ver partidos
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Módulo en preparación.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
