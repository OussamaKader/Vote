-- ============================================================
-- CORRECTION RLS - Eliminer la récursion infinie
-- ============================================================

-- 1. Créer une fonction SECURITY DEFINER pour vérifier le rôle admin
-- Cette fonction lit de auth.users (pas de boucle RLS)
create or replace function public.is_admin(user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  user_role text;
begin
  -- Lire directement depuis auth.users.raw_user_meta_data
  -- Cela évite de faire SELECT sur public.profiles (récursion)
  select coalesce(raw_user_meta_data ->> 'role', 'user')::text
  into user_role
  from auth.users
  where id = user_id;
  
  return user_role = 'admin';
end;
$$;

-- 2. Supprimer les anciennes policies de public.profiles
drop policy if exists "Public profiles are viewable by owner or admin" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Admin manages all profiles" on public.profiles;

-- 3. Créer les nouvelles policies SANS récursion
create policy "Public profiles are viewable by owner or admin"
on public.profiles
for select
using (
  auth.uid() = id
  or public.is_admin(auth.uid())
);

create policy "Users can insert their own profile"
on public.profiles
for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles
for update using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Admin manages all profiles"
on public.profiles
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- 4. Supprimer et recréer les policies des autres tables
-- (elles utilisent aussi EXISTS ... FROM profiles)

-- Elections
drop policy if exists "Admins manage elections" on public.elections;
create policy "Admins manage elections"
on public.elections
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Lists
drop policy if exists "Admins manage lists" on public.lists;
create policy "Admins manage lists"
on public.lists
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Candidates
drop policy if exists "Admins manage candidates" on public.candidates;
create policy "Admins manage candidates"
on public.candidates
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Votes
drop policy if exists "Users can insert a vote" on public.votes;
create policy "Users can insert a vote"
on public.votes
for insert with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_active = true
  )
);

drop policy if exists "Admins view all votes" on public.votes;
create policy "Admins view all votes"
on public.votes
for select using (public.is_admin(auth.uid()));

-- ============================================================
-- Vérification
-- ============================================================
-- Tester la fonction
SELECT public.is_admin(auth.uid());

-- Tester la requête sur profiles
SELECT id LIMIT 1;
