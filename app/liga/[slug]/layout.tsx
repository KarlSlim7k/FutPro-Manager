import { PublicFooter } from "@/components/public/public-footer";
import { createPublicClient } from "@/lib/supabase/public";

export async function generateStaticParams() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("leagues")
    .select("slug")
    .eq("is_public", true)
    .eq("status", "active");

  return (data ?? []).map((league) => ({
    slug: league.slug,
  }));
}

export default function LeaguePublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      {/* Luces de ambiente y orbes de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-emerald-600/15 blur-[140px] animate-float-ambient"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-40 h-[650px] w-[650px] rounded-full bg-teal-600/10 blur-[150px] animate-pulse-glow-ring"
      />

      {/* Trazos geométricos de cancha de fútbol en SVG */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full stroke-emerald-500/[0.035] stroke-[1.5]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="league-tactical-grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 60 0 L 0 0 0 60" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#league-tactical-grid)" />
        <circle cx="20%" cy="300" r="220" fill="none" className="stroke-emerald-400/[0.04]" />
        <line x1="0" y1="300" x2="100%" y2="300" className="stroke-emerald-400/[0.03]" />
      </svg>

      <div className="relative z-10 flex-1">{children}</div>
      <div className="relative z-10 mt-16">
        <PublicFooter theme="dark" />
      </div>
    </div>
  );
}
