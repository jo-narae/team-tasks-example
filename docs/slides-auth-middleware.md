# 슬라이드 드래프트 — 어댑터 + 미들웨어 (페이지 95 구간)

> 그대로 슬라이드 덱에 옮길 수 있도록, 한 슬라이드 = 한 블록 단위로 정리.
> 한 줄 "왜" 는 모두 굵게, 본문 프롬프트는 그 아래 회색 박스(블록 인용) 톤으로 가정.

---

## (95 직전) 개념 슬라이드 — "어댑터 + 미들웨어, 왜 둘로 나뉘는가"

Supabase 세션은 쿠키에 들어 있고 1시간이면 만료된다. **매 요청마다 미들웨어에서 토큰을 갱신해야** 서버 컴포넌트·API 가 끊기지 않는다.

그런데 미들웨어는 `next/headers` 의 `cookies()` 가 아니라 `NextRequest` / `NextResponse` 양쪽 쿠키를 동시에 다뤄야 해서, 앞서 만든 `lib/supabase/server.ts` 어댑터로는 부족하다.

→ **미들웨어 전용 어댑터 1개** (request/response 쿠키 양쪽에 쓰는 Supabase 클라이언트) + **그 어댑터를 쓰는 미들웨어 1개** 로 분리한다.

```
┌── 기존 ──────────────────────┐    ┌── 추가 ─────────────────────┐
│ lib/supabase/server.ts       │    │ lib/supabase/middleware.ts  │  ← 어댑터
│  (서버 컴포넌트·라우트 핸들러) │    │ middleware.ts               │  ← 미들웨어
│ lib/supabase/client.ts       │    └─────────────────────────────┘
│  (브라우저)                  │
└──────────────────────────────┘
```

---

## 95-A 슬라이드 — 어댑터

**왜:** 미들웨어 안에서 `request.cookies` 와 `response.cookies` 양쪽에 동시에 쓸 수 있는 Supabase 클라이언트가 필요해서. (`server.ts` 의 `cookies()` 어댑터는 응답 쿠키를 못 심는다.)

> `src/lib/supabase/middleware.ts` 에 `updateSession(request: NextRequest)` 헬퍼를 만들어 주십시오. `@supabase/ssr` 의 `createServerClient` 를 쓰되, `cookies.getAll`/`setAll` 어댑터가 `request.cookies` 와 새로 만든 `NextResponse.next({ request })` 의 `cookies` 양쪽에 쿠키를 심도록 해주십시오. 마지막에 `await supabase.auth.getUser()` 를 호출해 세션을 갱신한 뒤 `response` 를 반환합니다.

---

## 95-B 슬라이드 — 미들웨어

**왜:** 위 어댑터를 모든 라우트에 깔아 매 요청마다 세션 쿠키를 갱신·연장하기 위해서. (부수적으로 비로그인 사용자의 보호 라우트 진입 차단도 같은 자리에서 처리.)

> 프로젝트 루트(`src/middleware.ts`)에 Next.js 미들웨어를 만들어 주십시오. 95-A 의 `updateSession` 을 호출해 세션을 갱신하고, 사용자가 없으면 `/login` 으로 redirect 하되 `/login` 과 `/auth/callback` 은 가드에서 제외하십시오. `config.matcher` 로 `_next` 정적 자산과 이미지·favicon 은 제외합니다.
