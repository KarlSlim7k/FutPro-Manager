import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PageHeader } from "@/components/ui/page-header";
import { EntityImagePreview } from "@/components/media/entity-image-preview";
import { EntityImageUploadForm } from "@/components/media/entity-image-upload-form";
import { updateLeagueLogoAction } from "@/app/dashboard/leagues/[slug]/media/actions";
import { TextLink } from "@/components/ui/text-link";
import { createClient } from "@/lib/supabase/server";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";
import type { League } from "@/types/database";

type LeagueDetail = Pick<
  League,
  "id" | "name" | "slug" | "logo_url" | "region" | "city" | "state" | "country" | "status" | "is_public" | "created_at"
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
    .select("id, name, slug, logo_url, region, city, state, country, status, is_public, created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    notFound();
  }

  const league = data as LeagueDetail;

  const permissions = await getLeaguePermissions({
    supabase,
    userId: user.id,
    leagueId: league.id,
  });

  return (
    <section className="space-y-6">
      <PageHeader
        backHref="/dashboard/leagues"
        backLabel="Volver a ligas"
        title={league.name}
        description={`/${league.slug}`}
      />

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

      <Card>
        <CardHeader><CardTitle>Logo de liga</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <EntityImagePreview imageUrl={league.logo_url} alt={`Logo de ${league.name}`} label="Logo" />
          {permissions.canManageLeague ? (
            <EntityImageUploadForm
              action={updateLeagueLogoAction.bind(null, league.slug)}
              helpText="Permitidos: JPG, PNG, WEBP, SVG. Máximo: 2 MB."
              buttonText="Actualizar logo"
            />
          ) : null}
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

        <Card>
          <CardHeader>
            <CardTitle>Miembros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Consulta o administra los miembros y roles de la liga.
            </p>
            <TextLink
              href={`/dashboard/leagues/${league.slug}/members`}
            >
              Ver miembros
            </TextLink>
          </CardContent>
        </Card>

        {permissions.canViewAuditLogs && (
          <Card>
            <CardHeader>
              <CardTitle>Auditoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Consulta el historial de acciones administrativas realizadas en la liga.
              </p>
              <TextLink href={`/dashboard/leagues/${league.slug}/audit`}>
                Ver auditoria
              </TextLink>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
