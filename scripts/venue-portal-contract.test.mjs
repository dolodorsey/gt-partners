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
assert.match(read('public/venue-portal/index.html'),/Claim your free venue profile/);
console.log('GOOD TIMES venue portal static contract checks passed (3 pages, 3 scripts, route/CTA/RPC checks).');
