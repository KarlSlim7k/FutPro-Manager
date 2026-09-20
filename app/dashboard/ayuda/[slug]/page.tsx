import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Clock, ExternalLink, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { TutorialStepView } from "@/components/help/TutorialStepView";
import { TutorialFaq } from "@/components/help/TutorialFaq";
import { createClient } from "@/lib/supabase/server";
import { getTutorialBySlug } from "@/lib/tutorials/queries";
import { APP_ROLE_LABELS, getGlobalVisibleRoles } from "@/lib/tutorials/roles";

interface TutorialDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TutorialDetailPage({ params }: TutorialDetailPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { slug } = await params;

  // Resolver roles permitidos fail-closed
  const userAllowedRoles = await getGlobalVisibleRoles(supabase, user.id);

  // Obtener tutorial con sus pasos asegurando autorización
  const tutorial = await getTutorialBySlug(slug, userAllowedRoles);

  // Si no existe, no está publicado o el usuario no tiene permisos → 404 fail-closed
  if (!tutorial) {
    notFound();
  }

  const isDirectRoute = tutorial.related_route && !tutorial.related_route.includes("[");

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Encabezado con navegación de regreso */}
      <PageHeader
        backHref="/dashboard/ayuda"
        backLabel="Volver a Tutoriales"
        eyebrow="Guía de Procedimiento"
        title={tutorial.title}
        description={tutorial.summary}
        action={
          isDirectRoute && tutorial.related_route ? (
            <Link
              href={tutorial.related_route}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span>Ir al flujo</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : undefined
        }
      />

      {/* Metadata resumen: Roles, Tags, Tiempo estimado y Ruta asociada */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 text-xs text-gray-600 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-gray-700">Roles objetivo:</span>
          {tutorial.target_roles.map((role) => (
            <StatusBadge
              key={role}
              variant={role === "viewer" ? "neutral" : "info"}
              className="py-0.5 px-2 text-[11px]"
            >
              {APP_ROLE_LABELS[role] ?? role}
            </StatusBadge>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
            <span>{tutorial.estimated_minutes} min lectura aprox.</span>
          </div>

          {tutorial.tags.length > 0 && (
            <div className="flex items-center gap-1">
              {tutorial.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-gray-100 px-2 py-0.5 font-medium text-gray-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {tutorial.related_route && (
          <div className="w-full border-t border-gray-100 pt-2 text-gray-500 flex items-center gap-1.5">
            <ExternalLink className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
            <span>Ruta del sistema:</span>
            <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] text-gray-800">
              {tutorial.related_route}
            </code>
          </div>
        )}
      </div>

      {/* Lista ordenada de pasos */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-gray-900">
          Pasos a seguir ({tutorial.steps.length})
        </h2>

        {tutorial.steps.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
            Esta guía no tiene pasos registrados por el momento.
          </div>
        ) : (
          <div className="space-y-5">
            {tutorial.steps.map((step) => (
              <TutorialStepView
                key={step.id}
                step={step}
                tutorialTitle={tutorial.title}
              />
            ))}
          </div>
        )}
      </section>

      {/* Preguntas frecuentes vinculadas */}
      {tutorial.faq && tutorial.faq.length > 0 && (
        <section className="pt-2">
          <TutorialFaq faq={tutorial.faq} />
        </section>
      )}
    </div>
  );
}
