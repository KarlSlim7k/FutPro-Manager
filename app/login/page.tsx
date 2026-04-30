import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { Eyebrow } from "@/components/ui/eyebrow";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

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
              className="inline-flex items-center rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-emerald-300 hover:text-emerald-200"
            >
              Volver al inicio
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white p-6 text-gray-900 shadow-2xl shadow-black/20 sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Acceso al sistema</h2>
            <p className="mt-2 text-sm text-gray-600">
              Inicia sesión o crea tu cuenta para entrar al dashboard.
            </p>
          </div>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
