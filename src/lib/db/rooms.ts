import type { SupabaseClient } from "@supabase/supabase-js";
import type { Room, Track } from "@/types/database";
import { slugify } from "@/lib/utils";

export async function getPublicRooms(supabase: SupabaseClient, limit = 24): Promise<Room[]> {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Room[];
}

export async function getRoomBySlug(supabase: SupabaseClient, slug: string): Promise<Room | null> {
  const { data, error } = await supabase.from("rooms").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return (data as Room | null) ?? null;
}

export async function getRoomById(supabase: SupabaseClient, id: string): Promise<Room | null> {
  const { data, error } = await supabase.from("rooms").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Room | null) ?? null;
}

export async function getCurrentTrack(
  supabase: SupabaseClient,
  trackId: string,
): Promise<Track | null> {
  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .eq("id", trackId)
    .maybeSingle();
  if (error) throw error;
  return (data as Track | null) ?? null;
}

export async function createRoom(
  supabase: SupabaseClient,
  input: { name: string; description?: string; is_public?: boolean; host_id: string },
): Promise<Room> {
  const slug = slugify(input.name);
  const { data, error } = await supabase
    .from("rooms")
    .insert({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      is_public: input.is_public ?? true,
      host_id: input.host_id,
      slug,
    })
    .select("*")
    .single();
  if (error) throw error;

  // Auto-add host as a room_member with role=host.
  await supabase.from("room_members").upsert({
    room_id: (data as Room).id,
    user_id: input.host_id,
    role: "host",
  });

  return data as Room;
}

export async function joinRoom(
  supabase: SupabaseClient,
  roomId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase.from("room_members").upsert({
    room_id: roomId,
    user_id: userId,
    role: "member",
  });
  if (error && error.code !== "23505") throw error;
}
