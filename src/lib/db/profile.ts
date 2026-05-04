import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";

export async function getProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export async function getProfilesByIds(
  supabase: SupabaseClient,
  ids: string[],
): Promise<Record<string, Profile>> {
  if (ids.length === 0) return {};
  const { data, error } = await supabase.from("profiles").select("*").in("id", ids);
  if (error) throw error;
  const map: Record<string, Profile> = {};
  for (const p of (data ?? []) as Profile[]) map[p.id] = p;
  return map;
}

export async function upsertDisplayName(
  supabase: SupabaseClient,
  userId: string,
  displayName: string,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", userId);
  if (error) throw error;
}
