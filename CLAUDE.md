@AGENTS.md

## 기술 스택과 아키텍처

- 프론트 + API: Next.js App Router, Vercel 배포.
- 데이터: Supabase Postgres 단일 인스턴스. 클라이언트는 `supabase-js` (anon key).
- 인증: Supabase Auth + Google OAuth, 콜백은 `/api/auth/callback` 한 곳.
- DB는 **단일 테이블 `tasks` 만** 사용. 새 테이블/뷰/트리거/인덱스/RLS 추가는 사용자 승인 전까지 금지. 상세는 `docs/db.md` 참조.
- API base path 는 `/api`, **버전 prefix 금지**. OAuth 콜백을 제외한 모든 엔드포인트는 인증 필수. 상세는 `docs/api.md` 참조.
- 아키텍처 다이어그램과 컴포넌트 경계는 `docs/architecture.md` 참조 (4부품: Vercel·Next.js·Supabase·Google OAuth — 큐/캐시/WebSocket 등 추가 금지).
- MVP 헌장: 기능 5개 이하, 1일 구현, Phase 2 제안 금지. 기능 요건과 우선순위·비기능 수치는 `docs/requirements.md` 참조.
- 사용자 시나리오와 미결 결정 5건(담당자 변경 권한, 상태값 단계, 설명 편집 권한, "내 일감" 기본 필터, 완료 일감 표시)은 `docs/user-stories.md` 참조 — 결정 전엔 임의 가정 금지.

## 도메인 용어

- **일감 (task)**: `tasks` 테이블의 한 행. 앱 안에서 다루는 유일한 도메인 객체.
- **담당자 (assignee)**: 일감을 실제로 처리할 사람. `tasks.assignee_id` → `auth.users.id`. 기본값은 생성자 본인.
- **작성자 (created_by)**: 일감을 등록한 사람. `tasks.created_by` → `auth.users.id`. 등록 후 변경 없음.
- **상태 (status)**: `'todo' | 'done'` 두 값만 허용. `'doing'`/`'blocked'` 등 추가 상태는 헌장 위반.
- **내 일감**: 로그인 사용자 본인이 담당자(`assignee_id = auth.uid()`)인 일감. `GET /api/tasks?mine=true` 의 결과.
