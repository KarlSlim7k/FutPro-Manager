import { NextRequest, NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { performGlobalSearch } from "@/lib/search/global-search";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (!q.trim() || q.trim().length < 2) {
    return NextResponse.json({ leagues: [], teams: [], players: [] });
  }

  const supabase = createPublicClient();
  try {
    const results = await performGlobalSearch(supabase, q.trim());
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al realizar búsqueda", leagues: [], teams: [], players: [] },
      { status: 500 }
    );
  }
}
