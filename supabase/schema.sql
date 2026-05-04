-- ============================================================
-- Clubtable — Supabase schema
--   Run this in: Supabase Studio → SQL editor → New query
--   (Idempotent: safe to re-run.)
-- ============================================================

-- Required extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  is_guest boolean not null default false,
  created_at timestamptz not null default now()
);

-- Auto-create profile when a new auth user appears.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, is_guest)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(coalesce(new.email, ''), '@', 1),
      'guest_' || substr(new.id::text, 1, 6)
    ),
    coalesce(new.is_anonymous, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROOMS
-- ============================================================
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  host_id uuid references public.profiles(id) on delete set null,
  is_public boolean not null default true,
  current_track_id uuid,  -- FK added below (circular)
  created_at timestamptz not null default now()
);

create index if not exists rooms_is_public_idx on public.rooms(is_public, created_at desc);

-- ============================================================
-- ROOM MEMBERS (lightweight; presence is the realtime source of truth)
-- ============================================================
create table if not exists public.room_members (
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('host','member')),
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

-- ============================================================
-- TRACKS
-- ============================================================
create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  dj_user_id uuid not null references public.profiles(id) on delete set null,
  video_id text not null,           -- YouTube video ID
  title text not null,
  channel text,
  thumbnail_url text,
  duration_sec int,
  status text not null default 'playing' check (status in ('playing','played','skipped')),
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create index if not exists tracks_room_idx on public.tracks(room_id, started_at desc);

-- Now add the circular FK from rooms.current_track_id
alter table public.rooms
  drop constraint if exists rooms_current_track_id_fkey;
alter table public.rooms
  add constraint rooms_current_track_id_fkey
  foreign key (current_track_id) references public.tracks(id) on delete set null;

-- ============================================================
-- DJ QUEUE
-- ============================================================
create table if not exists public.dj_queue (
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  position int not null,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create index if not exists dj_queue_position_idx on public.dj_queue(room_id, position);

-- ============================================================
-- ROOM MESSAGES (chat)
-- ============================================================
create table if not exists public.room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists room_messages_room_idx on public.room_messages(room_id, created_at desc);

-- ============================================================
-- TRACK REACTIONS
-- ============================================================
create table if not exists public.track_reactions (
  track_id uuid not null references public.tracks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('up','down')),
  created_at timestamptz not null default now(),
  primary key (track_id, user_id)
);

create index if not exists track_reactions_track_idx on public.track_reactions(track_id);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Returns the user_id of the current DJ in a room (lowest position),
-- or null if no DJs are queued.
create or replace function public.current_dj(p_room_id uuid)
returns uuid
language sql
stable
as $$
  select user_id from public.dj_queue
  where room_id = p_room_id
  order by position asc
  limit 1;
$$;

-- Join the DJ queue (idempotent). Appends to the end.
create or replace function public.join_dj_queue(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_next_pos int;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select coalesce(max(position), -1) + 1 into v_next_pos
  from public.dj_queue where room_id = p_room_id;

  insert into public.dj_queue (room_id, user_id, position)
  values (p_room_id, v_uid, v_next_pos)
  on conflict (room_id, user_id) do nothing;
end;
$$;

-- Leave the DJ queue. Repacks positions to keep them contiguous.
create or replace function public.leave_dj_queue(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  delete from public.dj_queue
  where room_id = p_room_id and user_id = v_uid;

  -- Repack positions
  with ranked as (
    select user_id, row_number() over (order by position) - 1 as new_pos
    from public.dj_queue where room_id = p_room_id
  )
  update public.dj_queue q
  set position = r.new_pos
  from ranked r
  where q.room_id = p_room_id and q.user_id = r.user_id;
end;
$$;

-- Start a track (only callable by the current DJ; only when no track is playing).
create or replace function public.start_track(
  p_room_id uuid,
  p_video_id text,
  p_title text,
  p_channel text default null,
  p_thumbnail_url text default null,
  p_duration_sec int default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_current_dj uuid;
  v_existing_current uuid;
  v_track_id uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select current_track_id into v_existing_current from public.rooms where id = p_room_id;
  if v_existing_current is not null then
    raise exception 'track already playing';
  end if;

  v_current_dj := public.current_dj(p_room_id);
  if v_current_dj is null or v_current_dj <> v_uid then
    raise exception 'not your turn';
  end if;

  insert into public.tracks (room_id, dj_user_id, video_id, title, channel, thumbnail_url, duration_sec, status)
  values (p_room_id, v_uid, p_video_id, p_title, p_channel, p_thumbnail_url, p_duration_sec, 'playing')
  returning id into v_track_id;

  update public.rooms set current_track_id = v_track_id where id = p_room_id;

  return v_track_id;
end;
$$;

-- End the currently playing track and rotate the DJ queue.
-- Anyone in the room can call this (the host of the track or any client when the player ends).
create or replace function public.advance_queue(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_track_id uuid;
  v_current_dj uuid;
  v_max_pos int;
begin
  select current_track_id into v_track_id from public.rooms where id = p_room_id for update;
  if v_track_id is null then
    return;
  end if;

  update public.tracks
    set status = 'played', ended_at = now()
    where id = v_track_id;

  update public.rooms set current_track_id = null where id = p_room_id;

  -- Rotate: move current DJ to the end of the queue.
  v_current_dj := public.current_dj(p_room_id);
  if v_current_dj is not null then
    select coalesce(max(position), 0) into v_max_pos from public.dj_queue where room_id = p_room_id;

    -- Bump everyone else up by 1, send current DJ to the end.
    update public.dj_queue
      set position = position - 1
      where room_id = p_room_id and user_id <> v_current_dj;

    update public.dj_queue
      set position = v_max_pos
      where room_id = p_room_id and user_id = v_current_dj;
  end if;
end;
$$;

-- Skip the current track without playing it through.
create or replace function public.skip_track(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_track_id uuid;
  v_uid uuid := auth.uid();
begin
  select current_track_id into v_track_id from public.rooms where id = p_room_id;
  if v_track_id is null then return; end if;

  update public.tracks set status = 'skipped', ended_at = now() where id = v_track_id;
  perform public.advance_queue(p_room_id);
end;
$$;

-- Toggle a reaction. If same kind exists → remove. If different → switch. Else insert.
create or replace function public.react_to_track(p_track_id uuid, p_kind text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_existing text;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  if p_kind not in ('up','down') then raise exception 'invalid kind'; end if;

  select kind into v_existing from public.track_reactions
    where track_id = p_track_id and user_id = v_uid;

  if v_existing is null then
    insert into public.track_reactions(track_id, user_id, kind) values (p_track_id, v_uid, p_kind);
  elsif v_existing = p_kind then
    delete from public.track_reactions where track_id = p_track_id and user_id = v_uid;
  else
    update public.track_reactions set kind = p_kind, created_at = now()
      where track_id = p_track_id and user_id = v_uid;
  end if;
end;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.tracks enable row level security;
alter table public.dj_queue enable row level security;
alter table public.room_messages enable row level security;
alter table public.track_reactions enable row level security;

-- profiles
drop policy if exists "profiles_read_all" on public.profiles;
create policy "profiles_read_all" on public.profiles
  for select using (true);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update using (auth.uid() = id);

-- rooms
drop policy if exists "rooms_read_public_or_member" on public.rooms;
create policy "rooms_read_public_or_member" on public.rooms
  for select using (
    is_public
    or host_id = auth.uid()
    or exists (
      select 1 from public.room_members
      where room_id = rooms.id and user_id = auth.uid()
    )
  );

drop policy if exists "rooms_insert_authed" on public.rooms;
create policy "rooms_insert_authed" on public.rooms
  for insert with check (auth.uid() is not null and host_id = auth.uid());

drop policy if exists "rooms_update_host" on public.rooms;
create policy "rooms_update_host" on public.rooms
  for update using (host_id = auth.uid());

-- room_members
drop policy if exists "room_members_read_all" on public.room_members;
create policy "room_members_read_all" on public.room_members
  for select using (true);

drop policy if exists "room_members_insert_self" on public.room_members;
create policy "room_members_insert_self" on public.room_members
  for insert with check (auth.uid() = user_id);

drop policy if exists "room_members_delete_self" on public.room_members;
create policy "room_members_delete_self" on public.room_members
  for delete using (auth.uid() = user_id);

-- tracks
drop policy if exists "tracks_read_all" on public.tracks;
create policy "tracks_read_all" on public.tracks
  for select using (true);
-- inserts/updates happen exclusively through SECURITY DEFINER RPCs.

-- dj_queue
drop policy if exists "dj_queue_read_all" on public.dj_queue;
create policy "dj_queue_read_all" on public.dj_queue
  for select using (true);
-- inserts/updates happen exclusively through SECURITY DEFINER RPCs.

-- room_messages
drop policy if exists "room_messages_read_all" on public.room_messages;
create policy "room_messages_read_all" on public.room_messages
  for select using (true);

drop policy if exists "room_messages_insert_authed" on public.room_messages;
create policy "room_messages_insert_authed" on public.room_messages
  for insert with check (auth.uid() = user_id);

-- track_reactions
drop policy if exists "track_reactions_read_all" on public.track_reactions;
create policy "track_reactions_read_all" on public.track_reactions
  for select using (true);
-- writes go through react_to_track RPC.

-- ============================================================
-- REALTIME PUBLICATION
-- ============================================================
-- Make sure these tables are part of supabase_realtime.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rooms'
  ) then
    alter publication supabase_realtime add table public.rooms;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tracks'
  ) then
    alter publication supabase_realtime add table public.tracks;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'dj_queue'
  ) then
    alter publication supabase_realtime add table public.dj_queue;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'room_messages'
  ) then
    alter publication supabase_realtime add table public.room_messages;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'track_reactions'
  ) then
    alter publication supabase_realtime add table public.track_reactions;
  end if;
end $$;
