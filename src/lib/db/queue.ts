import type { SupabaseClient } from "@supabase/supabase-js";
import type { DjQueueEntry, DjQueueRow, Profile } from "@/types/database";

export async function getDjQueue(
  supabase: SupabaseClient,
  roomId: string,
): Promise<DjQueueEntry[]> {
  const { data, error } = await supabase
    .from("dj_queue")
    .select("room_id, user_id, position, joined_at, profile:profiles(*)")
    .eq("room_id", roomId)
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row: unknown) => {
    const r = row as DjQueueRow & { profile: Profile | Profile[] | null };
    const profile = Array.isArray(r.profile) ? (r.profile[0] ?? null) : r.profile;
    return { ...r, profile };
  });
}

export async function joinDjQueue(supabase: SupabaseClient, roomId: string): Promise<void> {
  const { error } = await supabase.rpc("join_dj_queue", { p_room_id: roomId });
  if (error) throw error;
}

export async function leaveDjQueue(supabase: SupabaseClient, roomId: string): Promise<void> {
  const { error } = await supabase.rpc("leave_dj_queue", { p_room_id: roomId });
  if (error) throw error;
}

export async function startTrack(
  supabase: SupabaseClient,
  input: {
    roomId: string;
    videoId: string;
    title: string;
    channel?: string;
    thumbnailUrl?: string;
    durationSec?: number;
  },
): Promise<string> {
  const { data, error } = await supabase.rpc("start_track", {
    p_room_id: input.roomId,
    p_video_id: input.videoId,
    p_title: input.title,
    p_channel: input.channel ?? null,
    p_thumbnail_url: input.thumbnailUrl ?? null,
    p_duration_sec: input.durationSec ?? null,
  });
  if (error) throw error;
  return data as string;
}

export async function advanceQueue(supabase: SupabaseClient, roomId: string): Promise<void> {
  const { error } = await supabase.rpc("advance_queue", { p_room_id: roomId });
  if (error) throw error;
}

export async function skipTrack(supabase: SupabaseClient, roomId: string): Promise<void> {
  const { error } = await supabase.rpc("skip_track", { p_room_id: roomId });
  if (error) throw error;
}
