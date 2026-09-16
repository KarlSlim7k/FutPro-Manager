import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { Eyebrow } from "@/components/ui/eyebrow";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const { mode } = await searchParams;
  const initialMode =
    mode === "register"
      ? "register"
      : mode === "forgot_password"
      ? "forgot_password"
      : "login";

  const getHeading = () => {
    if (initialMode === "register") return "Crear cuenta";
    if (initialMode === "forgot_password") return "Recuperar contraseña";
    return "Iniciar sesión";
  };

  const getSubheading = () => {
    if (initialMode === "register")
      return "Regístrate gratis para administrar tu liga desde el dashboard.";
    if (initialMode === "forgot_password")
      return "Recibe un enlace en tu correo para restablecer el acceso a tu cuenta.";
    return "Ingresa con tu cuenta para acceder al panel de control.";
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-2 lg:items-center">
        <section>
          <Eyebrow tone="inverse" className="text-sm tracking-[0.16em]">
            FutPro Manager
          </Eyebrow>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Panel SaaS para ligas amateur
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-gray-300 sm:text-base">
            Gestiona ligas, equipos, jugadores y partidos desde un solo lugar,
            con una base pensada para crecer contigo.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-emerald-300 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            >
              Volver al inicio
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white p-6 text-gray-900 shadow-2xl shadow-black/20 sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">{getHeading()}</h2>
            <p className="mt-2 text-sm text-gray-600">{getSubheading()}</p>
          </div>
          <LoginForm initialMode={initialMode} />
        </section>
      </div>
      <div className="mx-auto mt-10 flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-400">
        <Link href="/" className="transition hover:text-emerald-200 hover:underline">
          Inicio
        </Link>
        <Link href="/explorar" className="transition hover:text-emerald-200 hover:underline">
          Explorar ligas
        </Link>
        <Link href="/contacto" className="transition hover:text-emerald-200 hover:underline">
          Contacto
        </Link>
        <Link href="/privacidad" className="transition hover:text-emerald-200 hover:underline">
          Aviso de privacidad
        </Link>
        <Link href="/terminos" className="transition hover:text-emerald-200 hover:underline">
          Términos y condiciones
        </Link>
      </div>
    </main>
  );
}
