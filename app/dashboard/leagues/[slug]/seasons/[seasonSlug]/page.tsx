import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
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
      <PageHeader
        backHref={`/dashboard/leagues/${league.slug}/seasons`}
        backLabel="Volver a temporadas"
        title={season.name}
        description={
          <>
            Liga: <span className="font-medium text-gray-900">{league.name}</span>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Información de temporada</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Eyebrow>Nombre</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{season.name}</p>
          </div>
          <div>
            <Eyebrow>Slug</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{season.slug}</p>
          </div>
          <div>
            <Eyebrow>Estado</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{formatStatus(season.status)}</p>
          </div>
          <div>
            <Eyebrow>Fecha de creación</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{formatDateTime(season.created_at)}</p>
          </div>
          <div>
            <Eyebrow>Fecha de inicio</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{formatDate(season.start_date)}</p>
          </div>
          <div>
            <Eyebrow>Fecha de fin</Eyebrow>
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
            <TextLink
              href={`/dashboard/leagues/${league.slug}/teams`}
            >
              Ver equipos de la liga
            </TextLink>
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
            <CardTitle>Tabla de posiciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Consulta la clasificación actual de los equipos en esta temporada.
            </p>
            <TextLink
              href={`/dashboard/leagues/${league.slug}/seasons/${season.slug}/standings`}
            >
              Ver tabla de posiciones
            </TextLink>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
