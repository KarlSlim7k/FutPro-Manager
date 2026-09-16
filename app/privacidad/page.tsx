import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PublicFooter } from "@/components/public/public-footer";

export const metadata: Metadata = {
  title: "Aviso de Privacidad",
  description:
    "Aviso de Privacidad integral de FutPro Manager conforme a la normativa de protección de datos personales.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-gradient-to-b from-emerald-50 via-white to-gray-100">
      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Volver al inicio
          </Link>
          <div className="mt-4">
            <Eyebrow tone="brand" className="text-sm tracking-[0.16em]">
              Legal y Cumplimiento
            </Eyebrow>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Aviso de Privacidad Integral
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Última actualización: Septiembre de 2026
            </p>
          </div>
        </div>

        <div className="space-y-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10 text-gray-700 leading-relaxed text-sm sm:text-base">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">
              1. Identidad y Domicilio del Responsable
            </h2>
            <p>
              <strong>FutPro Manager</strong>, con operación y desarrollo en el
              municipio de Perote, Veracruz, México, es responsable del uso,
              tratamiento y protección de los datos personales recabados a través
              del portal web y sus servicios conexos, en estricto apego a la Ley
              Federal de Protección de Datos Personales en Posesión de los
              Particulares (LFPDPPP) y su Reglamento.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">
              2. Datos Personales que Recabamos
            </h2>
            <p>
              Para prestar los servicios de gestión deportiva y consulta
              pública, recabamos las siguientes categorías de datos:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>
                <strong>Administradores y Delegados:</strong> Nombre completo,
                correo electrónico, credenciales de acceso y teléfono de
                contacto opcional.
              </li>
              <li>
                <strong>Jugadores y Cuerpos Técnicos:</strong> Nombre completo,
                fotografía deportiva de perfil, número de dorsal, posición de
                juego, historial de partidos, estadísticas individuales (goles,
                asistencias, tarjetas) y equipo al que pertenece.
              </li>
              <li>
                <strong>Árbitros:</strong> Nombre completo y designaciones
                arbitrales en partidos de la liga.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">
              3. Tratamiento de Datos de Menores de Edad
            </h2>
            <p>
              En caso de que en la liga participen categorías juveniles o
              infantiles, el registro y publicación de información (nombres y
              fotografías) de menores de edad requiere del consentimiento expreso
              y previo de sus padres, tutores o representantes legales, recabado
              bajo estricta responsabilidad de la directiva de la liga y los
              delegados de cada equipo. FutPro Manager no recaba datos sensibles
              adicionales de menores.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">
              4. Finalidades del Tratamiento
            </h2>
            <p>
              Los datos personales recabados serán utilizados para las siguientes
              finalidades primarias e indispensables:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>
                Generación y validación de cédulas arbitrales oficiales.
              </li>
              <li>
                Publicación de roles de juego, resultados, tablas de clasificación
                y estadísticas deportivas de acceso público.
              </li>
              <li>
                Autenticación y administración de permisos de acceso en el panel de
                control.
              </li>
              <li>
                Verificación de elegibilidad deportiva y control disciplinario
                (tarjetas y sanciones).
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">
              5. Transferencia de Datos
            </h2>
            <p>
              FutPro Manager no vende, no arrienda ni transfiere datos personales a
              terceros comerciales ajenos a la operación deportiva. Las únicas
              transferencias que se realizan son hacia proveedores de
              infraestructura en la nube con altos estándares de seguridad (como
              Supabase/AWS) para el exclusivo almacenamiento y respaldo de la base
              de datos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">
              6. Uso de Cookies
            </h2>
            <p>
              Este sitio utiliza únicamente cookies estrictamente necesarias
              para su funcionamiento: mantener tu sesión iniciada, proteger el
              acceso al panel de control y garantizar la seguridad de la
              plataforma (cookies de autenticación de nuestro proveedor
              Supabase). No utilizamos cookies de publicidad, rastreo de
              terceros ni analítica con identificación personal.
            </p>
            <p>
              Al visitar el sitio por primera vez te mostramos un aviso donde
              puedes aceptar todas las cookies o continuar solo con las
              necesarias; tu elección se guarda en tu propio navegador y puedes
              cambiarla en cualquier momento desde el enlace
              &quot;Preferencias de cookies&quot; al pie de página. También
              puedes borrar o bloquear cookies desde la configuración de tu
              navegador, aunque hacerlo puede impedir iniciar sesión.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">
              7. Ejercicio de Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
            </h2>
            <p>
              Usted tiene derecho a conocer qué datos personales tenemos de usted,
              para qué los utilizamos y las condiciones del uso que les damos
              (Acceso). Asimismo, es su derecho solicitar la corrección de su
              información en caso de que esté desactualizada o sea inexacta
              (Rectificación); que la eliminemos de nuestros registros cuando
              considere que la misma no está siendo utilizada adecuadamente
              (Cancelación); así como oponerse al uso de sus datos para fines
              específicos (Oposición).
            </p>
            <p>
              Para ejercer cualquiera de los derechos ARCO, o solicitar la remoción
              de una fotografía o perfil de jugador, puede ponerse en contacto con
              nuestro equipo mediante correo electrónico a:{" "}
              <a
                href="mailto:privacidad@futpromanager.com"
                className="text-emerald-700 underline font-medium"
              >
                privacidad@futpromanager.com
              </a>{" "}
              o a través de los canales de atención y WhatsApp oficial.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">
              8. Modificaciones al Aviso de Privacidad
            </h2>
            <p>
              FutPro Manager se reserva el derecho de actualizar el presente
              Aviso de Privacidad para reflejar cambios en nuestras prácticas
              operativas o disposiciones legales aplicables. Cualquier cambio será
              publicado oportunamente en este mismo apartado.
            </p>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
