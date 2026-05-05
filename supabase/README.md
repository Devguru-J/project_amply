# Supabase

스키마는 `migrations/` 디렉토리가 정본(source of truth)이다.
Supabase CLI 마이그레이션 워크플로를 사용한다.

## 새 마이그레이션 만들기

```bash
supabase migration new add_room_themes
# → supabase/migrations/<timestamp>_add_room_themes.sql 생성됨
```

SQL 작성 후 운영 DB에 반영:

```bash
supabase db push
```

## 신규 환경에 처음 적용하기

이미 운영 DB에는 baseline migration(`20260504000000_initial_schema.sql`)이
SQL Editor를 통해 직접 적용된 상태다. CLI 입장에서는 "아직 안 적용된"
것으로 인식되므로, 한 번만 baseline을 "이미 적용됨"으로 마킹해야 한다:

```bash
supabase migration repair --status applied 20260504000000
```

이걸 안 하면 `supabase db push`가 baseline을 다시 실행하려고 해서
`create table if not exists` 멱등성으로 통과는 하지만 깔끔하지 않다.

## 처음부터 새 프로젝트에 셋업

빈 Supabase 프로젝트라면:

```bash
supabase link --project-ref <project-ref>
supabase db push   # baseline 부터 차례로 적용됨
```

## 로컬 Supabase로 개발 (선택)

```bash
supabase start     # 도커로 로컬 Supabase 띄움
supabase db reset  # 마이그레이션 전부 다시 적용
```

`.env.local`의 URL/anon-key를 로컬 출력값으로 바꿔서 쓰면 된다.
