import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { EntityImageUploadForm } from "@/components/media/entity-image-upload-form";
import { ProfileForm } from "@/components/profiles/profile-form";
import { updateUserAvatarAction, updateUserProfileDetailsAction } from "@/app/dashboard/profile/actions";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, Profile } from "@/types/database";

const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Administrador",
  league_admin: "Administrador de Liga",
  team_admin: "Administrador de Equipo",
  coach: "Cuerpo Técnico",
  referee: "Árbitro",
  viewer: "Espectador",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("id, full_name, display_name, avatar_url, phone, global_role, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as Profile | null;
  const userDisplayName = profile?.display_name || profile?.full_name || user.email?.split("@")[0] || "Usuario";
  const roleLabel = profile?.global_role ? ROLE_LABELS[profile.global_role] : "Usuario";

  function formatDate(value: string | undefined) {
    if (!value) return "No disponible";
    return new Intl.DateTimeFormat("es-MX", { dateStyle: "long" }).format(new Date(value));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi perfil"
        description="Gestiona tu avatar, información personal y datos de tu cuenta en la plataforma."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Tarjeta de Avatar y Resumen */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Foto de perfil</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4 text-center">
            <Avatar
              src={profile?.avatar_url}
              fallback={userDisplayName}
              size="xl"
              className="border-2 border-emerald-500 shadow-md"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{userDisplayName}</h3>
              <p className="text-xs text-gray-500">{user.email}</p>
              <span className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                {roleLabel}
              </span>
            </div>

            <div className="w-full border-t border-gray-100 pt-4 text-left">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Actualizar avatar
              </h4>
              <EntityImageUploadForm
                action={updateUserAvatarAction}
                buttonText="Subir avatar"
                helpText="JPG, PNG o WebP. Máx. 2 MB. Puedes recortar tu foto a proporción 1:1."
                aspectRatio="square"
                enableCrop={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tarjeta de Datos Personales y Cuenta */}
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información personal</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm
                initialDisplayName={profile?.display_name ?? null}
                initialFullName={profile?.full_name ?? null}
                initialPhone={profile?.phone ?? null}
                action={updateUserProfileDetailsAction}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalles de la cuenta</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-xs font-medium text-gray-500">Correo electrónico</dt>
                  <dd className="mt-1 font-medium text-gray-900">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Rol en el sistema</dt>
                  <dd className="mt-1 font-medium text-gray-900">{roleLabel}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Miembro desde</dt>
                  <dd className="mt-1 text-gray-700">{formatDate(profile?.created_at || user.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Identificador de cuenta</dt>
                  <dd className="mt-1 font-mono text-xs text-gray-500">{user.id}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
