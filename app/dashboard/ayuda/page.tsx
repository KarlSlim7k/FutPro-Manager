import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { TutorialCard } from "@/components/help/TutorialCard";
import { TutorialFilters } from "@/components/help/TutorialFilters";
import { createClient } from "@/lib/supabase/server";
import { getTutorials } from "@/lib/tutorials/queries";
import { getGlobalVisibleRoles } from "@/lib/tutorials/roles";

interface AyudaPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AyudaPage({ searchParams }: AyudaPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Resolver roles efectivos permitidos para el usuario
  const userAllowedRoles = await getGlobalVisibleRoles(supabase, user.id);

  // Leer y normalizar searchParams
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const rol = typeof sp.rol === "string" ? sp.rol : undefined;
  const tag = typeof sp.tag === "string" ? sp.tag : undefined;

  // Consultar tutoriales accesibles con filtros
  const tutorials = await getTutorials({
    q,
    role: rol,
    tag,
    userAllowedRoles,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Soporte y Capacitación"
        title="Centro de Ayuda y Tutoriales"
        description="Guías paso a paso, flujos de trabajo y respuestas a preguntas frecuentes según tu rol en la plataforma."
      />

      {/* Barra de filtros contextuales por rol y etiquetas */}
      <TutorialFilters
        availableRoles={userAllowedRoles}
        currentRole={rol}
        currentTag={tag}
        currentQ={q}
      />

      {/* Grid de tutoriales o estado vacío */}
      {tutorials.length === 0 ? (
        <EmptyState
          title="No se encontraron tutoriales"
          description={
            q || rol || tag
              ? "No hay guías disponibles con los criterios de búsqueda actuales. Intenta cambiar o limpiar los filtros."
              : "No hay tutoriales disponibles para tu rol actualmente."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tutorials.map((tutorial) => (
            <TutorialCard key={tutorial.id} tutorial={tutorial} />
          ))}
        </div>
      )}
    </div>
  );
}
