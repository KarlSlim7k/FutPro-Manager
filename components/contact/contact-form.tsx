"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CircleCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CONTACT_EMAIL } from "@/lib/site";
import { submitContactAction, type ContactFormState } from "@/app/contacto/actions";

const EMPTY_CONTACT_STATE: ContactFormState = {
  values: { name: "", league: "", email: "", phone: "", message: "" },
  fieldErrors: {},
  formError: null,
  success: false,
};

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base sm:text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600";

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitContactAction,
    EMPTY_CONTACT_STATE
  );

  if (state.success) {
    return (
      <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CircleCheck className="mx-auto h-10 w-10 text-emerald-600" aria-hidden />
        <h3 className="mt-3 text-lg font-semibold text-gray-900">
          ¡Mensaje recibido!
        </h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-gray-600">
          Gracias por escribirnos. Te responderemos a tu correo lo antes
          posible. Si prefieres, también puedes escribirnos directamente a{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-emerald-700 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm font-medium text-emerald-700 hover:underline"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {/* Honeypot anti-spam: oculto para humanos */}
      <div className="hidden" aria-hidden>
        <label htmlFor="company">Empresa</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="name" className="text-xs font-medium text-gray-700">
            Tu nombre completo
          </label>
          <Input
            id="name"
            name="name"
            required
            placeholder="Ej. Roberto Sánchez"
            defaultValue={state.values.name}
            disabled={isPending}
          />
          {state.fieldErrors.name ? (
            <p className="text-xs text-red-600">{state.fieldErrors.name}</p>
          ) : null}
        </div>
        <div className="space-y-1">
          <label htmlFor="league" className="text-xs font-medium text-gray-700">
            Nombre de tu liga o torneo
          </label>
          <input
            id="league"
            name="league"
            placeholder="Ej. Liga Dominical Premier"
            defaultValue={state.values.league}
            disabled={isPending}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="email" className="text-xs font-medium text-gray-700">
            Correo electrónico
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="tu-correo@ejemplo.com"
            defaultValue={state.values.email}
            disabled={isPending}
          />
          {state.fieldErrors.email ? (
            <p className="text-xs text-red-600">{state.fieldErrors.email}</p>
          ) : null}
        </div>
        <div className="space-y-1">
          <label htmlFor="phone" className="text-xs font-medium text-gray-700">
            Teléfono o WhatsApp (opcional)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Ej. 282 123 4567"
            defaultValue={state.values.phone}
            disabled={isPending}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="message" className="text-xs font-medium text-gray-700">
          ¿En qué podemos ayudarte?
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          placeholder="Cuéntanos cuántos equipos tienes, qué formato juegas o qué dudas tienes sobre la plataforma..."
          defaultValue={state.values.message}
          disabled={isPending}
          className={inputClass}
        />
        {state.fieldErrors.message ? (
          <p className="text-xs text-red-600">{state.fieldErrors.message}</p>
        ) : null}
      </div>

      {state.formError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.formError}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-12 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-lg shadow-emerald-900/20 transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation hover:shadow-emerald-900/30 active:scale-[0.99]"
      >
        <Send className="h-4 w-4" aria-hidden />
        {isPending ? "Enviando..." : "Enviar mensaje"}
      </Button>
      <p className="text-center text-xs text-gray-500">
        ¿Prefieres correo? Escríbenos a{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="font-medium text-emerald-700 hover:underline"
        >
          {CONTACT_EMAIL}
        </a>
      </p>
    </form>
  );
}
