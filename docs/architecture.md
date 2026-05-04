```mermaid
flowchart TD
    Browser[브라우저]
    Next[Next.js App Router on Vercel]
    API[Next.js API Routes]
    Google[Google OAuth]
    Supabase[(Supabase Postgres<br/>auth.users + tasks)]

    Browser -->|HTTP| Next
    Next -->|fetch /api/tasks| API
    API -->|Supabase Auth| Google
    API -->|supabase-js anon key| Supabase
```
