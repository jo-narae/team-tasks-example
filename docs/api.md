# team-tasks API

| METHOD | PATH | 설명 | 인증 |
| --- | --- | --- | --- |
| GET | /api/auth/callback | Google OAuth 리다이렉트 콜백을 받아 Supabase 세션을 생성한다. | 불필요 |
| POST | /api/auth/signout | 현재 세션을 종료한다. | 필요 |
| GET | /api/tasks | 일감 목록을 조회한다. `?mine=true` 로 본인 담당분만 필터. | 필요 |
| POST | /api/tasks | 일감을 생성한다(제목 필수, 담당자 기본값은 본인). | 필요 |
| GET | /api/tasks/[id] | 단일 일감의 상세를 조회한다. | 필요 |
| PATCH | /api/tasks/[id] | 일감의 상태·담당자·설명을 부분 수정한다. | 필요 |
