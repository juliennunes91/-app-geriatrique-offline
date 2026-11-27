// Inventaire des cases a cocher cliniques : contexte produit, pathologie equivalente,
// regles lectrices, medicaments vises, biologie lue, usages directs dans le code.
// Usage : node tools/inventaire_cases.cjs [sortie.md]
process.chdir(require('path').join(__dirname, '..'));
const fs=require('fs'), vm=require('vm');
const html=fs.readFileSync('index.html','utf8');
const ids=[...html.matchAll(/<input type="checkbox" class="form-check-input" id="((?:chk|dem|del)[A-Za-z]+)"[^>]*>\s*<label[^>]*>([\s\S]*?)<\/label>/g)].map(m=>({id:m[1],label:m[2].replace(/<[^>]+>/g,'').replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/\s+/g,' ').trim()}));
const files=['app_analysis.js','app_core.js','app_ui.js','geria_engine_v2.js','composite_scores.js','utils.js','app_paam.js'];
const src={}; for (const f of files) src[f]=fs.readFileSync(f,'utf8').split('\n');
const {sandbox}=require('../oracle_harness').loadApp();
const rules=JSON.parse(vm.runInContext(`JSON.stringify([...GERIA_RECOS_DB.EVITER, ...GERIA_RECOS_DB.INITIER, ...(typeof RECOS_SUPPLEMENT!=='undefined'?RECOS_SUPPLEMENT:[]), ...(typeof RECOS_SUPPLEMENT_INTEGRATION!=='undefined'?RECOS_SUPPLEMENT_INTEGRATION:[])].map(r=>({id:r.id,t:r.titre,sev:r.severite,c:r.condition||{}})))`, sandbox));
const casePath=JSON.parse(vm.runInContext('JSON.stringify(CASE_PATHOLOGIE)',sandbox));
const lines=[];
for (const {id,label} of ids) {
  const ctx=new Set(), direct=[];
  for (const [f,ls] of Object.entries(src)) ls.forEach((l,i)=>{
    if (!l.includes("'"+id+"'")) return;
    [...l.matchAll(/ctxClinique\.push\(([^)]*)\)/g)].flatMap(x=>x[1].split(',').map(s=>s.trim().replace(/["']/g,''))).forEach(c=>ctx.add(c));
    if (/ctxClinique\.push|^\s*'chk|resetPatient|CASE_PATHOLOGIE|chkStent','chkAlcool|\['chk|'chk[A-Za-z]+',\s*'chk|: 'PAT_/.test(l) && !/score|Score|tt[A-Z]|push\("/.test(l)) return;
    direct.push(f.replace('.js','')+':'+(i+1)+' '+l.trim().slice(0,90));
  });
  const pat=casePath[id];
  const lecteurs=rules.filter(r=>{const c=r.c; const all=[].concat(c.contexte_clinique||[],c.contexte_clinique_any||[],c.contexte_absent||[]); return all.some(x=>ctx.has(x)) || (pat && JSON.stringify(c).includes('"'+pat+'"'));});
  lines.push(`### ${id} — ${label}`);
  lines.push(`- pathologie équivalente : ${pat||'—'} · contextes : ${[...ctx].join(', ')||'—'}`);
  lines.push(`- règles lectrices (${lecteurs.length}) : ${lecteurs.map(r=>r.id+'['+(r.sev||'?')[0]+']').join(' ')}`);
  const mk=new Set(); lecteurs.forEach(r=>[].concat(r.c.med_keys||[],r.c.med_keys_2||[]).forEach(k=>mk.add(k)));
  lines.push(`- médicaments visés : ${[...mk].slice(0,25).join(', ')||'—'}`);
  const bio=new Set(); lecteurs.forEach(r=>{ if (r.c.bio) Object.keys(r.c.bio).forEach(b=>bio.add(b)); });
  if (bio.size) lines.push(`- biologie lue : ${[...bio].join(', ')}`);
  if (direct.length) lines.push(`- usages directs : ${direct.slice(0,6).join(' ‖ ')}`);
  lines.push('');
}
const out = process.argv[2] || 'docs/inventaire_cases_cliniques.md'; fs.writeFileSync(out, '# Inventaire des cases cliniques (généré par tools/inventaire_cases.cjs — ne pas éditer)\n\nRègles lectrices = règles dont la condition lit le contexte produit ou la pathologie équivalente. Les lectures par le CODE (encarts SPC, recontextualisation psychiatrique, pièges biologiques) n\'y figurent pas : voir docs/audit_cases_cliniques.md.\n\n' + lines.join('\n'));
console.log(ids.length, 'cases');
