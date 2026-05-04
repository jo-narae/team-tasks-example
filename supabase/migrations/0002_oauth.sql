-- 0002_oauth.sql
-- Wire tasks to Supabase Auth and replace the temporary open RLS policy.

-- 1) Add auth columns referencing auth.users.
alter table public.tasks
  add column if not exists assignee_id uuid references auth.users(id) on delete set null;

alter table public.tasks
  add column if not exists created_by uuid references auth.users(id) on delete cascade;

-- 2) Drop rows that pre-date auth wiring, then enforce created_by.
delete from public.tasks where created_by is null;

alter table public.tasks
  alter column created_by set not null;

-- 3) Replace temporary open policy with real ones.
drop policy if exists temp_all_access on public.tasks;

create policy tasks_select on public.tasks
  for select
  using (auth.uid() = created_by or auth.uid() = assignee_id);

create policy tasks_insert on public.tasks
  for insert
  with check (auth.uid() = created_by);

create policy tasks_update on public.tasks
  for update
  using (auth.uid() = created_by or auth.uid() = assignee_id)
  with check (auth.uid() = created_by or auth.uid() = assignee_id);

create policy tasks_delete on public.tasks
  for delete
  using (auth.uid() = created_by);
