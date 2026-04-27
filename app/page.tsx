import Link from "next/link";

const features = [
  "Gestión centralizada de ligas y temporadas",
  "Control de equipos y jugadores en un solo panel",
  "Planeación de partidos y seguimiento operativo",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-100">
      <section className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-14 pt-8 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              FutPro Manager
            </p>
            <p className="text-xs text-gray-500">Perote, Veracruz</p>
          </div>
          <Link
            href="/login"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
          >
            Iniciar sesión
          </Link>
        </header>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div>
            <h1 className="max-w-xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Administra ligas amateur como un profesional
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
              FutPro Manager centraliza equipos, jugadores, partidos, resultados
              y tablas de posiciones para ligas de fútbol amateur en Perote,
              Veracruz.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Iniciar sesión
              </Link>
              <a
                href="#sistema"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:border-gray-400"
              >
                Conocer el sistema
              </a>
            </div>
          </div>

          <div
            id="sistema"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl shadow-gray-200/60 sm:p-8"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-700">
              Plataforma SaaS
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-gray-900">
              Control operativo para ligas locales
            </h2>
            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              {features.map((feature) => (
                <li key={feature} className="flex gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 rounded-lg bg-gray-50 p-4 text-xs leading-5 text-gray-500">
              MVP enfocado en autenticación, panel base y escalabilidad para
              incorporar módulos de ligas, equipos, jugadores y partidos.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
