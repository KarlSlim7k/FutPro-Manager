import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/members/role-badge";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/database";

interface UsersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_ROLES: AppRole[] = [
  "super_admin",
  "league_admin",
  "team_admin",
  "coach",
  "referee",
  "viewer",
];

function getString(sp: Record<string, string | string[] | undefined>, key: string) {
  const v = sp[key];
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
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
          title="Usuarios"
          description="Directorio de usuarios registrados (solo super_admin)"
        />
        <Card>
          <CardHeader>
            <CardTitle>Acceso restringido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Solo los super administradores pueden ver el directorio de usuarios.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  const sp = await searchParams;

  // Filtros validados server-side (allowlist): valores inválidos se ignoran sin crash.
  const filterRole = VALID_ROLES.includes(getString(sp, "role") as AppRole)
    ? (getString(sp, "role") as AppRole)
    : undefined;
  const rawId = getString(sp, "id");
  const filterId = rawId && UUID_REGEX.test(rawId) ? rawId : undefined;
  const filterQuery = getString(sp, "q");

  let query = supabase
    .from("profiles")
    .select("id, full_name, display_name, avatar_url, phone, global_role, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (filterRole) query = query.eq("global_role", filterRole);
  if (filterId) query = query.eq("id", filterId);

  const { data: profilesData, error: profilesError } = await query;

  if (profilesError) {
    return (
      <section className="space-y-6">
        <PageHeader
          backHref="/dashboard"
          backLabel="Volver al panel"
          title="Usuarios"
          description="Directorio de usuarios registrados (solo super_admin)"
        />
        <EmptyState
          title="Error al cargar usuarios"
          description="No fue posible cargar el directorio de usuarios. Intenta nuevamente."
        />
      </section>
    );
  }

  // Búsqueda textual client-side (nombre para mostrar o teléfono). El email vive en
  // auth.users y no es legible con el cliente autenticado (sin service role por diseño).
  const q = filterQuery?.toLowerCase();
  const users = (profilesData ?? []).filter((p) => {
    if (!q) return true;
    const name = (p.full_name ?? p.display_name ?? "").toLowerCase();
    const phone = (p.phone ?? "").toLowerCase();
    return name.includes(q) || phone.includes(q);
  });

  const totalRoles = new Map<AppRole, number>();
  for (const p of profilesData ?? []) {
    totalRoles.set(p.global_role, (totalRoles.get(p.global_role) ?? 0) + 1);
  }

  const buildRoleHref = (role: AppRole) =>
    filterRole === role ? "/dashboard/users" : `/dashboard/users?role=${role}`;

  return (
    <section className="space-y-6">
      <PageHeader
        backHref="/dashboard"
        backLabel="Volver al panel"
        title="Usuarios"
        description="Directorio de usuarios registrados (solo super_admin)"
      />

      <div className="flex flex-wrap items-center gap-2">
        <a
          href="/dashboard/users"
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
            !filterRole
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
          }`}
        >
          Todos ({(profilesData ?? []).length})
        </a>
        {VALID_ROLES.map((role) =>
          totalRoles.get(role) ? (
            <a
              key={role}
              href={`/dashboard/users?role=${role}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                filterRole === role
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {role} ({totalRoles.get(role)})
            </a>
          ) : null
        )}
      </div>

      <p className="text-sm text-gray-500">
        Mostrando {users.length} de {(profilesData ?? []).length} usuario(s) registrados
        {(profilesData ?? []).length === 200 ? " (primeros 200)" : ""}.
      </p>

      {users.length === 0 ? (
        <EmptyState
          title="Sin usuarios"
          description="No hay usuarios que coincidan con los filtros seleccionados."
        />
      ) : (
        <>
          {/* Mobile Cards (< md) */}
          <div className="space-y-2.5 md:hidden">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs"
              >
                <Avatar src={u.avatar_url} alt={u.full_name ?? u.display_name ?? "Usuario"} fallback={u.full_name ?? u.display_name ?? undefined} size="md" />
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-gray-900">
                    {u.full_name ?? u.display_name ?? "Sin nombre"}
                  </span>
                  {u.phone ? <span className="block text-xs text-gray-500">{u.phone}</span> : null}
                  <span className="block text-[11px] text-gray-400">
                    Registrado: {new Date(u.created_at).toLocaleDateString("es-MX")}
                  </span>
                </div>
                <RoleBadge role={u.global_role} />
              </div>
            ))}
          </div>

          {/* Desktop Table (md+) */}
          <div className="hidden overflow-x-auto rounded-lg border border-gray-200 md:block">
            <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Rol global</th>
                  <th className="px-4 py-3">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={u.avatar_url} alt={u.full_name ?? u.display_name ?? "Usuario"} fallback={u.full_name ?? u.display_name ?? undefined} size="sm" />
                        <div>
                          <span className="block font-medium text-gray-900">
                            {u.full_name ?? u.display_name ?? "Sin nombre"}
                          </span>
                          <span className="block font-mono text-[11px] text-gray-400">{u.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{u.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.global_role} />
                    </td>
                    <td className="px-4 py-3">
                      {new Date(u.created_at).toLocaleDateString("es-MX")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
