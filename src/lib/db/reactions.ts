import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReactionKind, TrackReaction } from "@/types/database";

export async function reactToTrack(
  supabase: SupabaseClient,
  trackId: string,
  kind: ReactionKind,
): Promise<void> {
  const { error } = await supabase.rpc("react_to_track", {
    p_track_id: trackId,
    p_kind: kind,
  });
  if (error) throw error;
}

export async function getReactionsForTrack(
  supabase: SupabaseClient,
  trackId: string,
): Promise<TrackReaction[]> {
  const { data, error } = await supabase
    .from("track_reactions")
    .select("*")
    .eq("track_id", trackId);
  if (error) throw error;
  return (data ?? []) as TrackReaction[];
}
