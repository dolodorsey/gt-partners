create table if not exists public.gt_partner_admins (
  email text primary key,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.gt_partner_admins (email, is_active)
values
  ('thedoctordorsey@gmail.com', true),
  ('dolodorsey@gmail.com', true)
on conflict (email) do update
set is_active = excluded.is_active,
    updated_at = now();

alter table public.gt_partner_admins enable row level security;
revoke all on table public.gt_partner_admins from public, anon, authenticated;
grant select, insert, update, delete on table public.gt_partner_admins to service_role;

create or replace function public.gt_partner_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.gt_partner_admins a
    where lower(a.email) = lower(coalesce(auth.jwt()->>'email', ''))
      and a.is_active = true
  );
$$;

revoke all on function public.gt_partner_is_admin() from public, anon;
grant execute on function public.gt_partner_is_admin() to authenticated, service_role;

create or replace function public.gt_partner_admin_status()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'authenticated', auth.uid() is not null,
    'email', auth.jwt()->>'email',
    'is_admin', public.gt_partner_is_admin()
  );
$$;

revoke all on function public.gt_partner_admin_status() from public, anon;
grant execute on function public.gt_partner_admin_status() to authenticated, service_role;

drop policy if exists anon_select_gt_partner_apps on public.gt_partner_applications;
drop policy if exists authenticated_all_gt_partner_apps on public.gt_partner_applications;
drop policy if exists anon_read_gt_ad_placements on public.gt_ad_placements;

revoke select, update, delete, truncate, references, trigger
  on table public.gt_partner_applications from anon;
revoke select, insert, update, delete, truncate, references, trigger
  on table public.gt_partner_applications from authenticated;
revoke all on table public.gt_ad_placements from anon, authenticated;
revoke all on table public.gt_ticket_partnerships from anon, authenticated;

drop policy if exists anon_insert_gt_partner_apps on public.gt_partner_applications;
create policy gt_public_partner_application_insert
  on public.gt_partner_applications
  for insert to anon, authenticated
  with check (
    coalesce(status, 'pending') = 'pending'
    and reviewed_by is null
    and reviewed_at is null
    and review_notes is null
    and approved_at is null
    and char_length(trim(business_name)) between 2 and 180
    and char_length(trim(contact_name)) between 2 and 160
    and contact_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    and char_length(trim(city)) between 2 and 100
  );

grant insert on table public.gt_partner_applications to anon, authenticated;

create policy gt_admin_select_partner_applications
  on public.gt_partner_applications
  for select to authenticated
  using (public.gt_partner_is_admin());
create policy gt_admin_update_partner_applications
  on public.gt_partner_applications
  for update to authenticated
  using (public.gt_partner_is_admin())
  with check (public.gt_partner_is_admin());
create policy gt_admin_delete_partner_applications
  on public.gt_partner_applications
  for delete to authenticated
  using (public.gt_partner_is_admin());

grant select, update, delete on table public.gt_partner_applications to authenticated;

create policy gt_admin_all_ad_placements
  on public.gt_ad_placements
  for all to authenticated
  using (public.gt_partner_is_admin())
  with check (public.gt_partner_is_admin());
grant select, insert, update, delete on table public.gt_ad_placements to authenticated;

create policy gt_admin_all_ticket_partnerships
  on public.gt_ticket_partnerships
  for all to authenticated
  using (public.gt_partner_is_admin())
  with check (public.gt_partner_is_admin());
grant select, insert, update, delete on table public.gt_ticket_partnerships to authenticated;

update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','application/pdf']
where id = 'gt-partner-assets';

drop policy if exists "Allow anonymous uploads to gt-partner-assets" on storage.objects;
create policy "Public application asset uploads only"
  on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'gt-partner-assets'
    and (storage.foldername(name))[1] = 'applications'
    and lower(storage.extension(name)) in ('jpg','jpeg','png','webp','pdf')
  );
