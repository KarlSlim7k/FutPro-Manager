import { notFound, redirect } from "next/navigation";
import { CreateVenueForm } from "@/components/venues/create-venue-form";
import { VenueCard } from "@/components/venues/venue-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormSectionCard } from "@/components/ui/form-section-card";
import { PageHeader } from "@/components/ui/page-header";
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
      <PageHeader
        backHref={`/dashboard/leagues/${league.slug}`}
        backLabel="Volver al detalle de liga"
        title="Sedes / Canchas"
        description={
          <>
            Administra sedes de{" "}
            <span className="font-medium text-gray-900">{league.name}</span>.
          </>
        }
      />

      <FormSectionCard title="Nueva sede">
        <CreateVenueForm leagueSlug={league.slug} />
      </FormSectionCard>

      {venues.length === 0 ? (
        <EmptyState
          title="Sin sedes registradas"
          description="Esta liga aún no tiene sedes visibles para tu usuario."
        />
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
