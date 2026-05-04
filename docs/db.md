```sql
create table tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  assignee_id uuid not null references auth.users(id),
  created_by  uuid not null references auth.users(id),
  status      text not null check (status in ('todo', 'done')),
  created_at  timestamptz not null default now()
);
```
