import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PublicFooter } from "@/components/public/public-footer";

export const metadata: Metadata = {
  title: "Términos y Condiciones del Servicio",
  description:
    "Términos y condiciones de uso de la plataforma SaaS FutPro Manager para ligas de fútbol amateur.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-gradient-to-b from-emerald-50 via-white to-gray-100">
      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded"
          >
            ← Volver al inicio
          </Link>
          <div className="mt-4">
            <Eyebrow tone="brand" className="text-sm tracking-[0.16em]">
              Legal y Servicio
            </Eyebrow>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Términos y Condiciones de Servicio
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Última actualización: Septiembre de 2026
            </p>
          </div>
        </div>

        <div className="space-y-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10 text-gray-700 leading-relaxed text-sm sm:text-base">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">
              1. Aceptación de los Términos
            </h2>
            <p>
              Al acceder, registrarse o utilizar el sitio web y los servicios de{" "}
              <strong>FutPro Manager</strong>, usted declara que ha leído,
              entendido y acepta quedar legalmente obligado por los presentes
              Términos y Condiciones. Si no está de acuerdo con alguna parte de
              estos términos, deberá abstenerse de utilizar la plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">
              2. Descripción del Servicio
            </h2>
            <p>
              FutPro Manager es una plataforma informática de tipo Software as a
              Service (SaaS) destinada a facilitar la gestión operativa y la
              difusión pública de información para ligas, torneos, clubes y
              equipos de fútbol amateur. Entre sus funcionalidades se incluyen el
              registro de equipos y plantillas, generación de roles de juego,
              cédulas arbitrales, tablas de posiciones y estadísticas deportivas.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">
              3. Cuentas de Usuario y Responsabilidades de la Liga
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li>
                <strong>Veracidad de la información:</strong> Los administradores
                de liga son los únicos responsables de asegurar que la
                información registrada (equipos, jugadores, resultados de
                partidos y sanciones) sea verídica y cuente con la debida
                autorización de los involucrados.
              </li>
              <li>
                <strong>Custodia de credenciales:</strong> El titular de la
                cuenta es responsable de mantener la confidencialidad de su
                contraseña y de toda actividad realizada desde su perfil.
              </li>
              <li>
                <strong>Uso indebido:</strong> Queda estrictamente prohibido
                utilizar la plataforma para difundir material ilícito, difamatorio,
                ofensivo o que vulnere derechos de propiedad intelectual de
                terceros.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">
              4. Exención de Responsabilidad Deportiva, Médica y Física
            </h2>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm">
              <p className="font-semibold">Deslinde de Responsabilidad:</p>
              <p className="mt-1">
                FutPro Manager es una herramienta estrictamente digital y de
                software administrativo. <strong>En ningún caso</strong> FutPro
                Manager será responsable por lesiones físicas, accidentes,
                daños materiales, disputas o incidentes ocurridos dentro o fuera
                de las instalaciones deportivas donde se disputen los partidos.
                La organización, seguridad y servicios médicos de los eventos son
                responsabilidad exclusiva de las directivas y sedes de cada liga.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">
              5. Propiedad Intelectual y Contenido Subido
            </h2>
            <p>
              La plataforma, su código fuente, diseño, logotipos y marca FutPro
              Manager son propiedad exclusiva de sus desarrolladores. Los
              logotipos de equipos, fotos de jugadores y nombres de torneos
              cargados por los usuarios permanecen bajo la titularidad de sus
              respectivos dueños, otorgando a FutPro Manager una licencia no
              exclusiva y gratuita para su visualización con fines de operación de
              la plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">
              6. Disponibilidad del Servicio y Soporte
            </h2>
            <p>
              Nos esforzamos por mantener una disponibilidad continua del servicio;
              sin embargo, el acceso puede suspenderse temporalmente por labores
              de mantenimiento programado o fallas atribuibles a proveedores de
              red e infraestructura en la nube. FutPro Manager no garantiza la
              ausencia total de interrupciones imprevistas.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">
              7. Ley Aplicable y Jurisdicción
            </h2>
            <p>
              Para la interpretación y cumplimiento de estos Términos y
              Condiciones, las partes se someten a las leyes aplicables en los
              Estados Unidos Mexicanos, acordando dirimir cualquier controversia en
              los tribunales competentes del Estado de Veracruz, renunciando a
              cualquier otro fuero que pudiera corresponderles por razón de sus
              domicilios presentes o futuros.
            </p>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
