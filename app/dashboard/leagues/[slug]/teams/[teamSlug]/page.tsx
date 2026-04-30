import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
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
      <PageHeader
        backHref={`/dashboard/leagues/${league.slug}/teams`}
        backLabel="Volver a equipos"
        title={team.name}
        description={
          <>
            Liga: <span className="font-medium text-gray-900">{league.name}</span>
          </>
        }
        action={
          <div className="flex flex-wrap items-center gap-4">
            <TextLink href={`/dashboard/leagues/${league.slug}/teams/${team.slug}/roster`}>
              Ver plantilla
            </TextLink>
            <TextLink href={`/dashboard/leagues/${league.slug}/teams/${team.slug}/edit`}>
              Editar equipo
            </TextLink>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Información del equipo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Eyebrow>Nombre</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{team.name}</p>
          </div>
          <div>
            <Eyebrow>Slug</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{team.slug}</p>
          </div>
          <div>
            <Eyebrow>Estado</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{formatStatus(team.status)}</p>
          </div>
          <div>
            <Eyebrow>Fecha de creación</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{formatDateTime(team.created_at)}</p>
          </div>
          <div>
            <Eyebrow>Logo</Eyebrow>
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
            <Eyebrow>Año de fundación</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">
              {team.founded_year ? String(team.founded_year) : "No definido"}
            </p>
          </div>
          <div>
            <Eyebrow>Color primario</Eyebrow>
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
            <Eyebrow>Color secundario</Eyebrow>
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
            <TextLink
              href={`/dashboard/leagues/${league.slug}/teams/${team.slug}/roster`}
            >
              Ver plantilla
            </TextLink>
            <TextLink
              href={`/dashboard/leagues/${league.slug}/players`}
            >
              Ver jugadores de la liga
            </TextLink>
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
            <TextLink
              href={`/dashboard/leagues/${league.slug}/matches`}
            >
              Ver partidos
            </TextLink>
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
