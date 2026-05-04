"use client";

import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

// Channel naming conventions used across the app.
export const channels = {
  presence: (roomId: string) => `room:${roomId}:presence`,
  playback: (roomId: string) => `room:${roomId}:playback`,
};

export type PresenceUser = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  online_at: string;
};

export type PlaybackEvent =
  | { type: "track-ended"; track_id: string; at: string }
  | { type: "track-started"; track_id: string; at: string }
  | { type: "skip-requested"; at: string };

export interface PresenceHandle {
  channel: RealtimeChannel;
  unsubscribe: () => Promise<"error" | "ok" | "timed out">;
}

/**
 * Subscribe to presence on a room. Tracks the current user and pushes
 * a sync'd list of all online users via `onSync`.
 */
export function subscribeToPresence(
  supabase: SupabaseClient,
  roomId: string,
  user: PresenceUser,
  onSync: (users: PresenceUser[]) => void,
): PresenceHandle {
  const channel = supabase.channel(channels.presence(roomId), {
    config: { presence: { key: user.user_id } },
  });

  channel
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState() as Record<string, PresenceUser[]>;
      const users = Object.values(state)
        .flat()
        .reduce<PresenceUser[]>((acc, u) => {
          if (!acc.find((x) => x.user_id === u.user_id)) acc.push(u);
          return acc;
        }, []);
      onSync(users);
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track(user);
      }
    });

  return {
    channel,
    unsubscribe: async () => channel.unsubscribe(),
  };
}

/**
 * Subscribe to broadcast playback events (track-ended, skip-requested, etc).
 */
export function subscribeToPlayback(
  supabase: SupabaseClient,
  roomId: string,
  onEvent: (event: PlaybackEvent) => void,
): { channel: RealtimeChannel; send: (event: PlaybackEvent) => Promise<void> } {
  const channel = supabase.channel(channels.playback(roomId));

  channel
    .on("broadcast", { event: "playback" }, ({ payload }) => {
      onEvent(payload as PlaybackEvent);
    })
    .subscribe();

  return {
    channel,
    send: async (event) => {
      await channel.send({ type: "broadcast", event: "playback", payload: event });
    },
  };
}

/**
 * Subscribe to Postgres CDC for a single table, filtered by room_id.
 */
export function subscribeToTable<T = Record<string, unknown>>(
  supabase: SupabaseClient,
  table: "rooms" | "tracks" | "dj_queue" | "room_messages" | "track_reactions",
  filter: string,
  onChange: (payload: { eventType: "INSERT" | "UPDATE" | "DELETE"; new: T; old: T }) => void,
): RealtimeChannel {
  const channel = supabase
    .channel(`db:${table}:${filter}`)
    .on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "postgres_changes" as any,
      { event: "*", schema: "public", table, filter },
      (payload: unknown) => {
        onChange(payload as { eventType: "INSERT" | "UPDATE" | "DELETE"; new: T; old: T });
      },
    )
    .subscribe();

  return channel;
}
