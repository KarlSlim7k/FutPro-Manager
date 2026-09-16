"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eyebrow } from "@/components/ui/eyebrow";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initRecovery() {
      // Si llega un code de intercambio PKCE en la query string
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        if (code) {
          try {
            await supabase.auth.exchangeCodeForSession(code);
          } catch {
            // Continuar verificación con getUser
          }
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (isMounted) {
        setHasValidSession(!!user);
        setIsVerifyingSession(false);
      }
    }

    initRecovery();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: unknown) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        if (isMounted) {
          setHasValidSession(true);
          setIsVerifyingSession(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden. Verifica que sean iguales.");
      return;
    }

    setIsLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message || "No se pudo actualizar la contraseña. Inténtalo de nuevo.");
      setIsLoading(false);
      return;
    }

    setSuccess("Tu contraseña ha sido actualizada con éxito. Redirigiendo al panel...");
    setIsLoading(false);

    setTimeout(() => {
      router.replace("/dashboard");
      router.refresh();
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col justify-center">
        <div className="mb-6 text-center">
          <Eyebrow tone="inverse" className="text-sm tracking-[0.16em]">
            FutPro Manager
          </Eyebrow>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Nueva contraseña
          </h1>
          <p className="mt-1 text-sm text-gray-300">
            Ingresa y confirma tu nueva contraseña para acceder a tu cuenta.
          </p>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white p-6 text-gray-900 shadow-2xl shadow-black/20 sm:p-8">
          {isVerifyingSession ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
              <p className="text-sm font-medium text-gray-700">Verificando enlace de recuperación...</p>
            </div>
          ) : !hasValidSession ? (
            <div className="space-y-4 py-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Enlace no válido o expirado</h2>
              <p className="text-sm text-gray-600">
                El enlace de recuperación ha caducado o no se detectó una sesión válida. Solicita uno nuevo para continuar.
              </p>
              <div className="pt-2">
                <Link
                  href="/login?mode=forgot_password"
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                >
                  Solicitar nuevo enlace
                </Link>
              </div>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="text-xs font-medium text-gray-600 hover:text-gray-900 hover:underline"
                >
                  <span className="inline-flex items-center gap-1.5"><ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Volver a inicio de sesión</span>
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="new-password"
                  className="text-sm font-medium text-gray-700"
                >
                  Nueva contraseña
                </label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  disabled={isLoading}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium text-gray-700"
                >
                  Confirmar contraseña
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  disabled={isLoading}
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {error ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              {success ? (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  {success}
                </p>
              ) : null}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Actualizando..." : "Guardar nueva contraseña"}
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs font-medium text-gray-600 hover:text-gray-900 hover:underline"
                >
                  <span className="inline-flex items-center gap-1.5"><ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Volver a inicio de sesión</span>
                </Link>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
