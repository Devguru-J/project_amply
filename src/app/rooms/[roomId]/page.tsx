import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getRoomBySlug, getRoomById, getCurrentTrack } from "@/lib/db/rooms";
import { getDjQueue } from "@/lib/db/queue";
import { getProfile } from "@/lib/db/profile";
import { RoomShell } from "@/components/room/RoomShell";
import type { Profile, Track } from "@/types/database";

export const dynamic = "force-dynamic";

interface PageProps {
  // The dynamic segment is named [roomId]; we accept either a slug or a UUID.
  params: Promise<{ roomId: string }>;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function RoomPage({ params }: PageProps) {
  const { roomId } = await params;
  const supabase = await getSupabaseServer();

  const room = UUID_RE.test(roomId)
    ? await getRoomById(supabase, roomId)
    : await getRoomBySlug(supabase, roomId);
  if (!room) notFound();

  let initialTrack: Track | null = null;
  if (room.current_track_id) {
    initialTrack = await getCurrentTrack(supabase, room.current_track_id);
  }

  const queue = await getDjQueue(supabase, room.id);

  let djProfile: Profile | null = null;
  if (initialTrack) {
    djProfile = await getProfile(supabase, initialTrack.dj_user_id);
  }

  return (
    <RoomShell
      initialRoom={room}
      initialTrack={initialTrack}
      initialQueue={queue}
      initialDjProfile={djProfile}
    />
  );
}
