import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import { getContactMessageStatsAction } from "@/app/dashboard/contact-messages/actions";
import { ContactRetention } from "@/components/contact/contact-retention";

interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  league_name: string | null;
  phone: string | null;
  message: string;
  created_at: string;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value)
  );
}

export default async function ContactMessagesPage() {
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
          title="Mensajes de contacto"
          description="Bandeja de entrada del formulario público (solo super_admin)"
        />
        <Card>
          <CardHeader>
            <CardTitle>Acceso restringido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Solo los super administradores pueden ver los mensajes de contacto.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  // RLS: contact_messages no tiene políticas SELECT para authenticated (solo service_role);
  // por diseño, super_admin tampoco puede leerlas con el cliente autenticado.
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, league_name, phone, message, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const messages = (error ? [] : (data ?? [])) as ContactMessageRow[];
  const stats = await getContactMessageStatsAction();

  return (
    <section className="space-y-6">
      <PageHeader
        backHref="/dashboard"
        backLabel="Volver al panel"
        title="Mensajes de contacto"
        description="Bandeja de entrada del formulario público (solo super_admin)."
      />

      <ContactRetention stats={stats} />

      {error ? (
        <EmptyState
          title="No fue posible cargar los mensajes"
          description="La política RLS actual no permite lecturas autenticadas de contact_messages. Aplica la migración 20260917120000_admin_rpcs_super_admin.sql para habilitar la lectura para super_admin."
        />
      ) : messages.length === 0 ? (
        <EmptyState
          title="Sin mensajes"
          description="Aún no hay mensajes enviados desde el formulario de contacto público."
        />
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="block font-semibold text-gray-900">{m.name}</span>
                  <a
                    href={`mailto:${m.email}`}
                    className="block truncate text-xs text-emerald-700 hover:underline"
                  >
                    {m.email}
                  </a>
                  {m.phone ? <span className="block text-xs text-gray-500">{m.phone}</span> : null}
                </div>
                <span className="text-xs text-gray-400">{formatDateTime(m.created_at)}</span>
              </div>
              {m.league_name ? (
                <p className="mt-2 text-xs font-medium text-gray-600">
                  Liga de interés: {m.league_name}
                </p>
              ) : null}
              <p className="mt-2 whitespace-pre-line text-sm text-gray-700">{m.message}</p>
            </div>
          ))}
          {messages.length === 200 ? (
            <p className="text-xs text-gray-400">Mostrando los primeros 200 mensajes.</p>
          ) : null}
        </div>
      )}
    </section>
  );
}
