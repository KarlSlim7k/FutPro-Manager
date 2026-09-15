import { redirect } from "next/navigation";

export default async function LigasAliasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const query = Array.isArray(q) ? q[0] : q;
  if (query) {
    redirect(`/explorar?q=${encodeURIComponent(query)}`);
  }
  redirect("/explorar");
}
