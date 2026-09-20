import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Avatar } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/members/role-badge";
import { createClient } from "@/lib/supabase/server";
import { listUsersViaRpcAction } from "@/app/dashboard/users/actions";
import { UserRoleControls, UserSuspensionControls } from "@/components/users/user-admin-controls";
import type { AppRole } from "@/types/database";

interface UsersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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
  const filterQuery = getString(sp, "q");
  const page = Math.max(0, Number(getString(sp, "page") ?? "0") || 0);
  const PAGE_SIZE = 200;

  // RPC admin_list_users (migracion 20260917120000): incluye email, ultimo login y
  // membresias; busca tambien por email en auth.users. Si la migracion no se ha
  // aplicado aun, cae al query directo por profiles (sin email).
  const rpcResult = await listUsersViaRpcAction({
    role: filterRole,
    search: filterQuery,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  type UserRow = {
    id: string;
    email: string | null;
    full_name: string | null;
    display_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    global_role: AppRole;
    is_suspended: boolean;
    created_at: string;
    last_sign_in_at: string | null;
    league_memberships: number;
  };

  let users: UserRow[] = [];
  let totalShown = 0;
  let usingFallback = false;

  if (!rpcResult.error) {
    users = rpcResult.users.map((u) => ({ ...u, is_suspended: u.is_suspended ?? false }));
    totalShown = users.length;
  } else {
    usingFallback = true;
    let query = supabase
      .from("profiles")
      .select("id, full_name, display_name, avatar_url, phone, global_role, created_at")
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);
    if (filterRole) query = query.eq("global_role", filterRole);
    const { data } = await query;
    const rows = data ?? [];
    const q = filterQuery?.toLowerCase();
    users = rows
      .filter((p) => {
        if (!q) return true;
        const name = (p.full_name ?? p.display_name ?? "").toLowerCase();
        const phone = (p.phone ?? "").toLowerCase();
        return name.includes(q) || phone.includes(q);
      })
      .map((p) => ({
        id: p.id,
        email: null,
        full_name: p.full_name,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        phone: p.phone,
        global_role: p.global_role,
        is_suspended: false,
        created_at: p.created_at,
        last_sign_in_at: null,
        league_memberships: 0,
      }));
    totalShown = users.length;
  }

  // Conteos por rol: con RPC usamos una segunda llamada ligera; con fallback, perfiles visibles.
  const countsByRole = new Map<AppRole, number>();
  if (!usingFallback) {
    for (const role of VALID_ROLES) {
      const { users: roleUsers } = await listUsersViaRpcAction({ role, limit: 500 });
      countsByRole.set(role, roleUsers.length);
    }
  } else {
    const { data: allProfiles } = await supabase
      .from("profiles")
      .select("global_role")
      .limit(1000);
    for (const p of allProfiles ?? []) {
      countsByRole.set(p.global_role, (countsByRole.get(p.global_role) ?? 0) + 1);
    }
  }

  const buildRoleHref = (role: AppRole) =>
    filterRole === role ? "/dashboard/users" : `/dashboard/users?role=${role}`;

  function formatDateTime(value: string | null) {
    if (!value) return null;
    return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(value));
  }

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
          Todos
        </a>
        {VALID_ROLES.map((role) =>
          (countsByRole.get(role) ?? 0) > 0 ? (
            <a
              key={role}
              href={`/dashboard/users?role=${role}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                filterRole === role
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {role} ({countsByRole.get(role)})
            </a>
          ) : null
        )}
      </div>

      <p className="text-sm text-gray-500">
        Mostrando {users.length} usuario(s)
        {filterQuery ? ` que coinciden con "${filterQuery}"` : ""}
        {users.length === PAGE_SIZE ? " (primeros 200; usa filtros para acotar)" : ""}.
        {usingFallback
          ? " Modo reducido: aplica la migración 20260917120000 para ver email, último acceso y membresías."
          : ""}
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
                <Avatar
                  src={u.avatar_url}
                  alt={u.full_name ?? u.display_name ?? "Usuario"}
                  fallback={u.full_name ?? u.display_name ?? undefined}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-gray-900">
                    {u.full_name ?? u.display_name ?? "Sin nombre"}
                  </span>
                  {u.email ? (
                    <a
                      href={`mailto:${u.email}`}
                      className="block truncate text-xs text-emerald-700 hover:underline"
                    >
                      {u.email}
                    </a>
                  ) : null}
                  <span className="block text-[11px] text-gray-400">
                    Registro: {formatDateTime(u.created_at)}
                    {u.last_sign_in_at
                      ? ` · Último acceso: ${formatDateTime(u.last_sign_in_at)}`
                      : ""}
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
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rol global</th>
                  <th className="px-4 py-3">Ligas</th>
                  <th className="px-4 py-3">Registro</th>
                  <th className="px-4 py-3">Último acceso</th>
                  <th className="px-4 py-3">Administración</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={u.avatar_url}
                          alt={u.full_name ?? u.display_name ?? "Usuario"}
                          fallback={u.full_name ?? u.display_name ?? undefined}
                          size="sm"
                        />
                        <div>
                          <span className="block font-medium text-gray-900">
                            {u.full_name ?? u.display_name ?? "Sin nombre"}
                          </span>
                          {u.phone ? (
                            <span className="block text-[11px] text-gray-500">{u.phone}</span>
                          ) : null}
                          <span className="block font-mono text-[10px] text-gray-400">{u.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.email ? (
                        <a
                          href={`mailto:${u.email}`}
                          className="text-emerald-700 hover:underline"
                        >
                          {u.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.global_role} />
                      {u.is_suspended ? (
                        <span className="mt-1 block text-[10px] font-semibold text-red-600">SUSPENDIDO</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{u.league_memberships}</td>
                    <td className="px-4 py-3">{formatDateTime(u.created_at)}</td>
                    <td className="px-4 py-3">{formatDateTime(u.last_sign_in_at) ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        <UserRoleControls
                          targetUserId={u.id}
                          currentRole={u.global_role}
                          isSelf={u.id === user.id}
                        />
                        {!usingFallback ? (
                          <UserSuspensionControls targetUserId={u.id} isSuspended={u.is_suspended} />
                        ) : null}
                      </div>
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
