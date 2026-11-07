-- ============================================================
--  Timeout Restaurant — Supabase schema
--  Replaces the Firebase Realtime Database used by
--  index.html / ex.html / admin.html / orders.html
--
--  Run once against the project (SQL editor or `supabase db push`).
--  Idempotent: safe to re-run.
-- ============================================================

create extension if not exists pgcrypto;

-- ── Admin identity ──────────────────────────────────────────
-- The admin panel signs in with Supabase Auth (email + password).
-- This one e-mail is the only account allowed to write.
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'admin@timeout.com.ng';
$$;

-- ── Prices  (was: Firebase menu_prices) ─────────────────────
create table if not exists public.menu_prices (
  item_id     bigint primary key,
  price       integer not null check (price >= 0),
  updated_at  timestamptz not null default now()
);

-- ── Availability  (was: Firebase menu_availability) ─────────
create table if not exists public.menu_availability (
  item_id     bigint primary key,
  disabled    boolean not null default true,
  updated_at  timestamptz not null default now()
);

-- ── Site state  (was: Firebase site_state) ──────────────────
create table if not exists public.site_state (
  id          integer primary key default 1 check (id = 1),
  paused      boolean not null default false,
  message     text    not null default '',
  updated_at  timestamptz not null default now()
);

insert into public.site_state (id, paused, message)
values (1, false, '')
on conflict (id) do nothing;

-- ── Orders  (was: Firebase orders/<push-id>) ────────────────
create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  reference   text unique,
  name        text,
  phone       text,
  email       text,
  address     text,
  items       text,
  total       integer,
  status      text not null default 'paid',
  day         text,
  created_at  timestamptz not null default now(),
  payload     jsonb
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- ── Row level security ──────────────────────────────────────
alter table public.menu_prices        enable row level security;
alter table public.menu_availability  enable row level security;
alter table public.site_state         enable row level security;
alter table public.orders            enable row level security;

-- Everyone (anon) may READ the public configuration tables.
drop policy if exists "public read prices"       on public.menu_prices;
drop policy if exists "public read availability" on public.menu_availability;
drop policy if exists "public read site state"   on public.site_state;

create policy "public read prices"       on public.menu_prices       for select using (true);
create policy "public read availability" on public.menu_availability for select using (true);
create policy "public read site state"   on public.site_state        for select using (true);

-- Only the signed-in admin may WRITE them.
drop policy if exists "admin write prices"       on public.menu_prices;
drop policy if exists "admin write availability" on public.menu_availability;
drop policy if exists "admin write site state"   on public.site_state;

create policy "admin write prices"       on public.menu_prices
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin write availability" on public.menu_availability
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin write site state"   on public.site_state
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Orders: the customer's browser may only INSERT after payment.
-- Nobody anonymous can read them; staff read via the admin session.
drop policy if exists "anon insert orders" on public.orders;
drop policy if exists "admin read orders"  on public.orders;
drop policy if exists "admin write orders" on public.orders;

create policy "anon insert orders" on public.orders for insert with check (true);
create policy "admin read orders"  on public.orders for select to authenticated using (public.is_admin());
create policy "admin write orders" on public.orders for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ── Table privileges ────────────────────────────────────────
grant select on public.menu_prices, public.menu_availability, public.site_state to anon, authenticated;
grant insert on public.orders to anon;
grant select, update on public.orders to authenticated;
grant all on public.menu_prices, public.menu_availability, public.site_state, public.orders to service_role;

-- ── Realtime (replaces Firebase live listeners) ─────────────
do $$
begin
  begin
    alter publication supabase_realtime add table public.menu_prices;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.menu_availability;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.site_state;
  exception when duplicate_object then null;
  end;
end $$;

-- ── Seed the two Jollof Rice + Chicken prices ───────────────
-- 87  = menu item, 999 = homepage deal bundle.
-- These match the current live values; edit them in the admin panel afterwards.
insert into public.menu_prices (item_id, price) values
  (87, 5600),
  (999, 5400)
on conflict (item_id) do nothing;
