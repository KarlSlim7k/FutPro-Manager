"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
  UserPlus,
  Users,
  Activity,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogtoSignInButton } from "./logto-buttons";
import {
  calculatePasswordStrength,
  mapAuthError,
  validateRegistrationInput,
} from "@/lib/auth/auth-utils";

export type AuthMode = "login" | "register" | "forgot_password";

type RoleOption = {
  id: "league_admin" | "team_admin" | "referee" | "viewer";
  label: string;
  badge: string;
  icon: typeof Trophy;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: "league_admin",
    label: "Organizador",
    badge: "Administro torneos",
    icon: Trophy,
  },
  {
    id: "team_admin",
    label: "Entrenador / Club",
    badge: "Dirijo un equipo",
    icon: Users,
  },
  {
    id: "referee",
    label: "Árbitro / Oficial",
    badge: "Cédula en cancha",
    icon: Activity,
  },
  {
    id: "viewer",
    label: "Jugador / Fan",
    badge: "Seguimiento y stats",
    icon: User,
  },
];

type LoginFormProps = {
  initialMode?: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
  suspendedNotice?: boolean;
};

export function LoginForm({ initialMode = "login", onModeChange, suspendedNotice }: LoginFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleOption["id"]>("league_admin");
  const [error, setError] = useState<string | null>(
    suspendedNotice ? "Tu cuenta ha sido suspendida. Contacta al administrador de la plataforma." : null
  );
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const isForgotPassword = mode === "forgot_password";

  const passwordStrength = useMemo(
    () => calculatePasswordStrength(password),
    [password]
  );

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  function switchMode(next: AuthMode) {
    setMode(next);
    setError(null);
    setSuccess(null);
    if (onModeChange) {
      onModeChange(next);
    }
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("mode", next === "login" ? "login" : next);
      window.history.replaceState(null, "", url.toString());
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    if (isForgotPassword) {
      if (!email || !email.includes("@")) {
        setError("Por favor ingresa un correo electrónico válido.");
        return;
      }

      setIsLoading(true);
      const redirectTo = `${window.location.origin}/update-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (resetError) {
        const msg = resetError.message?.toLowerCase() || "";
        if (msg.includes("rate limit") || msg.includes("too many requests")) {
          setError("Demasiados intentos. Por favor espera unos minutos antes de volver a intentar.");
          setIsLoading(false);
          return;
        }
        // Defensa contra enumeración: no revelar si el email no existe
      }

      setSuccess(
        "Si la dirección de correo está registrada, te hemos enviado un enlace seguro para restablecer tu contraseña. Revisa tu bandeja de entrada o spam."
      );
      setIsLoading(false);
      return;
    }

    if (isLogin) {
      if (!email || !password) {
        setError("Por favor completa tu correo y contraseña.");
        return;
      }

      setIsLoading(true);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(mapAuthError(signInError.message));
        setIsLoading(false);
        return;
      }

      // Verificacion de suspension: si la cuenta fue suspendida por un super_admin,
      // se cierra la sesion recien iniciada con un mensaje claro.
      const { data: suspendedProfile } = await supabase
        .from("profiles")
        .select("is_suspended")
        .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "")
        .maybeSingle();
      if (suspendedProfile?.is_suspended) {
        await supabase.auth.signOut();
        setError("Tu cuenta ha sido suspendida. Contacta al administrador de la plataforma.");
        setIsLoading(false);
        return;
      }

      router.replace("/dashboard");
      router.refresh();
      return;
    }

    if (isRegister) {
      const validation = validateRegistrationInput({
        fullName,
        email,
        password,
        confirmPassword,
        acceptedTerms,
      });

      if (!validation.valid) {
        setError(validation.error ?? "Verifica los datos ingresados.");
        return;
      }

      setIsLoading(true);
      const emailRedirectTo = `${window.location.origin}/dashboard`;
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
          data: {
            full_name: fullName.trim(),
            display_name: fullName.trim(),
            role_preference: selectedRole,
          },
        },
      });

      if (signUpError) {
        const msg = signUpError.message?.toLowerCase() || "";
        if (msg.includes("user already registered") || msg.includes("already registered")) {
          setSuccess(
            "Si la dirección de correo es nueva, te enviamos un enlace de activación (revisa también tu carpeta de spam). Si ya tenías una cuenta, puedes iniciar sesión o recuperar tu contraseña."
          );
          switchMode("login");
          setPassword("");
          setConfirmPassword("");
          setIsLoading(false);
          return;
        }
        setError(mapAuthError(signUpError.message));
        setIsLoading(false);
        return;
      }

      if (data.session) {
        if (data.user) {
          try {
            await supabase
              .from("profiles")
              .update({ global_role: selectedRole })
              .eq("id", data.user.id);
          } catch {}
        }
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      setSuccess(
        "¡Cuenta creada exitosamente! Te enviamos un correo con un enlace de activación (revisa también tu carpeta de spam). Confírmalo para comenzar a gestionar tu liga."
      );
      switchMode("login");
      setPassword("");
      setConfirmPassword("");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header del formulario sincronizado */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          {isRegister ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Registro gratuito
            </span>
          ) : isForgotPassword ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              <KeyRound className="h-3.5 w-3.5 text-amber-600" /> Seguridad
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              <LogIn className="h-3.5 w-3.5 text-emerald-600" /> Acceso seguro
            </span>
          )}
        </div>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {isForgotPassword
            ? "Recuperar contraseña"
            : isRegister
            ? "Crea tu cuenta gratis"
            : "Iniciar sesión"}
        </h2>
        <p className="mt-1.5 text-sm text-gray-600">
          {isForgotPassword
            ? "Recibe un enlace en tu correo para restablecer tu acceso sin complicaciones."
            : isRegister
            ? "Digitaliza tu torneo, administra equipos, cédulas y estadísticas desde hoy."
            : "Ingresa tus credenciales para acceder al panel de administración de tu liga."}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {/* Selector de modo Login / Registro */}
        {!isForgotPassword && (
          <div className="relative grid grid-cols-2 rounded-xl bg-gray-100/90 p-1.5 shadow-inner">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`relative flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 touch-manipulation ${
                isLogin
                  ? "bg-white text-gray-900 shadow-sm shadow-black/5 ring-1 ring-black/5"
                  : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              <LogIn className={`h-4 w-4 ${isLogin ? "text-emerald-600" : "text-gray-400"}`} />
              Iniciar sesión
            </button>

            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`relative flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 touch-manipulation ${
                isRegister
                  ? "bg-white text-gray-900 shadow-sm shadow-black/5 ring-1 ring-black/5"
                  : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              <UserPlus className={`h-4 w-4 ${isRegister ? "text-emerald-600" : "text-gray-400"}`} />
              Registrarme
            </button>
          </div>
        )}

        {/* Notificación informativa en Forgot Password */}
        {isForgotPassword && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-emerald-900">
            <KeyRound className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-semibold text-emerald-950">Restablecimiento de contraseña</p>
              <p className="mt-0.5 text-emerald-800">
                Escribe la dirección de correo con la que te registraste. Te enviaremos un enlace con vigencia de 1 hora.
              </p>
            </div>
          </div>
        )}

        {/* Campos exclusivos de Registro */}
        {isRegister && (
          <div className="space-y-4 animate-enter-fade-up">
            {/* Nombre completo */}
            <div className="space-y-1.5">
              <label htmlFor="full-name" className="text-xs font-semibold text-gray-700">
                Nombre completo
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="full-name"
                  type="text"
                  autoComplete="name"
                  required
                  disabled={isLoading}
                  placeholder="Ej. Roberto Carlos Morales"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Selector de rol / objetivo en la plataforma */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">
                ¿Cuál es tu rol principal en el torneo?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROLE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedRole === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedRole(opt.id)}
                      className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all duration-150 touch-manipulation ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-600"
                          : "border-gray-200 bg-gray-50/60 hover:bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon className={`h-4 w-4 ${isSelected ? "text-emerald-700" : "text-gray-500"}`} />
                        <span className={`text-xs font-semibold ${isSelected ? "text-emerald-950" : "text-gray-800"}`}>
                          {opt.label}
                        </span>
                      </div>
                      <span className={`text-[11px] mt-0.5 line-clamp-1 ${isSelected ? "text-emerald-700 font-medium" : "text-gray-500"}`}>
                        {opt.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Registro rápido con Google respetando el rol seleccionado */}
            <div className="pt-2">
              <LogtoSignInButton
                rolePreference={selectedRole}
                label={`Registrarse con Google como ${
                  ROLE_OPTIONS.find((opt) => opt.id === selectedRole)?.label || "Usuario"
                }`}
              />
              <div className="relative my-3.5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <span className="relative bg-white px-2.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  o con correo y contraseña
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Correo electrónico */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-gray-700">
            Correo electrónico
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              disabled={isLoading}
              placeholder="tu-correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Contraseña (para login y registro) */}
        {!isForgotPassword && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-semibold text-gray-700">
                Contraseña
              </label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => switchMode("forgot_password")}
                  className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                minLength={6}
                disabled={isLoading}
                placeholder={isRegister ? "Crea una contraseña segura" : "Ingresa tu contraseña"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-11 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:bg-gray-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 transition hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden />
                )}
              </button>
            </div>

            {/* Medidor visual de seguridad de contraseña (en Registro) */}
            {isRegister && password.length > 0 && (
              <div className="mt-2 space-y-1.5 animate-enter-fade-up">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">Seguridad de la clave:</span>
                  <span className={`font-semibold ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 h-1.5">
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 1 ? passwordStrength.barColor : "bg-gray-200"
                    }`}
                  />
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 2 ? passwordStrength.barColor : "bg-gray-200"
                    }`}
                  />
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 3 ? passwordStrength.barColor : "bg-gray-200"
                    }`}
                  />
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 4 ? passwordStrength.barColor : "bg-gray-200"
                    }`}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Confirmar contraseña (en Registro) */}
        {isRegister && (
          <div className="space-y-1.5 animate-enter-fade-up">
            <div className="flex items-center justify-between">
              <label htmlFor="confirm-password" className="text-xs font-semibold text-gray-700">
                Confirmar contraseña
              </label>
              {passwordsMatch && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <Check className="h-3 w-3" /> Coinciden
                </span>
              )}
              {passwordsMismatch && (
                <span className="text-[11px] font-semibold text-amber-600">
                  No coinciden
                </span>
              )}
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                disabled={isLoading}
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`flex h-11 w-full rounded-xl border bg-white pl-10 pr-11 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                  passwordsMatch
                    ? "border-emerald-500 focus:border-emerald-600 focus:ring-emerald-500/20"
                    : passwordsMismatch
                    ? "border-amber-400 focus:border-amber-500 focus:ring-amber-500/20"
                    : "border-gray-300 focus:border-emerald-600 focus:ring-emerald-500/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 transition hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Aceptación de términos y condiciones (en Registro) */}
        {isRegister && (
          <div className="pt-1 animate-enter-fade-up">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200/80 bg-gray-50/60 p-3 text-xs leading-5 text-gray-600 transition hover:bg-gray-50">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-emerald-600 focus:ring-emerald-500"
              />
              <span>
                Acepto el{" "}
                <Link
                  href="/privacidad"
                  target="_blank"
                  className="font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
                >
                  aviso de privacidad
                </Link>{" "}
                y los{" "}
                <Link
                  href="/terminos"
                  target="_blank"
                  className="font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
                >
                  términos y condiciones
                </Link>{" "}
                del servicio de FutPro Manager.
              </span>
            </label>
          </div>
        )}

        {/* Alerta de Error */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 animate-enter-fade-scale">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <p className="leading-relaxed font-medium">{error}</p>
          </div>
        )}

        {/* Alerta de Éxito */}
        {success && (
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900 animate-enter-fade-scale">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            <p className="leading-relaxed font-medium">{success}</p>
          </div>
        )}

        {/* Botón principal de acción */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-lg shadow-emerald-900/20 transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation hover:shadow-emerald-900/30 active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Procesando...</span>
            </>
          ) : isForgotPassword ? (
            <>
              <KeyRound className="h-4 w-4" />
              <span>Enviar enlace de recuperación</span>
            </>
          ) : isLogin ? (
            <>
              <LogIn className="h-4 w-4" />
              <span>Entrar al panel de control</span>
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              <span>Crear mi cuenta gratuita</span>
            </>
          )}
        </Button>

        {/* Acceso social en Iniciar Sesión */}
        {isLogin && (
          <div className="pt-1">
            <div className="relative my-3 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <span className="relative bg-white px-2.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                o accede con
              </span>
            </div>
            <LogtoSignInButton label="Iniciar sesión con Google" />
          </div>
        )}

        {/* Pie y acciones secundarias */}
        {isForgotPassword ? (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded px-2 py-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Volver a iniciar sesión
            </button>
          </div>
        ) : isLogin ? (
          <div className="pt-2 text-center text-xs text-gray-500">
            ¿Aún no tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => switchMode("register")}
              className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline ml-1"
            >
              Regístrate aquí gratis
            </button>
          </div>
        ) : (
          <div className="pt-2 text-center text-xs text-gray-500">
            ¿Ya tienes una cuenta registrada?{" "}
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline ml-1"
            >
              Inicia sesión aquí
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
