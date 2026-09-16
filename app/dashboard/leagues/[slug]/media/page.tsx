import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiImageUploadForm } from "@/components/media/multi-image-upload-form";
import { MediaGalleryGrid } from "@/components/media/media-gallery-grid";
import { MediaCleanupForm } from "@/components/media/media-cleanup-form";
import {
  uploadBatchLeagueMediaAction,
} from "@/app/dashboard/leagues/[slug]/media/actions";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";
import { createClient } from "@/lib/supabase/server";
import type { MediaUpload } from "@/types/database";

interface LeagueMediaPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LeagueMediaPage({ params }: LeagueMediaPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: league } = await supabase
    .from("leagues")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!league) {
    notFound();
  }

  const permissions = await getLeaguePermissions({
    supabase,
    userId: user.id,
    leagueId: league.id,
  });

  const { data: uploadsData } = await supabase
    .from("media_uploads")
    .select("id, league_id, uploaded_by, bucket, path, entity_type, entity_id, mime_type, size_bytes, created_at, updated_at")
    .eq("league_id", league.id)
    .order("created_at", { ascending: false });

  const uploads = (uploadsData ?? []) as MediaUpload[];

  const boundBatchAction = uploadBatchLeagueMediaAction.bind(null, league.slug);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Multimedia - ${league.name}`}
        description="Galería de recursos gráficos, carga masiva de imágenes y mantenimiento de archivos de la liga."
        backHref={`/dashboard/leagues/${league.slug}`}
        backLabel="Volver al detalle de la liga"
      />

      {/* Subida masiva de imágenes */}
      {permissions.canManageLeague ? (
        <Card>
          <CardHeader>
            <CardTitle>Carga masiva de imágenes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-xs text-gray-500">
              Sube múltiples fotografías, imágenes de jornadas o material promocional para el catálogo de la liga.
            </p>
            <MultiImageUploadForm
              action={boundBatchAction}
              buttonText="Subir lote de imágenes"
              helpText="Formatos JPG, PNG o WebP. Máximo 4 MB por archivo. Puedes seleccionar varios archivos simultáneamente."
            />
          </CardContent>
        </Card>
      ) : null}

      {/* Catálogo y Galería */}
      <Card>
        <CardHeader>
          <CardTitle>Galería de archivos ({uploads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <MediaGalleryGrid
            leagueSlug={league.slug}
            uploads={uploads}
            canManage={permissions.canManageLeague}
          />
        </CardContent>
      </Card>

      {/* Herramienta de Limpieza de Archivos Huérfanos */}
      {permissions.canManageLeague ? (
        <Card className="border-amber-200 bg-amber-50/20">
          <CardHeader>
            <CardTitle className="text-amber-900">Mantenimiento de archivos huérfanos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-gray-600">
              Analiza los archivos subidos con más de 24 horas que ya no están asociados a ningún logo activo ni foto de jugador, eliminándolos de Storage para liberar espacio.
            </p>
            <MediaCleanupForm leagueSlug={league.slug} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
