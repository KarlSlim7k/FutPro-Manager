import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { CsvUploader } from "@/components/csv/csv-uploader";
import { createClient } from "@/lib/supabase/server";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";
import { importPlayersCsvAction } from "./actions";

interface ImportPlayersPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ seasonId?: string }>;
}

const PLAYER_CSV_TEMPLATE = `nombre,apellidos,equipo,dorsal,posicion,pie_dominante,nacimiento
Carlos,Mendoza,Deportivo Perote,10,Delantero,Derecho,1995-04-12
Luis Fernando,Gómez,Real Azteca,1,Portero,Izquierdo,1998-11-23
Roberto,Hernández,Deportivo Perote,4,Defensa,Derecho,2001-07-08
Miguel Ángel,Reyes,Real Azteca,8,Mediocampista,Ambidiestro,1999-02-15`;

export default async function ImportPlayersPage({ params, searchParams }: ImportPlayersPageProps) {
  const { slug } = await params;
  const { seasonId } = await searchParams;
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

  if (!permissions.canManagePlayers && !permissions.canManageLeague) {
    redirect(`/dashboard/leagues/${slug}/players`);
  }

  // Fetch active seasons for optional assignment
  const { data: seasons } = await supabase
    .from("seasons")
    .select("id, name, status")
    .eq("league_id", league.id)
    .order("created_at", { ascending: false });

  const handleImport = async (content: string) => {
    "use server";
    return importPlayersCsvAction(slug, content, seasonId);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Importar Jugadores por CSV"
        description={`Carga masiva de futbolistas y asignación a plantillas para ${league.name}.`}
        action={
          <Link
            href={`/dashboard/leagues/${slug}/players`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Jugadores
          </Link>
        }
      />

      {seasons && seasons.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Vincular automáticamente a una temporada (opcional):
          </label>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/dashboard/leagues/${slug}/players/import`}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                !seasonId
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              Solo registrar en catálogo
            </Link>
            {seasons.map((s) => (
              <Link
                key={s.id}
                href={`/dashboard/leagues/${slug}/players/import?seasonId=${s.id}`}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  seasonId === s.id
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                Inscribir en {s.name} ({s.status})
              </Link>
            ))}
          </div>
          {seasonId && (
            <p className="mt-2 text-xs text-emerald-400">
              ✓ Si el archivo incluye la columna de equipo, los jugadores se inscribirán automáticamente a su club en esta temporada.
            </p>
          )}
        </div>
      )}

      <CsvUploader
        title="Archivo de Jugadores"
        description="Sube un archivo delimitado por comas con las columnas: nombre, apellidos, equipo (opcional), dorsal (opcional), posicion (opcional), pie_dominante (opcional), nacimiento (opcional)."
        templateFileName={`plantilla-jugadores-${slug}.csv`}
        templateCsvContent={PLAYER_CSV_TEMPLATE}
        onImport={handleImport}
      />
    </div>
  );
}
