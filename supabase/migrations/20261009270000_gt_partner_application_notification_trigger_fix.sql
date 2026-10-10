-- GOOD TIMES manual venue application — repair internal-only notification trigger.
-- Public applicants may submit application INSERT but may not write KHG private operations notifications.
-- Narrow SECURITY DEFINER scope: trigger-only, fixed one-table insert, empty search path,
-- no dynamic SQL, no direct RPC execution for anonymous or authenticated users.
create or replace function public.notify_new_gt_application()
returns trigger
language plpgsql
security definer
set search_path = ''
as $f$
begin
  insert into public.khg_ops_notifications (
    notification_type, category, title, body, priority, brand_key, city_key, metadata
  ) values (
    'partner_application',
    'good_times',
    'NEW GT APPLICATION: ' || left(new.business_name,180),
    left(new.contact_name,160) || ' (' || left(new.contact_email,254) || ') submitted ' ||
    left(new.business_type,120) || ' in ' || left(new.city,100) ||
      case when new.wants_ticketing is true then ' | WANTS TICKETING' else '' end ||
      case when new.wants_ad_space is true then ' | WANTS AD SPACE' else '' end,
    case when new.wants_ticketing is true then 2 else 1 end,
    'good_times',
    lower(replace(new.city,' ','_')),
    jsonb_build_object(
      'application_id',new.id,
      'gt_venue_id',new.gt_venue_id,
      'business_name',new.business_name,
      'business_type',new.business_type,
      'city',new.city,
      'wants_ticketing',new.wants_ticketing,
      'wants_ad_space',new.wants_ad_space,
      'source',new.source
    )
  );
  return new;
end;
$f$;
revoke all on function public.notify_new_gt_application() from public,anon,authenticated;
grant execute on function public.notify_new_gt_application() to service_role;
