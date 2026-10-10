# GOOD TIMES — Venue Invitation / Muse Handoff

**Version:** 2026-10-09 | **Division:** GOOD TIMES Atlanta only
**No external sends authorized or executed by this handoff.** Muse owns actual approved delivery with provider receipt. Other brands/senders remain completely separate.

## The official conversion destination

Canonical intended path: `https://partners.thegoodtimesworldwide.com/venues?venue={gt_venues.id}`.

This is **not yet authorized for outbound sends**: the `/venues` code is on draft PR #4 (gt-partners) and preview, not merged/published on the canonical domain. Real email Auth redirect and full claim/asset/staff approval QA also remain outstanding. No preview/SSO-protected Vercel link belongs in outbound emails. Never invent or substitute domain paths.

The legacy partner site at `partners.thegoodtimesworldwide.com/` and its existing application, ambassador, affiliate and admin workflows are preserved. The new official venue profile claim path is specific to `/venues`.

## Data and target scope

Backend source: MCP Gateway `dzlmtvodpyhetvektfuo`, `gt_portal_outreach_candidates`.
- 298 canonical Atlanta active+verified research candidates.
- Current published-directory RLS makes **146** readable/claim-selectable; 152 held until editorial/source readiness improves.
- Wave 1: 100 currently lookup eligible; Wave 2: 46 eligible plus 54 held; Wave 3: 98 held.
- Of 298 research candidates, 295 have an official website, 221 phone, 134 IG; **0 researched recipient email contacts**, **0 send-ready**. Source readiness is NOT validated business contact information.
- Access internal queue at `/venue-portal/outreach.html` using explicit verified GOOD TIMES staff authorization. It is a preparation/review desk, not a send console.

## Research (Dot can research, Muse organizes and vets)

For each Wave 1 record:
1. Pull exact `venue_id`, name and official website from Supabase; avoid fuzzy duplicate venue joining.
2. Find publicly supplied official decision-maker/business contact. Record name, role, exact email and a credible source URL. Do not infer an email from name/domain.
3. Confirm actual authority, correct brand account, outreach eligibility, reasonable relevance and any venue/owner suppression. Ignore data behind logins or private sources.
4. Pass independent DNC/suppression/consent or lawful-basis review. Do not treat a contact found on the web as consent to bulk promotional sends.
5. Draft individualized factual copy: venue-specific opening, verifiable benefit, truthful free profile promise, one CTA, no false crowd size or reach. Do not create hundreds of same-body name swaps or fake endorsements.
6. Record verified data through staff desk. `contact_qualified` = source-verified business recipient; `copy_approved` = internally reviewed draft. Neither state authorizes sending.

## Muse execution gates

A record is send-ready ONLY after:
- publicly working `/venues?venue=<canonical UUID>` link, accessible without Vercel team SSO;
- verified email OTP/magic-link (or existing-password) auth roundtrip returning to the same venue;
- claim submission + staff authority review + private asset upload demonstrated in authenticated E2E;
- current public eligibility, non-expired legal authorization, contact verification and sender authentication;
- per-recipient suppression + DNC checks and personalized campaign review;
- the venue record includes approved copy **containing the official claim link** and an explicit send authorization;
- Muse executes through approved GOOD TIMES sender, then writes actual provider message ID, sent timestamp, and receipt; no “queued = sent” claims.

Do not send first-touch invitations to 152 currently non-resolvable listings. Do not substitute `good-times-venue-partners-*.vercel.app` or another project's staging URL.

## Default email direction (draft only; personalize and verify)

Subject: `[VENUE] × GOOD TIMES — Official Atlanta Venue Profile`

Body direction:
"Hi [verified contact], we're inviting [venue] to claim and complete its free official GOOD TIMES venue profile in Atlanta. Authorized venue operators can review their existing listing, submit the right photos, menus and programming, and explore optional app advertising, email, social and creator opportunities. Your official claim starts here: [VERIFIED PER-VENUE URL]. We review venue authority and submitted changes before publishing. Is [verified contact] the best person to coordinate this for [venue]? — GOOD TIMES Venue Partnerships."

Optional follow-up may reference the exact venue and authentic value, but no invented deliverables, false placement guarantees, fake audience size, or unapproved prices. Unsubscribes and complaints immediately suppress the recipient. Opt-out handling follows actual sender/provider and applicable rules.

## CRM pipeline / proof

Research → Qualified Venue Contact → Copy Reviewed → Claim Link QA → Ready for Muse → **Provider-Sent with Receipt** → Claim Started → Authority Verified → Profile Approved/Published → Growth Interest → Proposal → Paid (only after Stripe receipt) → Fulfilled (only after channel proof) → Renewal.

Queue event `gt_portal_muse_outbox` with type `invite_draft_prepared` means only "copy prepared". It is not an external send or CRM synchronization receipt.

GHL plugin returned 401 authorization-scope error during this build. Until repaired, do not assert contact/pipeline sync; Supabase remains authoritative. Do not create new unverified provider contacts.

## Release checklist

- [x] Existing custom partner domain ownership verified in Vercel.
- [x] New `/venues` route integrated in **draft** GitHub branch; legacy partner routes preserved.
- [x] Vercel protected branch preview READY, Next build and automated static contract checks succeeded.
- [x] Supabase applicant, staff and Muse queue tables live with RLS and audit gates.
- [x] 298 research candidates ranked into evidence-backed 100/100/98 waves, with 146 current public lookup eligible.
- [ ] Real team and 2 venue identities through entire browser journey; multi-device screenshots and >=98/100 review.
- [ ] Authorized Auth Site URL / redirects confirmed for canonical domain and `/venues`.
- [ ] Change request passed protected preview, reviewed release and published to canonical custom domain.
- [ ] Actual working 100/100 invite links and real verified contact/suppression statuses.
- [ ] GHL correct scope/connection and provider receipt path validated.
- [ ] Rate-card surface capacity and Stripe merchant permissions confirmed for paid transactions.
- [ ] Only then approved Muse send and eventual 5–6-slide deck with verified prices and screenshots.

**Execution state:** RESEARCH PREPARED / PORTAL CODE QA PASSED, **NOT SEND-READY OR PRODUCTION VERIFIED**.
