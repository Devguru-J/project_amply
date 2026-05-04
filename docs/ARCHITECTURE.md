# Amply — Architecture

## 시스템 다이어그램

```
┌─────────────────────────────────────────────────────────┐
│  Browser (Next.js App Router · Client Components)       │
│                                                         │
│  ├─ YouTube IFrame Player                               │
│  │   (재생 마스터 = 현재 DJ 한 명만 onEnded 보고)       │
│  ├─ Supabase Realtime                                   │
│  │   ├─ Presence       (room:{id}:presence)             │
│  │   ├─ Broadcast      (room:{id}:playback) — 향후 사용 │
│  │   └─ Postgres CDC   (rooms / tracks / dj_queue       │
│  │                      / room_messages / track_reactions)│
│  └─ Zustand (방 로컬 상태 — 최소 사용)                  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS (cookies, JWT)
            ┌────────┴────────┐
            │                 │
       ┌────▼─────┐    ┌─────▼──────┐
       │ Next API │    │  Supabase  │
       │ /auth/   │◄──►│  Auth/DB/  │
       │ callback │    │  Realtime  │
       └──────────┘    └────────────┘
```

## 기술 스택

| Layer | Pick | 이유 |
| --- | --- | --- |
| Framework | Next.js 15 App Router | RSC + Route Handlers + Vercel 배포 단순성 |
| UI | Tailwind + shadcn-style + Geist | 다크 클럽 톤을 토큰으로 통제 |
| State | Zustand (소량) | RSC + Realtime 조합에서 글로벌 상태 최소 |
| Auth/DB/RT | Supabase | Anonymous Auth + Postgres + Realtime 한 묶음 |
| Player | YouTube IFrame API | 라이선스/스토리지 부담 0 |
| Deploy | Vercel + Supabase + Cloudflare | MVP 운영 단순화 |

## 핵심 결정

### 1. 재생 마스터는 "현재 DJ" 클라이언트

- 곡 종료 감지(`YT.PlayerState.ENDED`)는 현재 DJ의 브라우저에서만 처리한다.
- 다른 클라이언트는 `rooms.current_track_id`의 변경을 보고 새 트랙을 로드만 한다.
- 이중 호출 방지: `RoomShell` 안에 `advancingRef` 디바운스(1초).

### 2. 시간 동기화는 MVP에서 제외

- 사용자별로 트랙 시작 시점부터 자체적으로 재생.
- 약간의 딜레이 허용. "함께 듣는 감각"이 핵심이지 ms 정확도가 아님.

### 3. DJ 로테이션 (C안 — 하이브리드)

- `dj_queue.position = 0` 인 사람이 현재 DJ.
- 차례인 DJ만 `start_track` RPC 호출 가능.
- 종료 시 `advance_queue` RPC가 **두 가지를 수행**:
  - 트랙 status `played`로 마크 + `current_track_id = null`
  - 큐 head를 맨 뒤로 보냄 (다른 사람들 position -1)

### 4. 모든 쓰기 RPC는 SECURITY DEFINER

- `tracks` / `dj_queue` / `track_reactions` 테이블은 RLS로 직접 INSERT 차단.
- 권한 검사는 RPC가 담당 (`auth.uid()` + 비즈니스 로직).
- 클라이언트가 우회 불가능.

### 5. 익명 사용자 = 1급 시민

- Supabase Anonymous Auth → `auth.users.is_anonymous = true`
- 자동 트리거가 `profiles` 행 생성, `is_guest = true`로 마크.
- RLS는 익명도 인증된 유저로 인식 (`auth.uid()` 정상 반환).

## 디렉토리 매핑

```
src/
├── app/                                # 라우트
│   ├── page.tsx                        # 랜딩 (RSC, 공개방 미리보기 6개)
│   ├── login/page.tsx                  # 게스트/이메일 로그인 (Suspense)
│   ├── api/auth/callback/route.ts      # 매직링크 코드 교환
│   ├── rooms/
│   │   ├── page.tsx                    # 공개방 목록 (RSC)
│   │   ├── new/page.tsx                # 방 만들기 (Client)
│   │   └── [roomId]/page.tsx           # 룸 (RSC → RoomShell 클라이언트)
│   ├── globals.css                     # 디자인 토큰
│   └── layout.tsx                      # 루트 (Geist + grain)
│
├── components/
│   ├── ui/                             # shadcn 스타일 프리미티브
│   ├── landing/                        # Navbar/Hero/Features/PublicRooms/Footer
│   └── room/
│       ├── RoomShell.tsx               # 모든 subscription 오케스트레이션
│       ├── YouTubePlayer.tsx           # IFrame API 래퍼
│       ├── NowPlaying.tsx              # 트랙 메타 + 경과 시간
│       ├── DJQueue.tsx                 # 슬롯 + 참여/곡 추가/스킵
│       ├── ChatPanel.tsx               # 채팅 + 입력
│       ├── ParticipantsPanel.tsx       # Presence 기반 접속자
│       ├── ReactionBar.tsx             # 좋아요/싫어요
│       └── AddTrackDialog.tsx          # YouTube URL 입력 모달
│
├── lib/
│   ├── supabase/{client,server,middleware}.ts   # SSR 분리
│   ├── db/{rooms,queue,messages,reactions,profile}.ts  # 쿼리 헬퍼
│   ├── realtime.ts                     # Presence/Broadcast/CDC 래퍼
│   ├── youtube.ts                      # videoId 추출 + oEmbed
│   └── utils.ts                        # cn / slugify / formatTimeAgo
│
├── stores/playerStore.ts               # Zustand
├── types/{database,youtube}.ts         # 핸드 타입
└── middleware.ts                       # Supabase 세션 리프레시
```

## Realtime 채널 매핑

| 채널/구독 | 종류 | 목적 | 구독 위치 |
| --- | --- | --- | --- |
| `room:{id}:presence` | Presence | 접속자 표시 | `RoomShell` |
| `db:rooms:id=eq.{id}` | Postgres CDC | `current_track_id` 변경 → 새 트랙 로드 | `RoomShell` |
| `db:dj_queue:room_id=eq.{id}` | Postgres CDC | 큐 변동 시 재조회 | `RoomShell` |
| `db:room_messages:room_id=eq.{id}` | Postgres CDC | 채팅 INSERT 수신 | `ChatPanel` |
| `db:track_reactions:track_id=eq.{id}` | Postgres CDC | 반응 변동 | `ReactionBar` |

> 현재 Broadcast는 미사용. "투표 스킵" 같은 ad-hoc 이벤트가 필요해지면 `room:{id}:playback` 채널을 사용한다 (이미 `lib/realtime.ts`에 wired).

## 데이터 모델 (요약)

자세한 정의는 `supabase/schema.sql` 참조.

```
profiles (id ← auth.users.id, display_name, is_guest)
rooms (id, slug, name, host_id, is_public, current_track_id ↗ tracks.id)
room_members (room_id, user_id, role)
tracks (id, room_id, dj_user_id, video_id, title, status, started_at, ended_at)
dj_queue (room_id, user_id, position)
room_messages (id, room_id, user_id, content, created_at)
track_reactions (track_id, user_id, kind: up|down)
```

## RPC 카탈로그

| RPC | 호출자 | 동작 |
| --- | --- | --- |
| `join_dj_queue(room_id)` | 인증된 누구나 | 큐 끝에 추가 (멱등) |
| `leave_dj_queue(room_id)` | 본인 | 본인 제거 + position repack |
| `start_track(room_id, video_id, ...)` | 차례인 DJ만 | `tracks` insert + `rooms.current_track_id` 설정 |
| `advance_queue(room_id)` | 누구나 | 현재 트랙 종료 처리 + 큐 head 로테이션 |
| `skip_track(room_id)` | 누구나 (MVP) | 현재 트랙 `skipped`로 마크 후 advance |
| `react_to_track(track_id, kind)` | 인증된 누구나 | 좋아요/싫어요 토글/전환/취소 |
| `current_dj(room_id)` | (헬퍼) | 큐의 head user_id 반환 |

## RLS 요약

- **읽기**는 거의 모두 공개 (`true`).
- **쓰기**는:
  - `rooms`: host만 update, 인증된 유저가 자기 호스트로 insert.
  - `room_members`: 본인이 자기 행 insert/delete.
  - `room_messages`: 본인이 자기 user_id로 insert.
  - `tracks` / `dj_queue` / `track_reactions`: **클라이언트 직접 쓰기 금지** — 위 RPC만 사용.

## 인증 플로우

```
[Guest path]
  /login (게스트 탭)
    → signInAnonymously({ data: { display_name } })
    → 트리거가 profiles 자동 생성 (is_guest=true)
    → display_name 업데이트
    → router.replace(next)

[Email path]
  /login (이메일 탭)
    → signInWithOtp({ email, emailRedirectTo: /api/auth/callback })
    → 사용자 메일함 → 매직링크 클릭
    → /api/auth/callback?code=... 
    → exchangeCodeForSession
    → next로 redirect
```

## 미들웨어

`src/middleware.ts` → `lib/supabase/middleware.ts`의 `updateSession`.
- 모든 요청에서 Supabase 세션 쿠키 리프레시.
- `_next/static`, 이미지, favicon은 매처에서 제외.

## 실패 모드와 대응

| 실패 | 영향 | 대응 |
| --- | --- | --- |
| Supabase 다운 | 모든 쓰기/읽기 실패 | 랜딩 페이지는 try/catch로 빈 목록 반환, 룸은 진입 시 에러 |
| YouTube 동영상 차단/지역 제한 | 그 트랙 재생 불가 | 사용자가 스킵 버튼으로 우회 |
| Realtime 채널 끊김 | 새 메시지/큐 변경 미수신 | Supabase 클라이언트가 자동 재연결 |
| `advance_queue` 이중 호출 | 큐 두 칸 점프 | `advancingRef` 디바운스 + DB 단의 `for update` 락 |
| 익명 sessionStorage 만료 | 새로고침 시 재로그인 필요 | (의도된 동작) |
