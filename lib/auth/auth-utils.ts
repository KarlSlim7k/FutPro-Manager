export type PasswordStrength = {
  score: number; // 0 to 4
  label: string;
  color: string;
  barColor: string;
  percent: number;
};

export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password || password.length === 0) {
    return {
      score: 0,
      label: "Ingresa tu contraseña",
      color: "text-gray-400",
      barColor: "bg-gray-200",
      percent: 0,
    };
  }

  let score = 0;

  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

  switch (score) {
    case 1:
      return {
        score: 1,
        label: "Débil (agrega números o más letras)",
        color: "text-red-500",
        barColor: "bg-red-500",
        percent: 25,
      };
    case 2:
      return {
        score: 2,
        label: "Aceptable (combina mayúsculas y números)",
        color: "text-amber-500",
        barColor: "bg-amber-500",
        percent: 50,
      };
    case 3:
      return {
        score: 3,
        label: "Buena y segura",
        color: "text-emerald-500",
        barColor: "bg-emerald-500",
        percent: 75,
      };
    case 4:
      return {
        score: 4,
        label: "Excelente seguridad",
        color: "text-emerald-600",
        barColor: "bg-emerald-600",
        percent: 100,
      };
    default:
      return {
        score: 0,
        label: "Mínimo 6 caracteres",
        color: "text-red-400",
        barColor: "bg-red-400",
        percent: 15,
      };
  }
}

export function validateRegistrationInput(input: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}): { valid: boolean; error?: string } {
  const cleanName = input.fullName.trim();
  if (!cleanName || cleanName.length < 2) {
    return { valid: false, error: "Por favor ingresa tu nombre completo (mínimo 2 caracteres)." };
  }

  const cleanEmail = input.email.trim();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { valid: false, error: "Por favor ingresa un correo electrónico válido." };
  }

  if (!input.password || input.password.length < 6) {
    return { valid: false, error: "La contraseña debe tener al menos 6 caracteres." };
  }

  if (input.password !== input.confirmPassword) {
    return { valid: false, error: "Las contraseñas no coinciden. Por favor verifícalas." };
  }

  if (!input.acceptedTerms) {
    return {
      valid: false,
      error: "Debes aceptar el aviso de privacidad y los términos para registrarte.",
    };
  }

  return { valid: true };
}

export function mapAuthError(message: string): string {
  const normalized = (message || "").toLowerCase();

  if (normalized.includes("invalid login credentials") || normalized.includes("invalid credentials")) {
    return "Credenciales inválidas. Verifica tu correo y contraseña.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Debes confirmar tu correo electrónico antes de iniciar sesión.";
  }

  if (normalized.includes("user already registered") || normalized.includes("already registered")) {
    return "Ese correo ya está registrado en la plataforma. Intenta iniciar sesión.";
  }

  if (normalized.includes("password should be at least")) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }

  if (normalized.includes("rate limit") || normalized.includes("too many requests")) {
    return "Demasiados intentos. Por favor espera unos minutos antes de volver a intentar.";
  }

  if (normalized.includes("network") || normalized.includes("fetch")) {
    return "Error de conexión. Revisa tu internet e inténtalo de nuevo.";
  }

  return "No se pudo completar la operación. Inténtalo nuevamente.";
}
