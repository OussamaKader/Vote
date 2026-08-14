# VoteCampus

Plateforme professionnelle de vote en ligne pour étudiants et utilisateurs.

## 1. Présentation

VoteCampus permet de gérer des élections, des listes et des votes sécurisés via Supabase. La solution est construite avec Next.js App Router, TypeScript et Tailwind CSS.

## 2. Technologies utilisées

- Next.js 16
- App Router
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Lucide React
- Zod

## 3. Installation

```bash
npm install
```

## 4. Configuration Supabase

1. Créez un projet Supabase.
2. Récupérez l’URL du projet et la clé anon.
3. Activez l’authentification email/password.
4. Créez la base de données PostgreSQL dans Supabase.

## 5. Configuration .env.local

Copiez le fichier d’exemple :

```bash
cp .env.local.example .env.local
```

Puis ajoutez vos valeurs :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> Ne jamais exposer la clé service_role dans le frontend.

## 6. Création des tables

Exécutez le SQL suivant dans l’éditeur SQL de Supabase :

```sql
create table public.profiles (
  id uuid references auth.users primary key,
  full_name text not null,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.elections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_date timestamptz not null,
  end_date timestamptz not null,
  status text not null default 'upcoming' check (status in ('upcoming', 'open', 'closed')),
  results_visible boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lists (
  id uuid primary key default gen_random_uuid(),
  election_id uuid references public.elections (id) on delete cascade not null,
  name text not null,
  description text,
  logo_url text,
  created_at timestamptz not null default now()
);

create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references public.lists (id) on delete cascade not null,
  name text not null,
  photo_url text,
  position text,
  description text,
  created_at timestamptz not null default now()
);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  election_id uuid references public.elections (id) on delete cascade not null,
  list_id uuid references public.lists (id) on delete cascade not null,
  user_id uuid references auth.users (id) not null,
  created_at timestamptz not null default now(),
  unique (user_id, election_id)
);
```

## 7. Configuration RLS

Activez le RLS sur chaque table puis ajoutez les politiques suivantes.

```sql
alter table public.profiles enable row level security;
alter table public.elections enable row level security;
alter table public.lists enable row level security;
alter table public.candidates enable row level security;
alter table public.votes enable row level security;
```

Exemple de politiques :

```sql
create policy "Public elections are visible" on public.elections
for select using (true);

create policy "Users can insert their own votes" on public.votes
for insert with check (auth.uid() = user_id);

create policy "Users cannot update votes" on public.votes
for update using (false);

create policy "Users cannot delete votes" on public.votes
for delete using (false);
```

Pour l’administration, ajoutez les politiques ou utilisez des règles côté app selon le rôle de l’utilisateur connecté.

## 8. Création du premier administrateur

Dans Supabase SQL, mettez à jour un profil :

```sql
update public.profiles
set role = 'admin'
where email = 'admin@campus.fr';
```

## 9. Lancement du projet

```bash
npm run dev
```

Ensuite ouvrez :

```text
http://localhost:3000
```

## 10. Sécurité

- Les routes protégées doivent utiliser un middleware.
- Les règles de vote doivent aussi être validées côté serveur.
- La clé service role ne doit jamais être utilisée dans le client.

## 11. Notes

Ce projet est un socle fonctionnel prêt à être connecté à Supabase et enrichi selon les règles métier de votre institution.
