"use server";

import { createClient } from "@/lib/supabase/server";

export type ContactFormState = {
  values: { name: string; league: string; email: string; phone: string; message: string };
  fieldErrors: Partial<Record<"name" | "email" | "message", string>>;
  formError: string | null;
  success: boolean;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EMPTY_CONTACT_STATE: ContactFormState = {
  values: { name: "", league: "", email: "", phone: "", message: "" },
  fieldErrors: {},
  formError: null,
  success: false,
};

// NOTE: EMPTY_CONTACT_STATE lives here only for server-side reuse.
// Client components must define their own copy: "use server" modules
// do not expose non-function exports to the client bundle.

export async function submitContactAction(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  // Honeypot: bots fill hidden fields, humans don't.
  if (String(formData.get("company") ?? "").trim() !== "") {
    return { ...EMPTY_CONTACT_STATE, success: true };
  }

  const values = {
    name: String(formData.get("name") ?? "").trim(),
    league: String(formData.get("league") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim(),
  };

  const fieldErrors: ContactFormState["fieldErrors"] = {};
  if (values.name.length < 2) fieldErrors.name = "Escribe tu nombre completo.";
  if (!EMAIL_PATTERN.test(values.email)) fieldErrors.email = "Escribe un correo válido.";
  if (values.message.length < 10) fieldErrors.message = "Cuéntanos un poco más (mínimo 10 caracteres).";

  if (Object.keys(fieldErrors).length > 0) {
    return { values, fieldErrors, formError: null, success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: values.name,
    email: values.email,
    league_name: values.league || null,
    phone: values.phone || null,
    message: values.message,
  });

  if (error) {
    return {
      values,
      fieldErrors: {},
      formError: "No se pudo enviar tu mensaje. Inténtalo de nuevo o escríbenos por correo.",
      success: false,
    };
  }

  return { ...EMPTY_CONTACT_STATE, success: true };
}
