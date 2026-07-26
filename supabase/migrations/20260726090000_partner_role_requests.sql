create table if not exists public.gt_partner_role_requests (
  id uuid primary key default gen_random_uuid(),
  role_type text not null check (role_type in ('curator','affiliate')),
  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  email text not null check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  phone text not null check (char_length(regexp_replace(phone, '[^0-9]', '', 'g')) between 10 and 15),
  city text not null check (char_length(trim(city)) between 2 and 100),
  instagram_handle text,
  website text,
  audience_size text,
  experience text,
  details jsonb not null default '{}'::jsonb,
  consent boolean not null default false,
  status text not null default 'new' check (status in ('new','reviewing','contacted','approved','declined','closed')),
  source text not null default 'good-times-partner-role-form',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gt_partner_role_requests enable row level security;
revoke all on table public.gt_partner_role_requests from anon, authenticated;
grant insert on table public.gt_partner_role_requests to anon, authenticated;
grant select, insert, update, delete on table public.gt_partner_role_requests to service_role;

create policy gt_public_partner_role_insert
  on public.gt_partner_role_requests
  for insert to anon, authenticated
  with check (status='new' and source='good-times-partner-role-form');

create policy gt_admin_select_partner_roles
  on public.gt_partner_role_requests
  for select to authenticated
  using (public.gt_partner_is_admin());
create policy gt_admin_update_partner_roles
  on public.gt_partner_role_requests
  for update to authenticated
  using (public.gt_partner_is_admin())
  with check (public.gt_partner_is_admin());
create policy gt_admin_delete_partner_roles
  on public.gt_partner_role_requests
  for delete to authenticated
  using (public.gt_partner_is_admin());
grant select, update, delete on table public.gt_partner_role_requests to authenticated;

create index if not exists gt_partner_role_type_created_idx
  on public.gt_partner_role_requests (role_type, created_at desc);

create or replace function public.notify_gt_partner_role_request()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  v_organization_id uuid;
begin
  select id into v_organization_id
  from public.organizations
  where organization_key='khg' and status='active'
  limit 1;

  if v_organization_id is not null then
    insert into public.khg_notifications (
      organization_id, notification_type, title, body, entity_table,
      entity_id, brand_key, channel, status, metadata
    ) values (
      v_organization_id,
      'good_times_partner_role_request',
      'Good Times Partners: new ' || new.role_type || ' application',
      new.full_name || ' · ' || new.email || ' · ' || new.city,
      'gt_partner_role_requests',
      new.id::text,
      'good-times',
      'in_app',
      'unread',
      jsonb_build_object('role_type',new.role_type,'email',new.email,'phone',new.phone,'source',new.source)
    );
  end if;

  return new;
end;
$$;

revoke all on function public.notify_gt_partner_role_request() from public, anon, authenticated;
grant execute on function public.notify_gt_partner_role_request() to postgres, service_role;

drop trigger if exists trg_notify_gt_partner_role_request on public.gt_partner_role_requests;
create trigger trg_notify_gt_partner_role_request
  after insert on public.gt_partner_role_requests
  for each row execute function public.notify_gt_partner_role_request();
