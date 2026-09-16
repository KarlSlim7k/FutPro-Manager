import { describe, expect, it } from "vitest";
import {
  calculatePasswordStrength,
  mapAuthError,
  validateRegistrationInput,
} from "./auth-utils";

describe("auth-utils", () => {
  describe("calculatePasswordStrength", () => {
    it("handles empty password", () => {
      const result = calculatePasswordStrength("");
      expect(result.score).toBe(0);
      expect(result.percent).toBe(0);
    });

    it("evaluates short password", () => {
      const result = calculatePasswordStrength("abc");
      expect(result.score).toBe(0);
      expect(result.percent).toBe(15);
    });

    it("evaluates medium password", () => {
      const result = calculatePasswordStrength("password123");
      expect(result.score).toBeGreaterThanOrEqual(2);
      expect(result.percent).toBeGreaterThanOrEqual(50);
    });

    it("evaluates strong password with mixed case, numbers, length", () => {
      const result = calculatePasswordStrength("FutPro2026!Master");
      expect(result.score).toBe(4);
      expect(result.percent).toBe(100);
      expect(result.label).toContain("Excelente");
    });
  });

  describe("validateRegistrationInput", () => {
    const baseValid = {
      fullName: "Roberto Carlos",
      email: "roberto@ejemplo.com",
      password: "secretpassword1",
      confirmPassword: "secretpassword1",
      acceptedTerms: true,
    };

    it("validates correct registration data", () => {
      const res = validateRegistrationInput(baseValid);
      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it("fails when full name is too short", () => {
      const res = validateRegistrationInput({ ...baseValid, fullName: "A" });
      expect(res.valid).toBe(false);
      expect(res.error).toContain("nombre completo");
    });

    it("fails when email is invalid", () => {
      const res = validateRegistrationInput({ ...baseValid, email: "invalid-email" });
      expect(res.valid).toBe(false);
      expect(res.error).toContain("correo electrónico");
    });

    it("fails when password is too short", () => {
      const res = validateRegistrationInput({
        ...baseValid,
        password: "123",
        confirmPassword: "123",
      });
      expect(res.valid).toBe(false);
      expect(res.error).toContain("al menos 6 caracteres");
    });

    it("fails when passwords do not match", () => {
      const res = validateRegistrationInput({
        ...baseValid,
        password: "password123",
        confirmPassword: "password456",
      });
      expect(res.valid).toBe(false);
      expect(res.error).toContain("no coinciden");
    });

    it("fails when terms are not accepted", () => {
      const res = validateRegistrationInput({ ...baseValid, acceptedTerms: false });
      expect(res.valid).toBe(false);
      expect(res.error).toContain("términos");
    });
  });

  describe("mapAuthError", () => {
    it("maps invalid login credentials", () => {
      expect(mapAuthError("Invalid login credentials")).toContain("Credenciales inválidas");
    });

    it("maps email not confirmed", () => {
      expect(mapAuthError("Email not confirmed")).toContain("confirmar tu correo");
    });

    it("maps user already registered", () => {
      expect(mapAuthError("User already registered")).toContain("ya está registrado");
    });

    it("maps rate limit error", () => {
      expect(mapAuthError("Rate limit exceeded. Too many requests.")).toContain("Demasiados intentos");
    });
  });
});
