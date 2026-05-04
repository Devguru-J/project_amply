// Hand-written types matching supabase/schema.sql.
// Regenerate with `supabase gen types typescript` if you wire that up.

export type UUID = string;

export interface Profile {
  id: UUID;
  display_name: string;
  avatar_url: string | null;
  is_guest: boolean;
  created_at: string;
}

export interface Room {
  id: UUID;
  slug: string;
  name: string;
  description: string | null;
  host_id: UUID | null;
  is_public: boolean;
  current_track_id: UUID | null;
  created_at: string;
}

export interface RoomMember {
  room_id: UUID;
  user_id: UUID;
  role: "host" | "member";
  joined_at: string;
}

export type TrackStatus = "playing" | "played" | "skipped";

export interface Track {
  id: UUID;
  room_id: UUID;
  dj_user_id: UUID;
  video_id: string;
  title: string;
  channel: string | null;
  thumbnail_url: string | null;
  duration_sec: number | null;
  status: TrackStatus;
  started_at: string;
  ended_at: string | null;
}

export interface DjQueueRow {
  room_id: UUID;
  user_id: UUID;
  position: number;
  joined_at: string;
}

export interface RoomMessage {
  id: UUID;
  room_id: UUID;
  user_id: UUID;
  content: string;
  created_at: string;
}

export type ReactionKind = "up" | "down";

export interface TrackReaction {
  track_id: UUID;
  user_id: UUID;
  kind: ReactionKind;
  created_at: string;
}

// Enriched join shapes used in the UI
export interface DjQueueEntry extends DjQueueRow {
  profile: Profile | null;
}

export interface ChatEntry extends RoomMessage {
  profile: Profile | null;
}
