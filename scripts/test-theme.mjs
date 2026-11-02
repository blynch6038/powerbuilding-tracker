import fs from 'node:fs';
import assert from 'node:assert/strict';
const html=fs.readFileSync('dist/index.html','utf8');
const asset=html.match(/href="([^\"]+\.css)"/)[1];
const css=fs.readFileSync('dist'+asset,'utf8');
assert.ok(css.lastIndexOf('.top{')>css.indexOf('.warmups{'),'HUD overrides must follow legacy component CSS in the production bundle');
assert.ok(css.includes('--pb-background:#111213'),'Shared charcoal background token is included');
assert.ok(css.includes('--pb-accent:#ff781f'),'Shared orange accent token is included');
const benchRule=css.match(/\.bench-progression\{[^}]*\}/)?.[0];
assert.ok(benchRule?.includes('--bench-plan:#0a99ff')&&benchRule.includes('--bench-actual:#2bcc50'),'Reference chart colors stay scoped to bench progression');
const appTheme=css.replace(benchRule,'');
for(const hex of appTheme.match(/#[a-f\d]{6}(?:[a-f\d]{2})?\b/gi)||[]){const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));assert.ok(!(b>r+10&&b>g*1.05),`Unexpected legacy blue color: ${hex}`)}
console.log('Production theme checks passed: HUD CSS is last, shared palette present, no legacy blue UI colors outside the explicitly requested bench-chart palette.');

