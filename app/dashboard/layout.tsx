import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { createClient } from "@/lib/supabase/server";
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
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, avatar_url, full_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("user_notifications")
      .select("id, user_id, league_id, type, title, message, link_url, read_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const userDisplayName = profileData?.display_name || profileData?.full_name || null;
  const userAvatarUrl = profileData?.avatar_url ?? null;
  const userLabel = user.email ?? "Usuario autenticado";
  const notifications = (notificationsData ?? []) as UserNotification[];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col md:flex-row">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardHeader
            userLabel={userLabel}
            displayName={userDisplayName}
            avatarUrl={userAvatarUrl}
            notifications={notifications}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
