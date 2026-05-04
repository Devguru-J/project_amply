import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChatEntry, Profile, RoomMessage } from "@/types/database";

export async function getRecentMessages(
  supabase: SupabaseClient,
  roomId: string,
  limit = 80,
): Promise<ChatEntry[]> {
  const { data, error } = await supabase
    .from("room_messages")
    .select("*, profile:profiles(*)")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data ?? []) as Array<RoomMessage & { profile: Profile | Profile[] | null }>)
    .map((r) => ({
      ...r,
      profile: Array.isArray(r.profile) ? (r.profile[0] ?? null) : r.profile,
    }))
    .reverse();
}

export async function postMessage(
  supabase: SupabaseClient,
  input: { roomId: string; userId: string; content: string },
): Promise<void> {
  const { error } = await supabase.from("room_messages").insert({
    room_id: input.roomId,
    user_id: input.userId,
    content: input.content,
  });
  if (error) throw error;
}

export async function getMessageWithProfile(
  supabase: SupabaseClient,
  messageId: string,
): Promise<ChatEntry | null> {
  const { data, error } = await supabase
    .from("room_messages")
    .select("*, profile:profiles(*)")
    .eq("id", messageId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as RoomMessage & { profile: Profile | Profile[] | null };
  return {
    ...row,
    profile: Array.isArray(row.profile) ? (row.profile[0] ?? null) : row.profile,
  };
}
