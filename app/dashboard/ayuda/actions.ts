"use server";

import { createClient } from "@/lib/supabase/server";
import { getTutorials as fetchTutorials, getTutorialBySlug as fetchTutorialBySlug } from "@/lib/tutorials/queries";
import { getGlobalVisibleRoles } from "@/lib/tutorials/roles";
import type { Tutorial, TutorialWithSteps } from "@/types/database";

export async function getTutorialsAction(opts: {
  q?: string | null;
  role?: string | null;
  tag?: string | null;
}): Promise<Tutorial[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const userAllowedRoles = await getGlobalVisibleRoles(supabase, user.id);

  return fetchTutorials({
    ...opts,
    userAllowedRoles,
  });
}

export async function getTutorialBySlugAction(
  slug: string
): Promise<TutorialWithSteps | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const userAllowedRoles = await getGlobalVisibleRoles(supabase, user.id);

  return fetchTutorialBySlug(slug, userAllowedRoles);
}
