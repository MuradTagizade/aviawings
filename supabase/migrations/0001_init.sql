-- Aviawings initial schema
-- Run in the Supabase SQL editor (or `supabase db push`).

-- ——— Profiles ———
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select using (auth.uid () = id);
create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid () = id);
create policy "profiles: update own" on public.profiles
  for update using (auth.uid () = id);

-- Auto-create a profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ——— Favorites (destinations or routes) ———
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('destination', 'route')),
  ref text not null, -- destination slug or "IST-GYD"
  created_at timestamptz not null default now(),
  unique (user_id, kind, ref)
);

alter table public.favorites enable row level security;

create policy "favorites: read own" on public.favorites
  for select using (auth.uid () = user_id);
create policy "favorites: insert own" on public.favorites
  for insert with check (auth.uid () = user_id);
create policy "favorites: delete own" on public.favorites
  for delete using (auth.uid () = user_id);

-- ——— Price alerts ———
create table if not exists public.price_alerts (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  origin text not null,
  destination text not null,
  target_price numeric not null check (target_price > 0),
  currency text not null default 'USD',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.price_alerts enable row level security;

create policy "alerts: read own" on public.price_alerts
  for select using (auth.uid () = user_id);
create policy "alerts: insert own" on public.price_alerts
  for insert with check (auth.uid () = user_id);
create policy "alerts: update own" on public.price_alerts
  for update using (auth.uid () = user_id);
create policy "alerts: delete own" on public.price_alerts
  for delete using (auth.uid () = user_id);

-- ——— Bookings (demo records until live ticketing) ———
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  reference text not null,
  origin text not null,
  destination text not null,
  depart_date date not null,
  return_date date,
  passengers jsonb not null default '[]',
  total numeric not null,
  currency text not null default 'USD',
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

create policy "bookings: read own" on public.bookings
  for select using (auth.uid () = user_id);
create policy "bookings: insert own" on public.bookings
  for insert with check (auth.uid () = user_id);
