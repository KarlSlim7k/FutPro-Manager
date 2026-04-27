"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthMode = "login" | "register";

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

export function LoginForm() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isLogin = mode === "login";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setSuccess(null);
    setIsLoading(true);

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

  const submitLabel = isLogin ? "Entrar al panel" : "Crear cuenta";

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
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
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
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
            !isLogin
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Registrarme
        </button>
      </div>

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

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-gray-700"
        >
          Contraseña
        </label>
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

      <p className="text-xs leading-5 text-gray-500">
        {isLogin
          ? "Ingresa con tu cuenta para acceder al panel de control."
          : "Si tu proyecto requiere confirmación de email, recibirás un correo para activar tu cuenta."}
      </p>
    </form>
  );
}
