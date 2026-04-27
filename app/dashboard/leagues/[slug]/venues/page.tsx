import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CreateVenueForm } from "@/components/venues/create-venue-form";
import { VenueCard } from "@/components/venues/venue-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { League, Venue } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug">;
type VenueListItem = Pick<Venue, "id" | "name" | "address" | "city" | "state" | "latitude" | "longitude">;

interface LeagueVenuesPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LeagueVenuesPage({ params }: LeagueVenuesPageProps) {
  const { slug } = await params;
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

  const { data: venuesData, error: venuesError } = await supabase
    .from("venues")
    .select("id, name, address, city, state, latitude, longitude")
    .eq("league_id", league.id)
    .order("created_at", { ascending: false });

  if (venuesError) {
    throw venuesError;
  }

  const venues = (venuesData ?? []) as VenueListItem[];

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <Link
          href={`/dashboard/leagues/${league.slug}`}
          className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
        >
          Volver al detalle de liga
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sedes / Canchas</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Administra sedes de <span className="font-medium text-gray-900">{league.name}</span>.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nueva sede</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateVenueForm leagueSlug={league.slug} />
        </CardContent>
      </Card>

      {venues.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Sin sedes registradas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Esta liga aún no tiene sedes visibles para tu usuario.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {venues.map((venue) => (
            <VenueCard key={venue.id} leagueSlug={league.slug} venue={venue} />
          ))}
        </div>
      )}
    </section>
  );
}
