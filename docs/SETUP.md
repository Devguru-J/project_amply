# Amply — Setup

로컬에서 실행하기까지의 정확한 절차.

## 1. Supabase 프로젝트 생성

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Name: `amply` (자유) · Region: `Northeast Asia (Seoul)` 추천 · Free tier
3. Database password 안전하게 보관
4. 프로비저닝 1~2분 대기

## 2. SQL 스키마 적용

1. 좌측 사이드바 → **SQL Editor** → **New query**
2. 로컬 `supabase/schema.sql` 통째로 복사 → 붙여넣기 → **Run**
3. 결과: "Success. No rows returned"
4. (확인) **Table Editor** 들어가면 7개 테이블 보임

## 3. Auth Providers

1. 좌측 → **Authentication** → **Providers**
2. **Anonymous Sign-Ins**: ON → Save (게스트 입장에 필수)
3. (선택) **Email**: ON → Save (매직링크 사용 시)

## 4. API 키 복사

1. 좌측 → **Project Settings** → **API**
2. 두 값 복사:
   - `Project URL` (`https://xxxxx.supabase.co`)
   - `anon public` key (`eyJhbGciOi...`)

## 5. 로컬 환경

```bash
cd /Users/tuesdaymorning/Devguru/project_amply
cp .env.local.example .env.local
```

`.env.local` 편집:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 6. 실행

```bash
npm run dev
```

브라우저 → [http://localhost:3000](http://localhost:3000)

## 동작 검증 시나리오

같은 PC에서 두 브라우저 (또는 일반 + 시크릿) 띄워서:

1. 양쪽에서 `/login` → 다른 닉네임으로 게스트 입장
2. 한 쪽에서 `/rooms/new` → 방 만들기 → 자동 진입
3. 다른 쪽에서 같은 룸 URL 직접 입력해 입장
4. 양쪽 모두 **DJ 참여** 클릭
5. 첫 번째로 줄 선 사람의 화면에서 **곡 추가** → YouTube URL 붙여넣기
6. 양쪽 모두 같은 트랙이 재생되는지 확인
7. 채팅에서 메시지 주고받기
8. 좋아요/싫어요 클릭 → 카운트가 양쪽에 즉시 반영되는지

## 흔한 문제

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| `/` 로딩되는데 공개방이 안 보임 | env 미설정 또는 schema 미적용 | `.env.local` 확인, SQL 다시 실행 |
| 게스트 입장 시 `not authenticated` | Anonymous Sign-Ins OFF | Supabase Auth Providers 다시 확인 |
| 매직링크 메일이 안 옴 | Email provider OFF 또는 SMTP 미설정 | Free tier는 기본 SMTP 사용. spam 폴더 확인 |
| YouTube 영상이 안 뜸 | 임베드 차단된 영상 | 다른 영상으로 시도 (예: `dQw4w9WgXcQ`) |
| 트랙이 끝나도 다음으로 안 넘어감 | 현재 DJ 클라이언트가 닫힘 | 누구든 **스킵** 클릭 (RPC가 advance) |
| 채팅 메시지가 다른 브라우저에 안 옴 | Realtime publication 누락 | `supabase/schema.sql` 마지막 do-block 다시 실행 |

## Vercel 배포 (선택)

1. GitHub `Devguru-J/project_amply` 를 Vercel에 import
2. Project Settings → Environment Variables 3개 등록 (위와 동일)
   - `NEXT_PUBLIC_SITE_URL` 만 배포 도메인으로 변경
3. Supabase → Authentication → URL Configuration:
   - Site URL: 배포 도메인
   - Redirect URLs: `https://your-domain.com/api/auth/callback`
4. Deploy
