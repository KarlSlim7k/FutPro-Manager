import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import { BroadcastForm } from "@/components/notifications/broadcast-form";

export default async function BroadcastPage() {
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
          title="Avisos globales"
          description="Broadcast de notificaciones (solo super_admin)"
        />
        <Card>
          <CardHeader>
            <CardTitle>Acceso restringido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Solo los super administradores pueden enviar avisos globales.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        backHref="/dashboard"
        backLabel="Volver al panel"
        title="Avisos globales"
        description="Broadcast de notificaciones in-app a todos los usuarios o por rol (solo super_admin)."
      />
      <BroadcastForm />
    </section>
  );
}
