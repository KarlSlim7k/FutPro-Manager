import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TextLink } from "@/components/ui/text-link";
import { createClient } from "@/lib/supabase/server";
import type { League } from "@/types/database";

type LeagueDetail = Pick<
  League,
  "id" | "name" | "slug" | "region" | "city" | "state" | "country" | "status" | "is_public" | "created_at"
>;

interface LeagueDetailPageProps {
  params: Promise<{ slug: string }>;
}

function formatStatus(status: League["status"]) {
  return status.replace(/_/g, " ");
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(date));
}

function getLocation(league: LeagueDetail) {
  return [league.city, league.state, league.region, league.country]
    .filter((value): value is string => Boolean(value))
    .join(", ");
}

export default async function LeagueDetailPage({ params }: LeagueDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("leagues")
    .select("id, name, slug, region, city, state, country, status, is_public, created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    notFound();
  }

  const league = data as LeagueDetail;

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <TextLink
          href="/dashboard/leagues"
        >
          Volver a ligas
        </TextLink>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{league.name}</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">/{league.slug}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información general</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Eyebrow>Nombre</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{league.name}</p>
          </div>
          <div>
            <Eyebrow>Slug</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{league.slug}</p>
          </div>
          <div>
            <Eyebrow>Región</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{league.region || "No definida"}</p>
          </div>
          <div>
            <Eyebrow>Ciudad</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{league.city || "No definida"}</p>
          </div>
          <div>
            <Eyebrow>Estado</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{league.state || "No definido"}</p>
          </div>
          <div>
            <Eyebrow>País</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{league.country}</p>
          </div>
          <div>
            <Eyebrow>Status</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{formatStatus(league.status)}</p>
          </div>
          <div>
            <Eyebrow>Visibilidad pública</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{league.is_public ? "Sí" : "No"}</p>
          </div>
          <div className="sm:col-span-2">
            <Eyebrow>Ubicación</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{getLocation(league) || "Sin ubicación"}</p>
          </div>
          <div className="sm:col-span-2">
            <Eyebrow>Fecha de creación</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{formatDate(league.created_at)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Temporadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Administra periodos competitivos, estado y fechas clave de la liga.
            </p>
            <TextLink
              href={`/dashboard/leagues/${league.slug}/seasons`}
            >
              Ver temporadas
            </TextLink>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Administra equipos, identidad visual y estado competitivo de la liga.
            </p>
            <TextLink
              href={`/dashboard/leagues/${league.slug}/teams`}
            >
              Ver equipos
            </TextLink>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jugadores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Consolida fichas base de jugadores y su estado deportivo en la liga.
            </p>
            <TextLink
              href={`/dashboard/leagues/${league.slug}/players`}
            >
              Ver jugadores
            </TextLink>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sedes / Canchas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Administra sedes, ubicación y datos geográficos para la programación de partidos.
            </p>
            <TextLink
              href={`/dashboard/leagues/${league.slug}/venues`}
            >
              Ver sedes
            </TextLink>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Partidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Administra la programación de partidos, calendario y estatus de los encuentros.
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
              Consulta la clasificación de equipos por temporada, puntos y diferencia de goles.
            </p>
            <TextLink
              href={`/dashboard/leagues/${league.slug}/standings`}
            >
              Ver tabla de posiciones
            </TextLink>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
