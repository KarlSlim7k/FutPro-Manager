import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const placeholderModules = ["Temporadas", "Equipos", "Jugadores", "Partidos"];

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <Link
          href="/dashboard/leagues"
          className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
        >
          Volver a ligas
        </Link>
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
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Nombre</p>
            <p className="mt-1 text-sm text-gray-900">{league.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Slug</p>
            <p className="mt-1 text-sm text-gray-900">{league.slug}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Región</p>
            <p className="mt-1 text-sm text-gray-900">{league.region || "No definida"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ciudad</p>
            <p className="mt-1 text-sm text-gray-900">{league.city || "No definida"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</p>
            <p className="mt-1 text-sm text-gray-900">{league.state || "No definido"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">País</p>
            <p className="mt-1 text-sm text-gray-900">{league.country}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</p>
            <p className="mt-1 text-sm text-gray-900">{formatStatus(league.status)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Visibilidad pública
            </p>
            <p className="mt-1 text-sm text-gray-900">{league.is_public ? "Sí" : "No"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ubicación</p>
            <p className="mt-1 text-sm text-gray-900">{getLocation(league) || "Sin ubicación"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Fecha de creación
            </p>
            <p className="mt-1 text-sm text-gray-900">{formatDate(league.created_at)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {placeholderModules.map((moduleName) => (
          <Card key={moduleName}>
            <CardHeader>
              <CardTitle>{moduleName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Módulo en preparación. Aquí se mostrará la gestión de {moduleName.toLowerCase()}.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
