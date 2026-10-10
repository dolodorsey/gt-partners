-- GOOD TIMES manual application receipt -> passive Muse intake (no email send).
alter table public.gt_portal_muse_outbox drop constraint if exists gt_portal_muse_outbox_event_type_check;
alter table public.gt_portal_muse_outbox add constraint gt_portal_muse_outbox_event_type_check check (
 event_type in ('claim_submitted','claim_verified','claim_followup_needed','claim_rejected',
 'asset_submitted','asset_approved','growth_inquiry','growth_qualified','proposal_requested',
 'invite_draft_prepared','venue_research_wave_ready','manual_application_submitted')
);
create or replace function public.gt_portal_manual_application_enqueue()
returns trigger language plpgsql security definer set search_path=''
as $f$
begin
  insert into public.gt_portal_muse_outbox(event_key,brand_key,venue_id,event_type,queue_status,payload)
  values(
    'manual_application:'||new.id::text,
    'GOOD_TIMES',new.gt_venue_id,'manual_application_submitted','pending_muse_review',
    jsonb_build_object(
      'application_id',new.id,'business_name',new.business_name,'city',new.city,
      'source',new.source,'needs_staff_verification',true,'send_authorized',false
    )
  ) on conflict(event_key) do nothing;
  return new;
end;$f$;
revoke all on function public.gt_portal_manual_application_enqueue() from public,anon,authenticated;
grant execute on function public.gt_portal_manual_application_enqueue() to service_role;
drop trigger if exists gt_portal_manual_application_to_muse on public.gt_partner_applications;
create trigger gt_portal_manual_application_to_muse
after insert on public.gt_partner_applications
for each row execute function public.gt_portal_manual_application_enqueue();
