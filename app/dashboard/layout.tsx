import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardMobileNav } from "@/components/dashboard/mobile-nav";
import { createClient } from "@/lib/supabase/server";
import type { UserDashboardRole } from "@/components/dashboard/navigation-config";
import type { UserNotification } from "@/types/database";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("user_notifications")
      .select("id, user_id, league_id, type, title, message, link_url, read_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("league_members")
      .select("role")
      .eq("profile_id", user.id),
    supabase
      .from("team_members")
      .select("role")
      .eq("profile_id", user.id),
    supabase
      .from("matches")
      .select("id")
      .eq("referee_id", user.id)
      .limit(1),
  ]);

  let userRole: UserDashboardRole = "viewer";
  if (profileData?.global_role === "super_admin") {
    userRole = "super_admin";
  } else if (leagueMembers?.some((m) => m.role === "league_admin")) {
    userRole = "league_admin";
  } else if ((refereeMatches && refereeMatches.length > 0) || leagueMembers?.some((m) => m.role === "referee")) {
    userRole = "referee";
  } else if (teamMembers?.some((m) => m.role === "team_admin" || m.role === "coach")) {
    userRole = "team_staff";
  }

  const userDisplayName = profileData?.display_name || profileData?.full_name || null;
  const userAvatarUrl = profileData?.avatar_url ?? null;
  const userLabel = user.email ?? "Usuario autenticado";
  const notifications = (notificationsData ?? []) as UserNotification[];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col md:flex-row">
        <DashboardSidebar role={userRole} />
        <div className="flex flex-1 flex-col pb-20 md:pb-0">
          <DashboardHeader
            userLabel={userLabel}
            displayName={userDisplayName}
            avatarUrl={userAvatarUrl}
            notifications={notifications}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
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
