# Amply — Changelog

> 한 줄로 끝나는 변경은 여기로. 큰 변경은 `docs/ROADMAP.md` 또는 `docs/superpowers/specs/` 로.

## 2026-05-05

- `chore` Cloudflare Pages 어댑터 + edge runtime (`76ffc77`)
  - `@cloudflare/next-on-pages@1` + `vercel` devDep 설치
  - Next.js 15.5.15 → 15.5.2로 핀 (어댑터 peer-dep 상한)
  - `package.json`에 `pages:build` 스크립트 추가
  - 4개 SSR 라우트에 `export const runtime = 'edge'` 선언:
    `/`, `/rooms`, `/rooms/[roomId]`, `/api/auth/callback`
  - 로컬 `pages:build` 통과 (Edge Functions 4 + Prerendered 6)
- `chore` 앱 아이콘 추가 (`2092ca0`)
  - `src/app/icon.svg` — Next.js App Router icon convention
  - favicon.ico 404 제거
- `feat` Cloudflare Pages 운영 배포 완료
  - https://project-amply.pages.dev
  - `nodejs_compat` flag (Production + Preview)
  - Supabase Auth Redirect URL 등록 (`/api/auth/callback`)
- `chore` Supabase CLI 마이그레이션 워크플로 도입
  - `supabase init` + `supabase link --project-ref hwnnlchynwjilubjvbhq`
  - `supabase/schema.sql`을 baseline 마이그레이션으로 변환:
    `supabase/migrations/20260504000000_initial_schema.sql`
  - `supabase/README.md` — 마이그레이션 워크플로 가이드
- `docs` 배포/마이그레이션 결정 기록
  - `docs/DECISIONS.md` D-007 (Cloudflare Pages 채택), D-008 (Supabase CLI)
  - `docs/ROADMAP.md` Phase 2 완료로 갱신
  - `docs/SETUP.md` Cloudflare Pages 배포 섹션 추가, `/api/auth/callback`
    경로 명시

## 2026-05-04

- `init` Clubtable 이름으로 MVP 풀스택 스캐폴드 (`fcf7887`)
  - Next.js 15 App Router · Tailwind · shadcn-style UI · Geist · Zustand
  - Supabase 스키마: profiles / rooms / room_members / tracks / dj_queue / room_messages / track_reactions
  - RPC: join/leave_dj_queue · start_track · advance_queue · skip_track · react_to_track · current_dj
  - RLS 전체 활성, 쓰기는 SECURITY DEFINER RPC만 허용
  - Realtime publication: rooms / tracks / dj_queue / room_messages / track_reactions
  - 페이지: 랜딩 / 공개방 목록 / 방 만들기 / 룸 / 게스트·이메일 로그인 / 콜백 라우트
  - 디자인 토큰: 클럽 다크 (cyan #22d3ee × magenta #ec4899) + Doppelrand + ease-smooth
- `chore` 서비스명 Clubtable → Amply (`ba808e4`)
  - 사용자 카피, 메타데이터, 스키마 헤더, package 매니페스트
  - 브랜드 마크 CT → AM
- `docs` 작업/플래닝 마크다운 추가
  - `docs/PRODUCT.md` — 제품 정의, 핵심 원칙, MVP 범위
  - `docs/ARCHITECTURE.md` — 시스템·데이터 모델·RPC 카탈로그·Realtime 매핑
  - `docs/DESIGN.md` — 무드, 토큰, 컴포넌트 패턴, 모션, 안티패턴
  - `docs/ROADMAP.md` — Phase 1~6 단계별 우선순위
  - `docs/SETUP.md` — 로컬 실행 수동 절차
  - `docs/DECISIONS.md` — 주요 결정 기록 (ADR 라이트)
  - `docs/CHANGELOG.md` — 본 파일

## Format

```
## YYYY-MM-DD

- `type` 한 줄 요약 (커밋 해시)
  - 세부 노트 (optional)
```

`type`:
- `init` — 신규 영역 추가
- `feat` — 신규 기능
- `fix` — 버그 수정
- `chore` — 메타/리네이밍/의존성
- `docs` — 문서만
- `perf` — 성능
- `refactor` — 동작 변화 없는 구조 변경
