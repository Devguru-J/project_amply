# Amply

> 같이 듣는 순간, 방이 된다.

소셜 뮤직 룸 — 사람들이 모여 한 명이 DJ가 되어 음악을 트는 작은 클럽.
Turntable.fm / Plug.dj 영감, Next.js + Supabase + YouTube IFrame Player로 구현한 MVP.

## 📚 문서

| | |
| --- | --- |
| [docs/PRODUCT.md](./docs/PRODUCT.md) | 제품 정의, 핵심 원칙, MVP 범위 |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 시스템·데이터 모델·RPC 카탈로그·Realtime |
| [docs/DESIGN.md](./docs/DESIGN.md) | 무드, 토큰, 컴포넌트 패턴, 모션, 안티패턴 |
| [docs/SETUP.md](./docs/SETUP.md) | 로컬 실행 정확한 절차, Vercel 배포 |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | Phase 1~6 단계별 우선순위 |
| [docs/DECISIONS.md](./docs/DECISIONS.md) | 주요 결정과 근거 (ADR 라이트) |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | 한 줄 변경 기록 |

---

## 핵심 컨셉

- 사용자는 음악방에 입장.
- 한 번에 한 명이 DJ가 되어 곡을 재생.
- 곡이 끝나면 → DJ 큐의 다음 사람으로 자동 로테이션.
- 채팅, 좋아요/싫어요 반응, 실시간 접속자 표시 모두 지원.

## 스택

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn-style UI, Zustand
- **Backend**: Supabase (Auth · Postgres · Realtime — Presence/Broadcast/Postgres Changes)
- **Music**: YouTube IFrame Player API (서버에서 음원 저장/스트리밍 안 함)
- **Deploy**: Vercel (Frontend) + Supabase (Backend) + Cloudflare (Domain)

---

## 1. Supabase 프로젝트 준비

1. [supabase.com](https://supabase.com)에서 새 프로젝트를 만든다.
2. **Authentication → Providers**:
   - **Email** 활성화 (매직링크 사용).
   - **Anonymous Sign-Ins** 활성화 (게스트 입장에 필요).
3. **SQL Editor**에서 `supabase/schema.sql`의 내용을 통째로 실행한다.
   - 모든 테이블 / RPC / RLS / Realtime publication이 한 번에 세팅된다.
   - 재실행해도 안전(idempotent).
4. **Project Settings → API**에서 다음 두 값을 복사:
   - `Project URL`
   - `anon public` key

## 2. 로컬 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 세팅
cp .env.local.example .env.local
# .env.local 을 열어 Supabase URL과 anon key를 채워 넣는다.

# 3. 개발 서버
npm run dev
```

[http://localhost:3000](http://localhost:3000)

### 환경변수

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 3. Vercel 배포

1. 이 저장소를 Vercel에 연결.
2. **Project Settings → Environment Variables**에 위 3개를 등록.
   - `NEXT_PUBLIC_SITE_URL`은 배포된 도메인(`https://your-domain.com`)으로.
3. Supabase **Authentication → URL Configuration**:
   - `Site URL`: 배포 도메인
   - `Additional Redirect URLs`: `https://your-domain.com/api/auth/callback`
4. Deploy.

---

## 디렉토리 구조

```
.
├── supabase/
│   └── schema.sql                 # 전체 DB 스키마 + RPC + RLS
├── src/
│   ├── app/
│   │   ├── layout.tsx             # 루트 레이아웃 (Geist + grain overlay)
│   │   ├── page.tsx               # 랜딩
│   │   ├── globals.css            # 디자인 토큰 + 유틸리티
│   │   ├── login/page.tsx         # 게스트/이메일 로그인
│   │   ├── api/auth/callback/     # 매직링크 콜백
│   │   ├── rooms/
│   │   │   ├── page.tsx           # 공개방 목록
│   │   │   ├── new/page.tsx       # 방 만들기
│   │   │   └── [roomId]/page.tsx  # 룸 (slug 또는 UUID)
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/                    # button / input / dialog / scroll-area / avatar / separator / card
│   │   ├── landing/               # Navbar / Hero / Features / PublicRooms / Footer
│   │   └── room/
│   │       ├── RoomShell.tsx      # 룸 오케스트레이터 (subscriptions)
│   │       ├── YouTubePlayer.tsx
│   │       ├── NowPlaying.tsx
│   │       ├── DJQueue.tsx
│   │       ├── ChatPanel.tsx
│   │       ├── ParticipantsPanel.tsx
│   │       ├── ReactionBar.tsx
│   │       └── AddTrackDialog.tsx
│   ├── lib/
│   │   ├── supabase/{client,server,middleware}.ts
│   │   ├── db/{rooms,queue,messages,reactions,profile}.ts
│   │   ├── realtime.ts            # Presence/Broadcast/Postgres Changes
│   │   ├── youtube.ts             # videoId 추출 + oEmbed 메타데이터
│   │   └── utils.ts
│   ├── stores/
│   │   └── playerStore.ts         # Zustand
│   ├── types/
│   │   ├── database.ts
│   │   └── youtube.d.ts
│   └── middleware.ts              # Supabase 세션 리프레시
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
├── package.json
└── .env.local.example
```

---

## DJ 로테이션 동작 방식

(C안 — 하이브리드 단순 모델)

1. 사용자가 **DJ 참여** 버튼을 누르면 `dj_queue`에 줄을 선다.
2. `dj_queue.position` 이 0인 사람이 **현재 DJ**.
3. 현재 DJ는 **곡 추가** 버튼으로 YouTube URL을 입력 → `start_track` RPC 실행.
4. 모든 클라이언트는 `rooms.current_track_id`의 변경을 Postgres Changes로 받아 새 트랙을 로드.
5. 곡 종료 시 **현재 DJ 클라이언트**만 `advance_queue` RPC를 호출:
   - 트랙 status를 `played`로 마크
   - `current_track_id`를 null로 초기화
   - 큐의 첫 번째 사람을 맨 뒤로 이동 (로테이션)
6. 다음 사람이 차례가 되어 곡을 추가하면 사이클이 반복된다.

> **시간 동기화**는 MVP에서 제외. 모든 사용자는 트랙 시작 시점부터 자체적으로 재생합니다.

## 실시간 채널 구조

| 채널/구독 | 목적 | 메커니즘 |
| --- | --- | --- |
| `room:{id}:presence` | 접속자 목록 | Presence |
| `db:rooms:id=eq.{id}` | 현재 트랙 변경 | Postgres Changes |
| `db:tracks:room_id=eq.{id}` | 트랙 메타 변경 | Postgres Changes |
| `db:dj_queue:room_id=eq.{id}` | 큐 변경 | Postgres Changes |
| `db:room_messages:room_id=eq.{id}` | 채팅 | Postgres Changes |
| `db:track_reactions:track_id=eq.{id}` | 좋아요/싫어요 | Postgres Changes |

---

## 향후 확장 아이디어 (TODO 형태로 남겨둠)

- 친구 초대 링크 (`/rooms/[roomId]?invite=token`)
- 비공개방 패스코드
- 아바타 커스터마이징 (DiceBear 등)
- DJ 레벨 / XP 시스템
- 방 테마 (배경 그라데이션 / BPM 기반 색상)
- 투표 스킵 (1/2 이상 down 시 자동 skip)
- Spotify 연동
- 모바일 최적화 (PWA / 가로 스크롤 큐)
- 유료 방 기능

## 설계 노트

- **재생 마스터**는 항상 "현재 DJ" 클라이언트 한 명. 다른 클라이언트는 트랙 종료를 보고하지 않는다 (`isMaster=false`).
- **트랙 추가**는 `start_track` SECURITY DEFINER RPC에서만 가능. RLS는 직접 INSERT를 막는다 — 권한 체크는 RPC가 담당.
- **반응 토글**도 `react_to_track` RPC에 위임 (같은 종류 클릭 → 취소, 다른 종류 → 전환).
- **YouTube 메타데이터**는 oEmbed (`/oembed`) 엔드포인트로 무료 조회. API 키 불필요.
- **익명 사용자**는 Supabase Anonymous Auth → `is_anonymous=true` → 자동으로 `profiles.is_guest=true`.

---

## 라이선스

MIT
