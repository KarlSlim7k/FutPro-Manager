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
    <div className="flex min-h-screen flex-col justify-between">
      <div className="flex-1">{children}</div>
      <PublicFooter />
    </div>
  );
}
