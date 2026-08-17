-- Créer / vérifier le bucket public "logos"
insert into storage.buckets (id, name, public, file_size_limit)
values ('logos', 'logos', true, 5242880)
on conflict (id) do update
set public = true,
    file_size_limit = 5242880;

-- Autoriser la lecture publique des images du bucket logos
create policy "logos public read"
on storage.objects
for select
using (bucket_id = 'logos');

-- Autoriser les admins à téléverser des logos
create policy "admins upload logos"
on storage.objects
for insert
with check (
  bucket_id = 'logos'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- Autoriser les admins à modifier les logos
create policy "admins update logos"
on storage.objects
for update
using (
  bucket_id = 'logos'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  bucket_id = 'logos'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- Autoriser les admins à supprimer des logos
create policy "admins delete logos"
on storage.objects
for delete
using (
  bucket_id = 'logos'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);
