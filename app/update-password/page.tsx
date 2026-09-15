"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
                ← Volver a inicio de sesión
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
