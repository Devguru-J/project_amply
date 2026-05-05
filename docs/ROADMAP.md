# Amply — Roadmap

> 큰 그림. 우선순위는 위에서 아래로. 한 단계씩 끝내고 다음으로.

## 현재 위치 (2026-05-05)

**Phase 1 · MVP + Phase 2 · 배포 완료.**
운영 URL: https://project-amply.pages.dev

## 현재 포커스

**Phase 3 (P0) → Phase 3.5 (P1: RoomStage)** 순서로 진행 중.

근거 문서: [`SOCIAL_ROOM_REVIEW.md`](./SOCIAL_ROOM_REVIEW.md) — 2026-05-05 종합 리뷰.
Phase 3/3.5/4/5의 항목들은 이 리뷰의 P0/P1/P2/P3 우선순위를 반영한다.

**바로 다음 작업** (체크박스에 `→` 마커 사용):
- 위에서 가장 가까운 `→ [ ]` 항목을 잡고 시작.
- 끝나면 `[x]`로 바꾸고 다음 미완 항목에 `→` 옮기기.
- 큰 항목은 `docs/superpowers/specs/<slug>.md`로 디자인 문서 분리 후 진행.

## Phase 1 — Local Working MVP (지금)

목표: 한 사람이 로컬에서 두 브라우저로 멀티플레이 시나리오를 돌릴 수 있다.

- [x] 프로젝트 스캐폴드, 디자인 시스템, RSC/Client 분리
- [x] Supabase SQL 스키마 (테이블 / RPC / RLS / Realtime)
- [x] 게스트 로그인 + 이메일 매직링크
- [x] 방 만들기 / 공개방 목록
- [x] YouTubePlayer + 현재 DJ 마스터링
- [x] DJ 큐 + 로테이션 RPC
- [x] 채팅 (Postgres CDC)
- [x] 좋아요/싫어요 (RPC 토글)
- [x] Presence 접속자 패널
- [x] **수동 검증** — 단일 브라우저 골든패스 (방 생성 → DJ 합류 → 트랙 재생 → 반응) 통과

## Phase 2 — Cloudflare Pages 배포 ✅

ADR D-007: Vercel 대신 Cloudflare Pages 채택.

- [x] Cloudflare 어댑터 (`@cloudflare/next-on-pages`) 설치 + `pages:build` 스크립트
- [x] Next.js 15.5.2 핀 (어댑터 peer-dep 호환)
- [x] 4개 SSR 라우트에 `runtime = 'edge'` 선언
- [x] Cloudflare Pages 프로젝트 연결 (GitHub Devguru-J/project_amply)
- [x] 환경변수 등록 (`NEXT_PUBLIC_SUPABASE_URL`, `..._ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `NODE_VERSION=20`)
- [x] Compatibility flag `nodejs_compat` 추가 (Production + Preview)
- [x] Supabase Auth Redirect URL에 `/api/auth/callback` 등록 (운영 + 로컬)
- [x] Supabase CLI 마이그레이션 워크플로 도입 (ADR D-008)
- [x] 첫 배포 성공 — https://project-amply.pages.dev
- [ ] 외부 사람 1명 초대해서 같이 듣기 (실사용 검증)

## Phase 3 — 실사용 검증 직전 polish (Review P0)

가설: 외부에 보여주기 전 빈 상태/모바일/스킵 권한이 풀리면 첫 인상이 무너진다.
정합 항목: `SOCIAL_ROOM_REVIEW.md` §사이트 진단 1·2·3·5 + §추천 P0.

- → [ ] **모바일 룸 레이아웃 1차 검증** — 본인 폰으로 룸 페이지 핵심 행동(DJ 참여 / 곡 추가 / 채팅 / 반응) 도달 가능성 확인. 깨지는 곳 스크린샷.
- [ ] **빈 공개방 fallback** — 랜딩 + `/rooms`에서 방 0개일 때 매력적인 빈 상태 (데모 라운지 자동 시드 또는 카피 변경)
- [ ] **룸 진입 후 컨텍스트 안내** — 큐 비면 "첫 DJ로 부스에 서기" 중심 CTA, 내 차례면 "지금 한 곡 틀기" 강조, 대기 중이면 차례 번호 표시
- [ ] **공개방 카드 정보 밀도** — 현재곡 / 현재 DJ / 접속자 수 / 큐 길이 노출
- [ ] **스킵 권한 정리** — 현재는 누구나 호출 가능. 1차로 "현재 DJ + 호스트만" 즉시 스킵, 일반 유저는 downvote만 (RPC + RLS 수정)
- [ ] **iOS Safari 자동재생 정책 대응** — 입장 직후 무음 재생 실패 시 "탭해서 재생" 안내
- [ ] 아바타 — 익명일 때 `display_name`에서 결정적 컬러 + 글리프 생성 (DiceBear 등) ← Phase 3.5 RoomStage 준비
- [ ] 채팅 최초 메시지 5개를 SSR로 미리 렌더 (현재는 클라이언트 fetch)
- [ ] 룸 진입 직후 페이드인 시퀀스 정리
- [ ] OG 이미지 동적 생성 (룸별 카드, `@vercel/og` 또는 Cloudflare Image Resizing)
- [ ] **외부 1명 초대 실사용 세션** — Phase 2 마지막 체크박스 (위 항목 어느 정도 끝낸 후)

## Phase 3.5 — RoomStage 1차 (Review P1)

가설: 가장 큰 효과 대비 작업량. 룸을 "음악방 앱" → "사람이 같이 있는 방"으로 바꾸는 결정적 패키지.
정합 항목: `SOCIAL_ROOM_REVIEW.md` §아쉬운 점 1·2·3 + §아바타 옵션 A/B + §추천 P1.

DB 마이그레이션 없이 Presence + Broadcast로만 시작.

- [ ] **`RoomStage` 컴포넌트 신설** — 룸 중앙에 2D 플로어 영역. 기존 `ParticipantsPanel`은 일단 유지(병행).
- [ ] **DJ 부스 위치** — 현재 DJ 아바타를 부스 자리에 고정, spotlight 효과
- [ ] **관객 플로어 좌표** — `user_id` 해시 기반 결정적 좌표 (새로고침해도 같은 위치)
- [ ] **다음 DJ 강조** — `UP NEXT` 표시, 본인 차례 30초 전 글로우 알림
- [ ] **Presence payload 확장** — `avatar_seed`, `accent_color`, `floor_slot`, `status` (listening/dj/queued/away)
- [ ] **Broadcast 이벤트 타입 정의** — `emote` / `chat-burst` / `dj-spotlight` / `skip-vote`
- [ ] **반응 이펙트** — 좋아요/싫어요 클릭 시 본인 아바타 위에 800ms 이펙트 (Broadcast)
- [ ] **카피 정리** — Participants → Here Now / Floor, DJ Queue → On Deck, "부스에 서기", "줄에서 빠지기" 등
- [ ] **모바일 RoomStage 대응** — 작은 화면에서 플로어 단순화, 핵심 컨트롤 하단 고정

## Phase 4 — 오래 쓰게 만드는 기능 (Review P2)

여기까지 오면 "쓰기 편한가? 다시 올 만한가?" 단계.
정합 항목: `SOCIAL_ROOM_REVIEW.md` §추천 P2 + §아쉬운 점 5·6.

- [ ] **투표 스킵** — 3인 이상 방: 절반 또는 3표 이상이면 자동 advance. 트랙당 1인 1표.
- [ ] **곡 추가 타임아웃** — 차례인 DJ가 30초 내 곡 안 올리면 다음 차례로 패스
- [ ] **링크로 입장** — `/rooms/[slug]?invite=token` (1시간 유효, 비공개방용)
- [ ] **DJ 큐 reorder** — 본인이 자기 위치를 한 칸 미루기
- [ ] **재생 히스토리 패널** — 최근 N곡 + 그 트랙 좋아요 누구
- [ ] **세션 recap 페이지** — 방 종료 후 트랙리스트 + 베스트 반응을 공유 가능한 페이지로
- [ ] **호스트 권한** — 방 만든 사람이 다른 사람을 강제로 큐에서 빼거나 채팅 차단
- [ ] **즐겨찾는 방 / 최근 입장한 방** — 재방문 동선
- [ ] **신뢰/안전** — 메시지 신고, 게스트 rate limit, 금칙어 1차
- [ ] **분석 이벤트** — 입장/방 생성/DJ 참여/곡 추가/채팅/반응/스킵 등 (Cloudflare Web Analytics or 자체 events 테이블)

## Phase 5 — 차별화 (Review P3)

여기서부터는 Turntable 클론을 넘어선다.
정합 항목: `SOCIAL_ROOM_REVIEW.md` §아바타 옵션 C + §추천 P3.

- [ ] **방 테마** — 색조 / 그라데이션 / 폰트 변형 (다크 / 사막 / 푸른시간 등). `rooms.theme_id`
- [ ] **BPM 시각화** — 곡 메타에서 BPM 추정 → 글로우 펄스를 BPM에 동기
- [ ] **DJ 레벨 시스템** — 라이브 시간 / 좋아요 비율 / 큐 들어간 횟수로 등급
- [ ] **아바타 커스터마이징** (Review 옵션 C) — `profiles.avatar_seed`, `accent_color`, `avatar_style`. DiceBear seed + 색상 토큰 선택
- [ ] **데일리 라운지** — 하루 한 번 자동 생성되는 시그니처 방
- [ ] **방 만들기에 무드 태그** — 장르 / 무드 / 운영 방식 / 스킵 정책 (`rooms.theme_id`, `rooms.skip_policy`)
- [ ] **Canvas/3D 룸 실험** (Review 옵션 D/E) — 핵심 UX 검증 후 이벤트성 테마로

## Phase 6 — 플랫폼화

- [ ] **Spotify 연동** — DJ가 Spotify 트랙 ID로도 추가 가능 (Web Playback SDK는 프리미엄만)
- [ ] **모바일 앱** — Expo + 같은 Supabase 백엔드
- [ ] **유료 방** — Stripe + Supabase Functions, "비공개 라운지 플러스"
- [ ] **API 공개** — 외부에서 방 임베드 가능

---

## 추적 규칙

- 새 항목은 위에서 우선순위 맞춰서 끼워넣는다.
- 완료 항목은 지우지 말고 `[x]`로 둔다 — 후행 컨텍스트로 활용.
- "지금 작업 중"은 `→ [ ]` 마커. 한 번에 하나만.
- 큰 작업은 `docs/superpowers/specs/<slug>.md` 아래 별도 디자인 doc으로 빠진다 (브레인스토밍 → 스펙 → 플랜 → 실행).
- 작은 작업은 `CHANGELOG.md` 한 줄로 마무리.

## 세션 워크플로

매 작업 세션 시작 시:

1. **현재 포커스 섹션** 확인 → `→ [ ]` 마커가 어느 항목인지 본다.
2. 해당 항목이 큰 작업이면 `docs/superpowers/specs/<slug>.md` 디자인 문서 먼저.
3. 작은 작업이면 바로 들어가되, 끝나면:
   - 체크박스 `[x]`로 표시
   - 다음 미완 항목에 `→` 옮기기
   - 코드 변경은 commit + push
   - `CHANGELOG.md`에 한 줄 추가 (커밋 해시 포함)
4. 한 phase 안에서 진행 중이던 게 막히면 같은 phase 다른 항목 또는 한 단계 위 phase로 이동.
5. 새 발견 / 결정은 `DECISIONS.md` 또는 `ARCHITECTURE.md`에 즉시 반영.

## 인용 주의

이 ROADMAP의 항목들은 `SOCIAL_ROOM_REVIEW.md`(2026-05-05)의 진단을
반영한다. Review 문서가 변경되면 phase 번호와 우선순위도 같이 갱신.
역으로 작업하면서 review 가설이 틀렸다는 증거가 나오면 review 문서에
주석을 추가한 뒤 ROADMAP 갱신.
