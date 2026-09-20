import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { CsvUploader } from "@/components/csv/csv-uploader";
import { createClient } from "@/lib/supabase/server";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";
import { importTeamsCsvAction } from "./actions";

interface ImportTeamsPageProps {
  params: Promise<{ slug: string }>;
}

const TEAM_CSV_TEMPLATE = `nombre,fundacion,color_primario,color_secundario,estado
Deportivo Perote,1998,#FF0000,#FFFFFF,active
Real Azteca F.C.,2012,#00FF00,#000000,active
Atlético San José,2005,#0000FF,#FFFF00,active`;

export default async function ImportTeamsPage({ params }: ImportTeamsPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: league, error } = await supabase
    .from("leagues")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !league) {
    notFound();
  }

  const permissions = await getLeaguePermissions({
    supabase,
    userId: user.id,
    leagueId: league.id,
  });

  if (!permissions.canManageLeague) {
    redirect(`/dashboard/leagues/${slug}/teams`);
  }

  const handleImport = async (content: string) => {
    "use server";
    return importTeamsCsvAction(slug, content);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Importar Equipos por CSV"
        description={`Carga masiva de clubes y equipos para ${league.name}.`}
        action={
          <Link
            href={`/dashboard/leagues/${slug}/teams`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Equipos
          </Link>
        }
      />

      <CsvUploader
        title="Archivo de Equipos"
        description="Sube un archivo delimitado por comas con las columnas: nombre, fundacion, color_primario, color_secundario, estado."
        templateFileName={`plantilla-equipos-${slug}.csv`}
        templateCsvContent={TEAM_CSV_TEMPLATE}
        onImport={handleImport}
      />
    </div>
  );
}
