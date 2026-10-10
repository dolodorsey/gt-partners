# GOOD TIMES — Official Venue Portal Integrated Into Existing Partner Domain
Date: 2026-10-09
## Existing domain and consumer isolation
- The pre-existing `gt-partners` Next.js project owns verified `partners.thegoodtimesworldwide.com`. Do not move or delete this domain.
- Existing partner application, ambassador, curator, affiliate, admin routes and current content are preserved.
- New route: `https://partners.thegoodtimesworldwide.com/venues`. It rewrites to static `public/venue-portal/index.html` with brand-isolated CSS/JS.
- Staff: `/venue-portal/admin.html` and outreach preparation: `/venue-portal/outreach.html`; all protected by Supabase authenticated role checks and RLS. No billing/sends.
- Separate Vercel `good-times-venue-partners` preview was used to prototype; it remains SSO-protected and is NOT the public production claim link.
## Backend
Canonical GOOD TIMES Gateway venue data `gt_venues` and `gt_portal_*` in project dzlmtvodpyhetvektfuo. No duplicate venue records.
## Safe dispatch
Never include `/venues` in live Muse outreach until this branch passes Next.js build, exact live custom-domain HTTP smoke, Supabase Auth redirect roundtrip, staff claim and upload QA, and DNC/suppression/recipient verification. Email sends remain Muse-owned.
## Provisional statuses
Code prepared; deployment/functional QA not asserted. 298 internal candidate venues; 146 currently resolve in public canonical venue RLS, 152 held for directory/readiness remediation. Research wave 1 = 100 public-lookup eligible venues. Zero provider-verified outbound recipients and zero send-ready records.
## Pricing and deck
Offer catalog internal only, no Stripe, no public pricing, no paid launch. Once fulfilled placements, auth, payments and report evidence are verified, create the planned compact 5–6-slide venue deck from actual approved price revision.
