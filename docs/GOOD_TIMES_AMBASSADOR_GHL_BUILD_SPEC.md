# GOOD TIMES — GHL Ambassador Build Spec

GOOD TIMES must have its own Ambassador pipeline. Do not share STUSH or FENYX pipelines.

## Location
Known GOOD TIMES GHL location ID from the current system record:
jbm4vUg0J1llNkK8q6Lt

## Pipeline stages
1. NEW APPLICATION
2. UNDER REVIEW
3. SHORTLISTED
4. FINAL REVIEW
5. APPROVED
6. AGREEMENT SENT
7. AGREEMENT SIGNED
8. ONBOARDING
9. CODE CREATED
10. ACTIVE
11. TOP PERFORMER
12. PROBATION
13. INACTIVE
14. OFFBOARDED
15. DECLINED

## Contact tags
GT_AMBASSADOR_APPLICANT
GT_AMBASSADOR_SHORTLIST
GT_AMBASSADOR_APPROVED
GT_AMBASSADOR_ACTIVE
GT_AMBASSADOR_CORE
GT_AMBASSADOR_CITY_CAPTAIN
GT_AMBASSADOR_PROBATION
GT_AMBASSADOR_OFFBOARDED

## Custom fields
GT Ambassador Application ID
GT Ambassador Score
GT Ambassador Tier
GT Referral Code
GT Referral Link
GT Instagram
GT TikTok
GT Primary City
GT Content Lane
GT Average Story Views
GT Average Reel Views
GT Monthly Commitment
GT Referral Source
GT Agreement Status
GT Agreement Signed Date
GT Onboarding Complete Date
GT First Activation Date
GT Last Campaign Date
GT Qualified Actions
GT Payout Status

## Workflow — application submitted
Trigger: GOOD TIMES Ambassador form submitted
Actions:
1. Create/update contact
2. Apply GT_AMBASSADOR_APPLICANT
3. Create opportunity in GOOD TIMES Ambassador pipeline → NEW APPLICATION
4. Send immediate application confirmation email
5. Send internal notification
6. Create review task
7. Write GHL contact/opportunity identifiers back to Supabase

## Workflow — approved
Trigger: opportunity moves to APPROVED
1. Apply approved tag
2. Send approval email
3. Send agreement link
4. Wait 48 hours
5. If unsigned → reminder
6. Wait to day 5
7. If unsigned → reminder
8. Day 10 unsigned → ONBOARDING INCOMPLETE / review

## Workflow — agreement signed
1. Update Agreement Status
2. Move to AGREEMENT SIGNED
3. Send onboarding link
4. Create onboarding task

## Workflow — onboarding complete
1. Move to ONBOARDING
2. Generate/assign referral code
3. Store code in Supabase
4. Send code + referral link
5. Assign first campaign
6. Move to ACTIVE

## Workflow — monthly review
Every 30 days:
- Pull referral metrics
- Pull campaign completion
- Flag Green / Yellow / Red
- Promote / Maintain / Coach / Pause / Offboard

## Critical QA
Before inviting real ambassadors:
- Submit test application
- Confirm email received
- Confirm opportunity created
- Confirm correct stage and tags
- Approve test
- Confirm agreement email
- Complete onboarding
- Confirm referral code
- Trigger test referral event
- Confirm dashboard/attribution
- Confirm payout record path
