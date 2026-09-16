import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import { getStorageOverviewAction } from "@/app/dashboard/storage/actions";
import { StorageObjectList } from "@/components/storage/storage-object-list";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// Nota: formatBytes vive duplicado (server para stats, client para la lista)
// porque las funciones no son serializables como props server -> client.

interface StoragePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function StorageAdminPage({ searchParams }: StoragePageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("global_role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.global_role !== "super_admin") {
    return (
      <section className="space-y-6">
        <PageHeader
          backHref="/dashboard"
          backLabel="Volver al panel"
          title="Almacenamiento"
          description="Gestión global de archivos (solo super_admin)"
        />
        <Card>
          <CardHeader>
            <CardTitle>Acceso restringido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Solo los super administradores pueden administrar el almacenamiento.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  const sp = await searchParams;
  const rawSearch = typeof sp.q === "string" ? sp.q.trim() : "";
  const overview = await getStorageOverviewAction(rawSearch || undefined);

  return (
    <section className="space-y-6">
      <PageHeader
        backHref="/dashboard"
        backLabel="Volver al panel"
        title="Almacenamiento"
        description="Gestión global de archivos por bucket (solo super_admin)."
      />

      {overview.error ? (
        <EmptyState
          title="No fue posible cargar el almacenamiento"
          description={`${overview.error}. Verifica que la migración 20260917140000 esté aplicada.`}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {overview.buckets.map((b) => (
              <div key={b.bucket_id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
                <span className="block font-mono text-xs text-gray-400">{b.bucket_id}</span>
                <span className="block text-2xl font-black text-gray-900">
                  {b.object_count.toLocaleString("es-MX")}
                </span>
                <span className="text-xs text-gray-500">objetos · {formatBytes(b.total_bytes)}</span>
              </div>
            ))}
            {overview.buckets.length === 0 ? (
              <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-4 sm:col-span-3 lg:col-span-4">
                <p className="text-sm text-gray-500">No hay buckets con objetos.</p>
              </div>
            ) : null}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Objetos del bucket league-media</CardTitle>
              <p className="mt-1 text-xs text-gray-500">
                El borrado es permanente y queda auditado como storage.object_deleted.
              </p>
            </CardHeader>
            <CardContent>
              <form method="get" className="mb-4 flex gap-2">
                <input
                  type="search"
                  name="q"
                  defaultValue={rawSearch}
                  placeholder="Buscar por ruta (ej. leagues/.../logo.png)"
                  className="w-full max-w-md rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Buscar
                </button>
              </form>
              {overview.objects.length === 0 ? (
                <EmptyState
                  title="Sin objetos"
                  description="No hay objetos que coincidan con la búsqueda."
                />
              ) : (
                <StorageObjectList objects={overview.objects} />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </section>
  );
}
