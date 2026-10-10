// GOOD TIMES B2B venue portal static contract test.
// Prebuild regression protection for independent partner route; no network, secrets or sends.
import {readFileSync} from 'node:fs';
import {strict as assert} from 'node:assert';
const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const nextConfig=read('next.config.js');
assert.match(nextConfig,/source:\s*['"]\/venues['"]\s*,\s*destination:\s*['"]\/venue-portal\/index\.html['"]/);
const surfaces=[
 ['index.html','app.js'],
 ['admin.html','admin.js'],
 ['outreach.html','outreach.js']
];
for(const [markup,script] of surfaces){
 const html=read('public/venue-portal/'+markup);
 const js=read('public/venue-portal/'+script);
 // Browser-based script is standalone JavaScript, not a Node module.
 assert.doesNotThrow(()=>new Function(js),script+' failed JS parsing');
 const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
 const refs=new Set([...js.matchAll(/\$\('([^']+)'\)/g)].map(m=>m[1]));
 const missing=[...refs].filter(id=>!ids.has(id));
 assert.deepEqual(missing,[],script+' references missing HTML IDs');
 assert.match(html,new RegExp('src="/venue-portal/'+script.replace('.','\\.')+'"'));
 assert.match(html,/href="\/venue-portal\/partners\.css"/);
 assert.doesNotMatch(js,/sb_secret_[A-Za-z0-9_-]+/);
 assert.doesNotMatch(js,/service_role\s*=\s*['"]/);
}
assert.match(read('public/venue-portal/app.js'),/gt_portal_claims/);
assert.match(read('public/venue-portal/app.js'),/gt_portal_media/);
assert.match(read('public/venue-portal/admin.js'),/gt_portal_staff_profile/);
assert.match(read('public/venue-portal/outreach.js'),/gt_portal_outreach_page/);
assert.match(read('public/venue-portal/outreach.html'),/NO SEND PERMISSION/);
assert.match(read('public/venue-portal/index.html'),/Start your free venue application/);
assert.match(read('public/venue-portal/index.html'),/Submit a manual venue application/);
assert.match(read('public/venue-portal/index.html'),/Email signup · Configuration pending/);
assert.match(read('src/components/PartnerForm.jsx'),/gt_venue_outreach_manual_fallback/);
assert.match(read('src/components/PartnerForm.jsx'),/gt_venue_id: prefilledVenueId/);
assert.doesNotMatch(read('src/components/PartnerForm.jsx'),/Authorization:\\s*["']Bearer ["']\\s*\\+\\s*SUPABASE_ANON/);
assert.match(read('src/components/PartnerForm.jsx'),/apikey: SUPABASE_ANON, Accept: "application\\/json"/);
assert.match(read('public/venue-portal/app.js'),/updateManualApplicationLinks/);
assert.match(read('public/venue-portal/app.js'),/marketingApplicationUrl/);
assert.match(read('public/venue-portal/app.js'),/window\.location\.assign\(marketingApplicationUrl/);
assert.match(read('public/venue-portal/index.html'),/\/business\?intent=custom_bundle/);
assert.match(read('src/components/PartnerForm.jsx'),/requestedIntent/);
assert.match(read('src/components/PartnerForm.jsx'),/GOOD TIMES requested marketing channels/);
assert.match(read('src/components/PartnerForm.jsx'),/PROMOTION OPTIONS/);
assert.match(read('public/venue-portal/app.js'),/const redirect=location.origin\+'\/venues'/);
assert.match(read('src/components/PartnerForm.jsx'),/Prefer: "return=minimal"/);
assert.match(read('src/components/PartnerForm.jsx'),/gt_venue_outreach_manual_fallback/);
assert.match(read('supabase/migrations/20261009270000_gt_partner_application_notification_trigger_fix.sql'),/security definer/i);
assert.match(read('supabase/migrations/20261009271000_gt_partner_manual_intake_muse_handoff.sql'),/manual_application_submitted/);
console.log('GOOD TIMES venue portal static contract checks passed (3 pages, 3 scripts, route/CTA/RPC checks).');
