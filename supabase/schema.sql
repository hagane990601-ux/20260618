create table if not exists public.menu_user_data (
  device_id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.menu_user_data enable row level security;

-- MVP policy for anonymous, non-sensitive preference data.
-- Replace this with Supabase Auth-based policies before storing personal data.
create policy "menu mvp anonymous data access"
on public.menu_user_data
for all
to anon
using (true)
with check (true);
