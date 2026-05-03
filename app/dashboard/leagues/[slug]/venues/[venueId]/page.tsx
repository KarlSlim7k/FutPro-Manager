import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ExternalTextLink } from "@/components/ui/external-text-link";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { createClient } from "@/lib/supabase/server";
import type { League, Venue } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug">;
type VenueDetail = Pick<
  Venue,
  "id" | "name" | "address" | "city" | "state" | "latitude" | "longitude" | "created_at"
>;

interface VenueDetailPageProps {
  params: Promise<{ slug: string; venueId: string }>;
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(date));
}

export default async function VenueDetailPage({ params }: VenueDetailPageProps) {
  const { slug, venueId } = await params;
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

  const { data: venueData, error: venueError } = await supabase
    .from("venues")
    .select("id, name, address, city, state, latitude, longitude, created_at")
    .eq("league_id", league.id)
    .eq("id", venueId)
    .maybeSingle();

  if (venueError) {
    throw venueError;
  }

  if (!venueData) {
    notFound();
  }

  const venue = venueData as VenueDetail;
  const hasCoordinates = venue.latitude !== null && venue.longitude !== null;
  const mapsUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${venue.latitude},${venue.longitude}`
    : null;

  return (
    <section className="space-y-6">
      <PageHeader
        backHref={`/dashboard/leagues/${league.slug}/venues`}
        backLabel="Volver a sedes"
        title={venue.name}
        description={
          <>
            Liga: <span className="font-medium text-gray-900">{league.name}</span>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Información de la sede</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Eyebrow>Nombre</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{venue.name}</p>
          </div>
          <div>
            <Eyebrow>Dirección</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{venue.address || "No definida"}</p>
          </div>
          <div>
            <Eyebrow>Ciudad</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{venue.city || "No definida"}</p>
          </div>
          <div>
            <Eyebrow>Estado</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{venue.state || "No definido"}</p>
          </div>
          <div>
            <Eyebrow>Latitud</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">
              {venue.latitude !== null ? String(venue.latitude) : "No definida"}
            </p>
          </div>
          <div>
            <Eyebrow>Longitud</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">
              {venue.longitude !== null ? String(venue.longitude) : "No definida"}
            </p>
          </div>
          <div className="sm:col-span-2">
            <Eyebrow>Google Maps</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">
              {mapsUrl ? (
                <ExternalTextLink href={mapsUrl}>
                  Ver ubicación en mapa
                </ExternalTextLink>
              ) : (
                "No disponible (falta latitud/longitud)"
              )}
            </p>
          </div>
          <div className="sm:col-span-2">
            <Eyebrow>Fecha de creación</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{formatDateTime(venue.created_at)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Partidos programados en esta sede</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            Módulo en preparación. Aquí se mostrarán los partidos asociados a esta sede.
          </p>
          <TextLink
            href={`/dashboard/leagues/${league.slug}/matches`}
          >
            Ver partidos de la liga
          </TextLink>
        </CardContent>
      </Card>
    </section>
  );
}
