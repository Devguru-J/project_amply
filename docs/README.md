# Amply — Docs Index

이 디렉토리에 작업 / 플래닝 / 의사결정 자료를 모은다. 코드는 진실, 이 문서는 문맥.

| 파일 | 무엇 | 언제 보는가 |
| --- | --- | --- |
| [`PRODUCT.md`](./PRODUCT.md) | 제품 정의, 핵심 원칙, MVP 범위 | "우리가 뭘 만들고 있더라" |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | 시스템 구성, 데이터 모델, RPC, Realtime 채널 | 코드 한 줄 만지기 전 |
| [`DESIGN.md`](./DESIGN.md) | 무드, 디자인 토큰, 컴포넌트 패턴, 모션, 안티패턴 | UI를 추가/수정할 때 |
| [`SETUP.md`](./SETUP.md) | 로컬 실행 정확한 절차, Vercel 배포 | 다시 셋업할 때 / 새 사람 합류 시 |
| [`ROADMAP.md`](./ROADMAP.md) | Phase 1~6 단계별 우선순위 | "다음 뭐 할까" |
| [`DECISIONS.md`](./DECISIONS.md) | 주요 결정과 근거 (ADR 라이트) | "왜 이렇게 만들었지?" |
| [`CHANGELOG.md`](./CHANGELOG.md) | 한 줄 변경 기록 | 시간 흐름 추적 |

## 문서 작성 규칙

- 한 사람이 5분 안에 훑을 수 있게 짧게.
- 코드로 알 수 있는 건 적지 않는다 (파일 경로, 함수명 같은 건 OK, 타입 시그니처는 NO).
- 결정은 **왜**를 적는다. **무엇**은 코드가 말한다.
- 큰 작업은 별도 디자인 doc으로 빠진다 → `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`.
- 변경하면 `CHANGELOG.md`에 한 줄.

## 작업 흐름

```
아이디어
  ↓
브레인스토밍 → docs/superpowers/specs/...-design.md (큰 작업일 때)
  ↓
플래닝     → docs/superpowers/plans/...-plan.md
  ↓
실행       → 코드 + CHANGELOG 한 줄
  ↓
회고       → DECISIONS.md (배운 게 있으면)
```
