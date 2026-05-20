import { redirect } from "next/navigation";
import { CreateLeagueForm } from "@/components/leagues/create-league-form";
import { FormSectionCard } from "@/components/ui/form-section-card";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function NewLeaguePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <section className="space-y-6">
      <PageHeader
        title="Nueva liga"
        description="Crea una nueva liga para gestionar equipos, jugadores y partidos."
        backHref="/dashboard/leagues"
        backLabel="← Volver a Ligas"
      />
      <FormSectionCard title="Datos de la liga">
        <CreateLeagueForm />
      </FormSectionCard>
    </section>
  );
}
