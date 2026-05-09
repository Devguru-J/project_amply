"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { advanceQueue, getDjQueue, joinDjQueue, leaveDjQueue, skipTrack } from "@/lib/db/queue";
import { getProfile } from "@/lib/db/profile";
import { joinRoom } from "@/lib/db/rooms";
import { subscribeToPresence, subscribeToTable, type PresenceUser } from "@/lib/realtime";
import type { DjQueueEntry, Profile, Room, Track } from "@/types/database";
import { YouTubePlayer } from "./YouTubePlayer";
import { NowPlaying } from "./NowPlaying";
import { ReactionBar } from "./ReactionBar";
import { DJQueue } from "./DJQueue";
import { ChatPanel } from "./ChatPanel";
import { ParticipantsPanel } from "./ParticipantsPanel";
import { AddTrackDialog } from "./AddTrackDialog";
import { MobileRoomActionBar } from "./MobileRoomActionBar";
import { RoomGuidance } from "./RoomGuidance";

interface Props {
  initialRoom: Room;
  initialTrack: Track | null;
  initialQueue: DjQueueEntry[];
  initialDjProfile: Profile | null;
}

export function RoomShell({
  initialRoom,
  initialTrack,
  initialQueue,
  initialDjProfile,
}: Props) {
  const supabase = getSupabaseBrowser();
  const router = useRouter();

  const [room, setRoom] = useState<Room>(initialRoom);
  const [track, setTrack] = useState<Track | null>(initialTrack);
  const [queue, setQueue] = useState<DjQueueEntry[]>(initialQueue);
  const [djProfile, setDjProfile] = useState<Profile | null>(initialDjProfile);
  const [me, setMe] = useState<Profile | null>(null);
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  const [muted, setMuted] = useState(false);
  const [queueBusy, setQueueBusy] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const currentUserId = me?.id ?? null;
  const currentDj = queue[0] ?? null;
  const myEntry = currentUserId ? queue.find((entry) => entry.user_id === currentUserId) : null;
  const isCurrentDj = currentDj?.user_id === currentUserId;
  const isMaster = isCurrentDj; // Only the current DJ reports track-end.
  const noTrackPlaying = !track;
  const myQueuePosition = myEntry ? queue.findIndex((entry) => entry.user_id === currentUserId) : -1;

  // ========== Resolve current user (auth) and ensure profile + room membership ==========
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        // Send to login, returning to this room afterwards.
        router.replace(`/login?next=${encodeURIComponent(`/rooms/${room.slug}`)}`);
        return;
      }
      const profile = await getProfile(supabase, data.user.id);
      if (!active) return;
      setMe(profile);
      // Best-effort room membership row.
      await joinRoom(supabase, room.id, data.user.id);
    })();
    return () => {
      active = false;
    };
  }, [supabase, router, room.id, room.slug]);

  // ========== Realtime: room (current_track_id changes) ==========
  useEffect(() => {
    const ch = subscribeToTable<Room>(
      supabase,
      "rooms",
      `id=eq.${room.id}`,
      async (payload) => {
        if (payload.eventType === "UPDATE") {
          setRoom(payload.new);
          if (payload.new.current_track_id) {
            const { data } = await supabase
              .from("tracks")
              .select("*")
              .eq("id", payload.new.current_track_id)
              .maybeSingle();
            setTrack((data as Track | null) ?? null);
          } else {
            setTrack(null);
          }
        }
      },
    );
    return () => {
      ch.unsubscribe();
    };
  }, [supabase, room.id]);

  // ========== Realtime: dj_queue ==========
  useEffect(() => {
    const ch = subscribeToTable(
      supabase,
      "dj_queue",
      `room_id=eq.${room.id}`,
      async () => {
        const fresh = await getDjQueue(supabase, room.id);
        setQueue(fresh);
      },
    );
    return () => {
      ch.unsubscribe();
    };
  }, [supabase, room.id]);

  // ========== Refresh DJ profile when head-of-queue changes ==========
  useEffect(() => {
    let active = true;
    if (!track) {
      setDjProfile(null);
      return;
    }
    getProfile(supabase, track.dj_user_id).then((p) => {
      if (active) setDjProfile(p);
    });
    return () => {
      active = false;
    };
  }, [supabase, track?.dj_user_id, track]);

  // ========== Presence ==========
  useEffect(() => {
    if (!me) return;
    const handle = subscribeToPresence(
      supabase,
      room.id,
      {
        user_id: me.id,
        display_name: me.display_name,
        avatar_url: me.avatar_url,
        online_at: new Date().toISOString(),
      },
      (users) => setPresenceUsers(users),
    );
    return () => {
      handle.unsubscribe();
    };
  }, [supabase, room.id, me]);

  // ========== Track-end handler (fired only by master) ==========
  const advancingRef = useRef(false);
  async function onEnded() {
    if (advancingRef.current) return;
    advancingRef.current = true;
    try {
      await advanceQueue(supabase, room.id);
    } catch {
      /* ignore */
    } finally {
      // Brief debounce to avoid double-advance when YT fires ENDED twice.
      setTimeout(() => {
        advancingRef.current = false;
      }, 1000);
    }
  }

  async function onJoinQueue() {
    if (!currentUserId || queueBusy) return;
    setQueueBusy(true);
    try {
      await joinDjQueue(supabase, room.id);
    } finally {
      setQueueBusy(false);
    }
  }

  async function onLeaveQueue() {
    if (!currentUserId || queueBusy) return;
    setQueueBusy(true);
    try {
      await leaveDjQueue(supabase, room.id);
    } finally {
      setQueueBusy(false);
    }
  }

  async function onSkipTrack() {
    if (!isCurrentDj || queueBusy) return;
    setQueueBusy(true);
    try {
      await skipTrack(supabase, room.id);
    } finally {
      setQueueBusy(false);
    }
  }

  // ========== Layout ==========
  return (
    <main className="relative min-h-[100dvh] pb-28 lg:pb-0">
      {/* Soft background */}
      <div className="orb h-[520px] w-[520px] left-[-200px] top-[-100px] bg-cyan-glow/20 animate-orb-drift" aria-hidden />
      <div
        className="orb h-[460px] w-[460px] right-[-180px] top-[20%] bg-magenta-glow/20 animate-orb-drift"
        style={{ animationDelay: "-7s" }}
        aria-hidden
      />

      {/* Top bar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/40 border-b border-white/5">
        <div className="container flex h-16 items-center gap-4">
          <Link
            href="/rooms"
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/50 hover:text-foreground transition"
          >
            ← ROOMS
          </Link>
          <div className="hairline flex-1" />
          <div className="flex items-center gap-2">
            <span className="hidden md:inline font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
              ROOM ·
            </span>
            <span className="font-display text-sm md:text-base font-semibold tracking-tight truncate max-w-[40vw] md:max-w-md">
              {room.name}
            </span>
          </div>
          <div className="hairline flex-1" />
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="h-9 w-9 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center hover:bg-white/[0.08] transition-colors"
            aria-label={muted ? "unmute" : "mute"}
          >
            {muted ? <SpeakerOff /> : <SpeakerOn />}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="container py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
          {/* Left panel — room info + participants */}
          <aside className="lg:col-span-3 space-y-4 order-2 lg:order-1">
            <div className="bezel-shell">
              <div className="bezel-core p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                  ABOUT
                </div>
                <h1 className="mt-2 font-display text-xl font-semibold tracking-tight">
                  {room.name}
                </h1>
                {room.description && (
                  <p className="mt-2 text-sm text-foreground/60 leading-relaxed">
                    {room.description}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-3 text-[10px] uppercase font-mono tracking-[0.22em] text-foreground/40">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-glow animate-pulse-glow" />
                    {room.is_public ? "PUBLIC" : "PRIVATE"}
                  </span>
                  <span>·</span>
                  <span>{presenceUsers.length} HERE</span>
                </div>
              </div>
            </div>
            <ParticipantsPanel
              users={presenceUsers}
              currentUserId={currentUserId}
              djUserId={track?.dj_user_id ?? null}
            />
          </aside>

          {/* Center column — Player + NowPlaying + Reactions */}
          <section className="lg:col-span-6 space-y-4 order-1 lg:order-2">
            <RoomGuidance
              currentUserId={currentUserId}
              queueLength={queue.length}
              isCurrentDj={isCurrentDj}
              hasMyEntry={!!myEntry}
              myQueuePosition={myQueuePosition}
              noTrackPlaying={noTrackPlaying}
              busy={queueBusy}
              onJoinQueue={onJoinQueue}
              onLeaveQueue={onLeaveQueue}
              onAddTrack={() => setAddOpen(true)}
              onSkipTrack={onSkipTrack}
            />
            <YouTubePlayer
              track={track}
              isMaster={isMaster}
              muted={muted}
              onEnded={onEnded}
            />
            <NowPlaying track={track} djProfile={djProfile} />
            <div className="flex items-center justify-between">
              <ReactionBar track={track} currentUserId={currentUserId} />
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40 hidden md:block">
                {track ? "REACT TO THE CURRENT TRACK" : "WAITING FOR NEXT DJ"}
              </div>
            </div>
          </section>

          {/* Right column — Chat */}
          <section className="lg:col-span-3 order-3 h-[480px] lg:h-[640px]">
            <div id="room-chat" className="h-full scroll-mt-20">
              <ChatPanel roomId={room.id} currentUserId={currentUserId} />
            </div>
          </section>

          {/* Bottom — DJ Queue (full width) */}
          <section className="lg:col-span-12 order-4">
            <DJQueue
              roomId={room.id}
              queue={queue}
              currentUserId={currentUserId}
              currentTrack={track}
            />
          </section>
        </div>
      </div>
      <MobileRoomActionBar
        currentUserId={currentUserId}
        isCurrentDj={isCurrentDj}
        hasMyEntry={!!myEntry}
        myQueuePosition={myQueuePosition}
        noTrackPlaying={noTrackPlaying}
        busy={queueBusy}
        onJoinQueue={onJoinQueue}
        onLeaveQueue={onLeaveQueue}
        onAddTrack={() => setAddOpen(true)}
        onSkipTrack={onSkipTrack}
      />
      <AddTrackDialog roomId={room.id} open={addOpen} onOpenChange={setAddOpen} />
    </main>
  );
}

function SpeakerOn() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M11 5L6 9H3v6h3l5 4V5z" strokeLinejoin="round" />
      <path d="M15 9.5a4 4 0 010 5M18 7a8 8 0 010 10" strokeLinecap="round" />
    </svg>
  );
}
function SpeakerOff() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M11 5L6 9H3v6h3l5 4V5z" strokeLinejoin="round" />
      <path d="M16 9l5 5M21 9l-5 5" strokeLinecap="round" />
    </svg>
  );
}
