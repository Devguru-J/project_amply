# Amply — Design

## 무드

**Underground Club / Boiler Room의 디지털 버전.**
힙하고, 살아있고, 음악이 들리는 듯한 화면.

> 만든 사람의 기준선: "Linear 같은데 클럽에 있는 느낌."

## 비주얼 시그니처

| 요소 | 결정 |
| --- | --- |
| 베이스 | 거의 검정에 가까운 차콜 `hsl(240 8% 4%)` + 미세한 SVG 노이즈 그레인 |
| 액센트 | 사이안 `#22d3ee` × 마젠타 `#ec4899` 그라데이션 |
| 디스플레이 폰트 | Geist Sans (variable) |
| 모노 폰트 | Geist Mono — DJ 이름·BPM·트랙 ID·라벨 |
| 라운딩 | `rounded-[2rem]` 외부 / `rounded-[calc(2rem-6px)]` 내부 (Doppelrand) |
| 모션 이즈 | `cubic-bezier(0.32, 0.72, 0, 1)` (= `ease-smooth`) |

## 디자인 토큰 (`globals.css`)

```css
--background: 240 8% 4%;
--foreground: 0 0% 96%;
--primary:    188 95% 53%;   /* cyan glow */
--secondary:  330 80% 60%;   /* magenta glow */
--muted:      240 6% 12%;
--border:     240 6% 14%;
--radius:     1.25rem;
```

## 레이아웃 아키타입 적용

- **Asymmetrical Bento** — 랜딩 Features 섹션에서 `col-span-7 row-span-2` + 우측 스택
- **Z-axis Cascade (옅게)** — 공개방 카드에서 짝수 인덱스만 `translateY(8px)` (Hero 티커는 `-rotate-[0.6deg]`)
- **Fluid Island Nav** — 상단에서 떠 있는 글래스 필 + 모바일은 풀스크린 백드롭블러 메뉴

## 컴포넌트 패턴

### Doppelrand (이중 베젤)

거의 모든 카드는 외부 셸 + 내부 코어 두 겹.

```tsx
<div className="bezel-shell">          {/* 외부: 6px 패딩, 흰색 4% 배경, 흰색 10% ring */}
  <div className="bezel-core p-6">     {/* 내부: card/80 배경, 5% ring */}
    ...
  </div>
</div>
```

### Island Arrow (CTA-in-CTA)

CTA 버튼의 화살표는 항상 자체 원형 컨테이너 안에 들어간다.

```tsx
<Link className="group ... pl-6 pr-1.5">
  공개방 둘러보기
  <span className="island-arrow">     {/* 8x8 원형, hover시 살짝 이동 + scale */}
    <ArrowIcon />
  </span>
</Link>
```

### Eyebrow

H1/H2 위의 마이크로 라벨.

```tsx
<div className="eyebrow">
  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
  <span>NOW LIVE · 사람들이 음악을 틀고 있다</span>
</div>
```

### Glow Variants

- `glow-cyan` — primary CTA, 현재 트랙 카드, 내가 누른 좋아요
- `glow-magenta` — secondary CTA, 내가 누른 싫어요

## 모션 카탈로그

| 애니메이션 | 용도 |
| --- | --- |
| `animate-fade-up` | 페이지 진입 시 요소 등장 (블러+셰이드) |
| `animate-pulse-glow` | "ON AIR" 도트, 현재 차례 슬롯 |
| `animate-orb-drift` | 배경 aurora orb (20s 무한) |
| `animate-shimmer` | 그라데이션 텍스트 마퀴 |

## 라우트별 레이아웃

### `/` 랜딩

```
[Floating Glass Nav]
[Hero · 풀화면 + aurora orbs + 디스플레이 타이포]
   ├ Hero ticker (Z-axis -0.6deg)
[Features · Asymmetric Bento (7+5+5+12)]
[Public Rooms · 카드 그리드 (6개)]
[Footer · hairline + 메타]
```

### `/rooms/[roomId]` 룸

```
[Sticky Glass Header — 룸이름 + mute + back]

[Grid 12]
 ├─ Left  (col-span-3)
 │   ├─ About 카드 (룸 설명 + visibility)
 │   └─ Participants 패널
 ├─ Center (col-span-6)
 │   ├─ YouTubePlayer (16:9, glow-cyan)
 │   ├─ NowPlaying (메타 + 경과시간)
 │   └─ ReactionBar
 └─ Right (col-span-3)
     └─ ChatPanel (640px 고정)

[Bottom (col-span-12)]
 └─ DJQueue (가로 슬롯)
```

모바일에서는 모두 `col-span-1` + 세로 스택. 순서: Center → Left → Chat → DJQueue.

## 마이크로 인터랙션 룰

- **버튼 hover**: `active:scale-[0.98]` + island-arrow가 우상향 1px 이동.
- **카드 hover**: `group-hover:-translate-y-1`
- **트랙 변경 시**: 새 트랙은 NowPlaying에서 글로우 펄스 + YouTube 컨테이너 `glow-cyan`.
- **DJ 차례 도착**: 본인 슬롯이 `animate-pulse-glow` + "곡 추가" 버튼도 펄스.

## 금지 사항 (Anti-pattern)

- `Inter`, `Roboto`, `Helvetica` 폰트 사용 금지.
- `shadow-md` 같은 일반 그림자 금지 (대신 `glow-cyan`/`glow-magenta` 또는 inset 1px 하이라이트).
- 1px solid gray border 금지 — `ring-1 ring-white/10` 사용.
- `linear` / `ease-in-out` transition 금지 — `ease-smooth` 사용.
- Edge-to-edge sticky navbar 금지 — Floating glass pill 사용.
- `Lucide` 두꺼운 아이콘 금지 — 손글씨 SVG (1.4~1.6 stroke).
- 절대 z-index 사용 금지 — `z-30` (header), `z-40` (nav), `z-50` (modal/overlay), `z-60` (grain) 정해진 레이어만.

## 반응형 가드

- 모든 fullscreen은 `min-h-[100dvh]` (iOS Safari 호환).
- `backdrop-blur`는 fixed/sticky 요소에만 (스크롤 컨텐츠에 깔지 말 것).
- 768px 이하에서 비대칭 레이아웃은 모두 단일 컬럼으로 폴백.

## 향후 개선 후보 (디자인)

- **방 테마** — `rooms.theme_id` 추가 → 룸별 그라데이션/색조
- **BPM 동기 모션** — 트랙 메타에 BPM 들어오면 글로우 펄스를 BPM에 맞춤
- **DJ 등급 비주얼** — DJ 슬롯 외곽 ring 색상으로 등급 표현
- **타임 마커** — Hero 티커처럼 타임바를 가로로 깔고 좋아요/스킵 이벤트 도트로 표시
