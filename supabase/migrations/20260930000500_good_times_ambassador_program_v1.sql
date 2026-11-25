-- GOOD TIMES ambassador operating layer v1
-- Separate from curator/affiliate roles and separate from customer-facing Good Times auth.

alter table public.gt_partner_role_requests
  drop constraint if exists gt_partner_role_requests_role_type_check;

alter table public.gt_partner_role_requests
  add constraint gt_partner_role_requests_role_type_check
  check (role_type in ('curator','affiliate','ambassador'));

create table if not exists public.gt_ambassador_program_config (
  program_key text primary key,
  brand_key text not null default 'good-times',
  public_launch_city text not null default 'atlanta',
  application_route text not null default '/ambassador',
  support_email text,
  ghl_location_id text,
  stages jsonb not null default '[]'::jsonb,
  scoring_weights jsonb not null default '{}'::jsonb,
  program_rules jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.gt_ambassador_program_config (
  program_key, brand_key, public_launch_city, application_route, support_email, ghl_location_id,
  stages, scoring_weights, program_rules
) values (
  'good-times',
  'good-times',
  'atlanta',
  '/ambassador',
  'hello@thegoodtimesworldwide.com',
  'jbm4vUg0J1llNkK8q6Lt',
  '["new_application","under_review","shortlisted","final_review","approved","agreement_sent","agreement_signed","onboarding","code_created","active","top_performer","probation","inactive","offboarded"]'::jsonb,
  '{"brand_fit":25,"relationship_strength":20,"content_quality":15,"engagement_influence":15,"reliability":10,"geography":5,"professionalism":5,"referral_value":5}'::jsonb,
  '{"launch_market":"atlanta","primary_goal":"drive qualified app activity and local cultural discovery","official_only_after_approval":true,"require_tracking_code":true,"require_campaign_attribution":true}'::jsonb
)
on conflict (program_key) do update
set support_email = excluded.support_email,
    ghl_location_id = excluded.ghl_location_id,
    stages = excluded.stages,
    scoring_weights = excluded.scoring_weights,
    program_rules = excluded.program_rules,
    updated_at = now();

create table if not exists public.gt_ambassadors (
  id uuid primary key default gen_random_uuid(),
  application_id uuid unique references public.gt_partner_role_requests(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  instagram_handle text,
  tiktok_handle text,
  city text,
  relationship_tier text not null default 'unknown'
    check (relationship_tier in ('super_personal','warm','recent_active','external','unknown')),
  score smallint check (score between 0 and 100),
  tier text not null default 'ambassador'
    check (tier in ('affiliate','ambassador','core_ambassador','city_captain','brand_council')),
  stage text not null default 'approved'
    check (stage in ('approved','agreement_sent','agreement_signed','onboarding','code_created','active','top_performer','probation','inactive','offboarded')),
  assigned_manager text,
  ghl_location_id text,
  ghl_contact_id text,
  agreement_status text not null default 'not_sent'
    check (agreement_status in ('not_sent','sent','signed','declined','expired')),
  agreement_sent_at timestamptz,
  agreement_signed_at timestamptz,
  onboarding_completed_at timestamptz,
  first_activation_at timestamptz,
  joined_at timestamptz,
  last_activity_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists gt_ambassadors_email_unique
  on public.gt_ambassadors (lower(email));

create index if not exists gt_ambassadors_stage_idx
  on public.gt_ambassadors (stage, created_at desc);

create index if not exists gt_ambassadors_city_idx
  on public.gt_ambassadors (city, stage);

create table if not exists public.gt_ambassador_referral_codes (
  id uuid primary key default gen_random_uuid(),
  ambassador_id uuid not null references public.gt_ambassadors(id) on delete cascade,
  referral_code text not null,
  destination_path text not null default '/download',
  reward_model text not null default 'campaign_based'
    check (reward_model in ('none','campaign_based','qualified_action','flat_bonus','revenue_share')),
  reward_value numeric,
  status text not null default 'active'
    check (status in ('pending','active','paused','retired')),
  external_code_id text,
  starts_at timestamptz,
  ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists gt_ambassador_referral_code_unique
  on public.gt_ambassador_referral_codes (upper(referral_code));

create table if not exists public.gt_ambassador_referral_events (
  id uuid primary key default gen_random_uuid(),
  ambassador_id uuid not null references public.gt_ambassadors(id) on delete cascade,
  referral_code_id uuid references public.gt_ambassador_referral_codes(id) on delete set null,
  event_type text not null
    check (event_type in ('link_click','app_install','account_created','plan_created','reservation','ticket_click','transaction','venue_lead','content_post','event_checkin','other')),
  external_user_key text,
  external_event_key text,
  value numeric,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists gt_ambassador_referral_events_rollup_idx
  on public.gt_ambassador_referral_events (ambassador_id, event_type, occurred_at desc);

create table if not exists public.gt_ambassador_campaigns (
  id uuid primary key default gen_random_uuid(),
  campaign_key text not null unique,
  name text not null,
  description text,
  campaign_type text not null default 'growth'
    check (campaign_type in ('growth','content','event','venue','launch','community','sponsor','other')),
  launch_market text not null default 'atlanta',
  starts_at timestamptz,
  ends_at timestamptz,
  requirements jsonb not null default '{}'::jsonb,
  rewards jsonb not null default '{}'::jsonb,
  assets jsonb not null default '{}'::jsonb,
  status text not null default 'draft'
    check (status in ('draft','scheduled','active','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gt_ambassador_campaign_assignments (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.gt_ambassador_campaigns(id) on delete cascade,
  ambassador_id uuid not null references public.gt_ambassadors(id) on delete cascade,
  status text not null default 'assigned'
    check (status in ('assigned','accepted','in_progress','submitted','approved','missed','cancelled')),
  assigned_at timestamptz not null default now(),
  due_at timestamptz,
  submission_url text,
  review_notes text,
  performance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, ambassador_id)
);

create table if not exists public.gt_ambassador_payouts (
  id uuid primary key default gen_random_uuid(),
  ambassador_id uuid not null references public.gt_ambassadors(id) on delete cascade,
  campaign_id uuid references public.gt_ambassador_campaigns(id) on delete set null,
  amount numeric(12,2) not null default 0 check (amount >= 0),
  currency text not null default 'USD',
  reason text,
  period_start date,
  period_end date,
  status text not null default 'pending'
    check (status in ('pending','approved','processing','paid','held','void')),
  approved_by text,
  approved_at timestamptz,
  paid_at timestamptz,
  provider_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gt_ambassador_activity (
  id uuid primary key default gen_random_uuid(),
  ambassador_id uuid references public.gt_ambassadors(id) on delete cascade,
  application_id uuid references public.gt_partner_role_requests(id) on delete set null,
  activity_type text not null,
  channel text,
  actor text,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists gt_ambassador_activity_idx
  on public.gt_ambassador_activity (ambassador_id, occurred_at desc);

create or replace function public.gt_promote_ambassador_application(
  p_application_id uuid,
  p_manager text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.gt_partner_role_requests%rowtype;
  v_id uuid;
begin
  select * into r
  from public.gt_partner_role_requests
  where id = p_application_id
    and role_type = 'ambassador'
  for update;

  if not found then
    raise exception 'Ambassador application not found';
  end if;

  if r.status <> 'approved' then
    raise exception 'Application must be approved before promotion';
  end if;

  insert into public.gt_ambassadors (
    application_id, full_name, email, phone, instagram_handle, tiktok_handle, city,
    assigned_manager, ghl_location_id, metadata, joined_at
  ) values (
    r.id,
    r.full_name,
    lower(r.email),
    r.phone,
    r.instagram_handle,
    nullif(r.details->>'tiktok_handle',''),
    r.city,
    p_manager,
    'jbm4vUg0J1llNkK8q6Lt',
    jsonb_build_object(
      'audience_size', r.audience_size,
      'experience', r.experience,
      'application_details', r.details,
      'source', r.source
    ),
    now()
  )
  on conflict (application_id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        phone = excluded.phone,
        instagram_handle = excluded.instagram_handle,
        tiktok_handle = excluded.tiktok_handle,
        city = excluded.city,
        assigned_manager = coalesce(excluded.assigned_manager, public.gt_ambassadors.assigned_manager),
        metadata = excluded.metadata,
        updated_at = now()
  returning id into v_id;

  insert into public.gt_ambassador_activity (
    ambassador_id, application_id, activity_type, channel, actor, note
  ) values (
    v_id, r.id, 'application_promoted', 'internal', coalesce(p_manager,'system'), 'Approved application promoted to ambassador record'
  );

  return v_id;
end;
$$;

revoke all on function public.gt_promote_ambassador_application(uuid,text) from public, anon, authenticated;
grant execute on function public.gt_promote_ambassador_application(uuid,text) to service_role;

alter table public.gt_ambassador_program_config enable row level security;
alter table public.gt_ambassadors enable row level security;
alter table public.gt_ambassador_referral_codes enable row level security;
alter table public.gt_ambassador_referral_events enable row level security;
alter table public.gt_ambassador_campaigns enable row level security;
alter table public.gt_ambassador_campaign_assignments enable row level security;
alter table public.gt_ambassador_payouts enable row level security;
alter table public.gt_ambassador_activity enable row level security;

revoke all on public.gt_ambassador_program_config from anon, authenticated;
revoke all on public.gt_ambassadors from anon, authenticated;
revoke all on public.gt_ambassador_referral_codes from anon, authenticated;
revoke all on public.gt_ambassador_referral_events from anon, authenticated;
revoke all on public.gt_ambassador_campaigns from anon, authenticated;
revoke all on public.gt_ambassador_campaign_assignments from anon, authenticated;
revoke all on public.gt_ambassador_payouts from anon, authenticated;
revoke all on public.gt_ambassador_activity from anon, authenticated;

grant all on public.gt_ambassador_program_config to service_role;
grant all on public.gt_ambassadors to service_role;
grant all on public.gt_ambassador_referral_codes to service_role;
grant all on public.gt_ambassador_referral_events to service_role;
grant all on public.gt_ambassador_campaigns to service_role;
grant all on public.gt_ambassador_campaign_assignments to service_role;
grant all on public.gt_ambassador_payouts to service_role;
grant all on public.gt_ambassador_activity to service_role;

create policy gt_ambassador_admin_config
  on public.gt_ambassador_program_config
  for all to authenticated
  using (public.gt_partner_is_admin())
  with check (public.gt_partner_is_admin());

create policy gt_ambassador_admin_profiles
  on public.gt_ambassadors
  for all to authenticated
  using (public.gt_partner_is_admin())
  with check (public.gt_partner_is_admin());

create policy gt_ambassador_admin_codes
  on public.gt_ambassador_referral_codes
  for all to authenticated
  using (public.gt_partner_is_admin())
  with check (public.gt_partner_is_admin());

create policy gt_ambassador_admin_events
  on public.gt_ambassador_referral_events
  for all to authenticated
  using (public.gt_partner_is_admin())
  with check (public.gt_partner_is_admin());

create policy gt_ambassador_admin_campaigns
  on public.gt_ambassador_campaigns
  for all to authenticated
  using (public.gt_partner_is_admin())
  with check (public.gt_partner_is_admin());

create policy gt_ambassador_admin_assignments
  on public.gt_ambassador_campaign_assignments
  for all to authenticated
  using (public.gt_partner_is_admin())
  with check (public.gt_partner_is_admin());

create policy gt_ambassador_admin_payouts
  on public.gt_ambassador_payouts
  for all to authenticated
  using (public.gt_partner_is_admin())
  with check (public.gt_partner_is_admin());

create policy gt_ambassador_admin_activity
  on public.gt_ambassador_activity
  for all to authenticated
  using (public.gt_partner_is_admin())
  with check (public.gt_partner_is_admin());

grant select, insert, update, delete on public.gt_ambassador_program_config to authenticated;
grant select, insert, update, delete on public.gt_ambassadors to authenticated;
grant select, insert, update, delete on public.gt_ambassador_referral_codes to authenticated;
grant select, insert, update, delete on public.gt_ambassador_referral_events to authenticated;
grant select, insert, update, delete on public.gt_ambassador_campaigns to authenticated;
grant select, insert, update, delete on public.gt_ambassador_campaign_assignments to authenticated;
grant select, insert, update, delete on public.gt_ambassador_payouts to authenticated;
grant select, insert, update, delete on public.gt_ambassador_activity to authenticated;
