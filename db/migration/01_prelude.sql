-- 01_prelude.sql — AgriCapital
-- Extensions, helpers, rôles. À exécuter en premier.

create extension if not exists "pgcrypto" with schema public;

grant usage on schema public to anon, authenticated, service_role;

-- Horodatage automatique
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Enum des rôles
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'moderator', 'user');
  end if;
end
$$;

-- Table des rôles (jamais sur profiles !)
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

-- Vérification de rôle (security definer, évite la récursion RLS)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

create or replace function public.has_role(_user_id uuid, _role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role::text = _role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'::public.app_role
  );
$$;

grant execute on function public.has_role(uuid, public.app_role) to anon, authenticated, service_role;
grant execute on function public.has_role(uuid, text) to anon, authenticated, service_role;
grant execute on function public.is_admin() to anon, authenticated, service_role;

drop policy if exists "user_roles_admin_all" on public.user_roles;
create policy "user_roles_admin_all"
  on public.user_roles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
