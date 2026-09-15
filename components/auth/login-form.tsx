"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthMode = "login" | "register" | "forgot_password";

type LoginFormProps = {
  initialMode?: AuthMode;
};

function mapAuthError(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("invalid login credentials")) {
    return "Credenciales inválidas. Verifica tu correo y contraseña.";
  }

  if (normalizedMessage.includes("email not confirmed")) {
    return "Debes confirmar tu correo antes de iniciar sesión.";
  }

  if (normalizedMessage.includes("user already registered")) {
    return "Ese correo ya está registrado. Intenta iniciar sesión.";
  }

  if (normalizedMessage.includes("password")) {
    return "La contraseña debe cumplir con los requisitos mínimos de seguridad.";
  }

  return "No se pudo completar la operación. Inténtalo nuevamente.";
}

export function LoginForm({ initialMode = "login" }: LoginFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const isForgotPassword = mode === "forgot_password";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (isForgotPassword) {
      const redirectTo = `${window.location.origin}/update-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (resetError) {
        setError(mapAuthError(resetError.message));
        setIsLoading(false);
        return;
      }

      setSuccess(
        "Te hemos enviado un correo con instrucciones para restablecer tu contraseña. Revisa tu bandeja de entrada."
      );
      setIsLoading(false);
      return;
    }

    if (isLogin) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(mapAuthError(signInError.message));
        setIsLoading(false);
        return;
      }

      router.replace("/dashboard");
      router.refresh();
      return;
    }

    const emailRedirectTo = `${window.location.origin}/dashboard`;
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
      },
    });

    if (signUpError) {
      setError(mapAuthError(signUpError.message));
      setIsLoading(false);
      return;
    }

    if (data.session) {
      router.replace("/dashboard");
      router.refresh();
      return;
    }

    setSuccess(
      "Cuenta creada. Revisa tu correo para confirmar tu email antes de iniciar sesión."
    );
    setMode("login");
    setPassword("");
    setIsLoading(false);
  };

  const submitLabel = isForgotPassword
    ? "Enviar enlace de recuperación"
    : isLogin
    ? "Entrar al panel"
    : "Crear cuenta";

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {isForgotPassword ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-center">
          <p className="text-sm font-semibold text-emerald-900">
            Recuperación de contraseña
          </p>
          <p className="mt-0.5 text-xs text-emerald-700">
            Ingresa tu correo para recibir un enlace seguro de restablecimiento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setSuccess(null);
            }}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              isLogin
                ? "bg-white text-gray-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1"
                : "text-gray-600 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
              setSuccess(null);
            }}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              isRegister
                ? "bg-white text-gray-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1"
                : "text-gray-600 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1"
            }`}
          >
            Registrarme
          </button>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Correo electrónico
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          disabled={isLoading}
          placeholder="tu-correo@ejemplo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      {!isForgotPassword ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            {isLogin ? (
              <button
                type="button"
                onClick={() => {
                  setMode("forgot_password");
                  setError(null);
                  setSuccess(null);
                }}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded"
              >
                ¿Olvidaste tu contraseña?
              </button>
            ) : null}
          </div>
          <Input
            id="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            minLength={6}
            disabled={isLoading}
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
      ) : null}

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
        {isLoading ? "Procesando..." : submitLabel}
      </Button>

      {isForgotPassword ? (
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setSuccess(null);
            }}
            className="text-xs font-medium text-gray-600 hover:text-gray-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded px-2 py-1"
          >
            ← Volver a iniciar sesión
          </button>
        </div>
      ) : (
        <p className="text-xs leading-5 text-gray-500">
          {isLogin
            ? "Ingresa con tu cuenta para acceder al panel de control."
            : "Si tu proyecto requiere confirmación de email, recibirás un correo para activar tu cuenta."}
        </p>
      )}
    </form>
  );
}
