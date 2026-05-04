# Amply — Changelog

> 한 줄로 끝나는 변경은 여기로. 큰 변경은 `docs/ROADMAP.md` 또는 `docs/superpowers/specs/` 로.

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
