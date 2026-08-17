create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  whatsapp_number text not null unique,
  password_hash text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.elections (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  start_date timestamptz not null,
  end_date timestamptz not null,
  status text not null default 'upcoming' check (status in ('upcoming', 'active', 'finished')),
  results_visible boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_dates check (end_date > start_date)
);

create table if not exists public.lists (
  id bigint generated always as identity primary key,
  election_id bigint not null references public.elections (id) on delete cascade,
  name text not null,
  description text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.candidates (
  id bigint generated always as identity primary key,
  list_id bigint not null references public.lists (id) on delete cascade,
  name text not null,
  photo_url text,
  position text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.votes (
  id bigint generated always as identity primary key,
  election_id bigint not null references public.elections (id) on delete cascade,
  list_id bigint not null references public.lists (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint unique_vote_per_user_per_election unique (user_id, election_id)
);

create index if not exists idx_profiles_whatsapp_number on public.profiles (whatsapp_number);
create index if not exists idx_profiles_role on public.profiles (role);
create index if not exists idx_elections_dates on public.elections (start_date, end_date);
create index if not exists idx_lists_election_id on public.lists (election_id);
create index if not exists idx_candidates_list_id on public.candidates (list_id);
create index if not exists idx_votes_election_id on public.votes (election_id);
create index if not exists idx_votes_user_id on public.votes (user_id);

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_profiles
before update on public.profiles
for each row execute function public.update_updated_at();

create trigger set_updated_at_elections
before update on public.elections
for each row execute function public.update_updated_at();

create trigger set_updated_at_lists
before update on public.lists
for each row execute function public.update_updated_at();

create trigger set_updated_at_candidates
before update on public.candidates
for each row execute function public.update_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    whatsapp_number,
    role,
    is_active
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'whatsapp_number', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'user')::text,
    true
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

alter table public.profiles enable row level security;
alter table public.elections enable row level security;
alter table public.lists enable row level security;
alter table public.candidates enable row level security;
alter table public.votes enable row level security;

create policy "Public profiles are viewable by owner or admin"
on public.profiles
for select
using (
  auth.uid() = id
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
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
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
) with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "Public elections are visible"
on public.elections
for select using (true);

create policy "Admins manage elections"
on public.elections
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
) with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "Public lists are visible"
on public.lists
for select using (true);

create policy "Admins manage lists"
on public.lists
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
) with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "Public candidates are visible"
on public.candidates
for select using (true);

create policy "Admins manage candidates"
on public.candidates
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
) with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "Users can insert a vote"
on public.votes
for insert with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_active = true
  )
);

create policy "Users can view their own votes"
on public.votes
for select using (auth.uid() = user_id);

create policy "Users cannot update or delete votes"
on public.votes
for update using (false)
with check (false);

create policy "Admins view all votes"
on public.votes
for select using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create or replace function public.ensure_whatsapp_unique()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1 from public.profiles p
    where p.whatsapp_number = new.whatsapp_number
      and p.id <> new.id
  ) then
    raise exception 'Ce numéro WhatsApp est déjà utilisé.';
  end if;

  return new;
end;
$$;

create trigger validate_whatsapp_uniqueness
before insert or update on public.profiles
for each row execute function public.ensure_whatsapp_unique();
