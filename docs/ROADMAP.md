# Amply — Roadmap

> 큰 그림. 우선순위는 위에서 아래로. 한 단계씩 끝내고 다음으로.

## 현재 위치 (2026-05-05)

**Phase 1 · MVP + Phase 2 · 배포 완료.**
운영 URL: https://project-amply.pages.dev
다음 자연스러운 단계: Phase 3 polish 또는 실사용 테스트.

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

## Phase 3 — 사람들에게 보여주기 전 다듬기

가설: 디자인은 좋지만 첫 인상에서 비어있는 느낌이 든다.

- [ ] 빈 공개방 목록 시 더 매력적인 빈 상태 (라이브한 데모 룸 자동 시드?)
- [ ] 룸 진입 직후 페이드인 시퀀스 정리
- [ ] 채팅 최초 메시지 5개를 SSR로 미리 렌더 (현재는 클라이언트 fetch)
- [ ] 모바일 룸 페이지 레이아웃 검증 — 채팅이 너무 작지 않은지
- [ ] 아바타 — 익명일 때 `display_name`에서 결정적 컬러 + 글리프 생성 (DiceBear 등)
- [ ] OG 이미지 동적 생성 (`@vercel/og`로 룸별 카드)

## Phase 4 — 핵심 UX 격차 메우기

여기까지 오면 "쓰기 편한가?" 단계.

- [ ] **투표 스킵** — 방에 있는 사람 절반이 싫어요 → 자동 advance
- [ ] **곡 추가 타임아웃** — 차례인 DJ가 30초 내 곡 안 올리면 다음 차례로 패스
- [ ] **링크로 입장** — `/rooms/[slug]?invite=token` (1시간 유효, 비공개방용)
- [ ] **DJ 큐 reorder** — 본인이 자기 위치를 한 칸 미루기
- [ ] **재생 히스토리 패널** — 최근 N곡 + 그 트랙 좋아요 누구
- [ ] **호스트 권한** — 방 만든 사람이 다른 사람을 강제로 큐에서 빼거나 채팅 차단

## Phase 5 — 차별화

여기서부터는 Turntable 클론을 넘어선다.

- [ ] **방 테마** — 색조 / 그라데이션 / 폰트 변형 (다크 / 사막 / 푸른시간 등)
- [ ] **BPM 시각화** — 곡 메타에서 BPM 추정 → 글로우 펄스를 BPM에 동기
- [ ] **DJ 레벨 시스템** — 라이브 시간 / 좋아요 비율 / 큐 들어간 횟수로 등급
- [ ] **아바타 커스터마이징** — DiceBear seed + 색상 토큰 선택
- [ ] **데일리 라운지** — 하루 한 번 자동 생성되는 시그니처 방
- [ ] **세션 녹음** — 방의 트랙리스트 + 좋아요 타임라인을 공유 가능한 페이지로

## Phase 6 — 플랫폼화

- [ ] **Spotify 연동** — DJ가 Spotify 트랙 ID로도 추가 가능 (Web Playback SDK는 프리미엄만)
- [ ] **모바일 앱** — Expo + 같은 Supabase 백엔드
- [ ] **유료 방** — Stripe + Supabase Functions, "비공개 라운지 플러스"
- [ ] **API 공개** — 외부에서 방 임베드 가능

---

## 추적 규칙

- 새 항목은 위에서 우선순위 맞춰서 끼워넣는다.
- 완료 항목은 지우지 말고 `[x]` 로 둔다 — 후행 컨텍스트로 활용.
- 큰 작업은 `docs/superpowers/specs/` 아래 별도 디자인 doc으로 빠진다 (브레인스토밍 → 스펙 → 플랜 → 실행).
- 작은 작업은 `CHANGELOG.md` 한 줄로 마무리.
