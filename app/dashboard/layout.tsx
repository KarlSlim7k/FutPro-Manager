import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardMobileNav } from "@/components/dashboard/mobile-nav";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVerifiedUser } from "@/lib/logto/get-verified-user";
import type { UserDashboardRole } from "@/components/dashboard/navigation-config";
import type { UserNotification } from "@/types/database";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const identity = await getVerifiedUser();

  if (identity.source === "anonymous") {
    redirect("/login");
  }

  if (identity.source === "logto" && !identity.profileId) {
    // Auto-provisión inline (respaldo si el webhook aún no creó el profile):
    // evita el loop /dashboard <-> /login para usuarios Google/SMS nuevos.
    try {
      const admin = createAdminClient();
      const { data: created } = await admin
        .from("profiles")
        .insert({
          logto_sub: identity.logtoSub,
          email: identity.email,
          global_role: "viewer",
        })
        .select("id")
        .single();
      if (created?.id) {
        identity.profileId = created.id;
      }
    } catch {
      // Si el insert falla (ej. duplicado por carrera con webhook), re-leer.
      try {
        const admin = createAdminClient();
        const { data: retry } = await admin
          .from("profiles")
          .select("id")
          .eq("logto_sub", identity.logtoSub)
          .maybeSingle();
        if (retry?.id) {
          identity.profileId = retry.id;
        }
      } catch {
        // cae al redirect de abajo
      }
    }
  }

  if (identity.source === "logto" && !identity.profileId) {
    // Sesión Logto válida pero sin profile (webhook + insert fallaron).
    redirect("/login");
  }

  const profileId =
    identity.source === "supabase" ? identity.profileId : identity.profileId!;
  const userEmail = identity.email;

  // Usuarios Supabase: cliente anon (RLS). Usuarios Logto: admin (bypass RLS
  // con checks manuales por profileId, hasta migrar RLS en Fase 2 completa).
  const supabase =
    identity.source === "supabase" ? await createClient() : createAdminClient();

  const [
    { data: profileData },
    { data: notificationsData },
    { data: leagueMembers },
    { data: teamMembers },
    { data: refereeMatches },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("global_role, display_name, avatar_url, full_name")
      .eq("id", profileId)
      .maybeSingle(),
    supabase
      .from("user_notifications")
      .select("id, user_id, league_id, type, title, message, link_url, read_at, created_at")
      .eq("user_id", profileId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("league_members")
      .select("role")
      .eq("profile_id", profileId),
    supabase
      .from("team_members")
      .select("role")
      .eq("profile_id", profileId),
    supabase
      .from("matches")
      .select("id")
      .eq("referee_id", profileId)
      .limit(1),
  ]);

  // Si el usuario se registró con email/password y tiene role_preference pero su perfil quedó en viewer:
  if (profileData?.global_role === "viewer" && identity.source === "supabase") {
    try {
      const userRes = await supabase.auth.getUser();
      const metaRole = userRes.data.user?.user_metadata?.role_preference;
      if (metaRole && ["league_admin", "team_admin", "referee"].includes(metaRole)) {
        const admin = createAdminClient();
        await admin.from("profiles").update({ global_role: metaRole }).eq("id", profileId);
        profileData.global_role = metaRole;
      }
    } catch {}
  }

  let userRole: UserDashboardRole = "viewer";
  if (profileData?.global_role === "super_admin") {
    userRole = "super_admin";
  } else if (profileData?.global_role === "league_admin" || leagueMembers?.some((m) => m.role === "league_admin")) {
    userRole = "league_admin";
  } else if ((refereeMatches && refereeMatches.length > 0) || profileData?.global_role === "referee" || leagueMembers?.some((m) => m.role === "referee")) {
    userRole = "referee";
  } else if (profileData?.global_role === "team_admin" || teamMembers?.some((m) => m.role === "team_admin" || m.role === "coach")) {
    userRole = "team_staff";
  }

  const userDisplayName = profileData?.display_name || profileData?.full_name || null;
  const userAvatarUrl = profileData?.avatar_url ?? null;
  const userLabel = userEmail ?? "Usuario autenticado";
  const notifications = (notificationsData ?? []) as UserNotification[];

  return (
    <div className="min-h-screen w-full bg-gray-100 text-gray-900">
      <div className="flex min-h-screen w-full flex-col md:flex-row">
        <DashboardSidebar role={userRole} />
        <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
          <DashboardHeader
            userLabel={userLabel}
            displayName={userDisplayName}
            avatarUrl={userAvatarUrl}
            notifications={notifications}
          />
          <main className="w-full flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
        <DashboardMobileNav
          role={userRole}
          userLabel={userLabel}
          displayName={userDisplayName}
          avatarUrl={userAvatarUrl}
        />
      </div>
    </div>
  );
}
