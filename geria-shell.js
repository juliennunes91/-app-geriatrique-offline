/* ============================================================
   GeriaAssist — Shell UI v2
   Navigation, tabs, dark mode, dropdowns, helpers
   ============================================================ */

/* ── VIEW NAVIGATION ─────────────────────────────────────── */
function showView(id) {
  document.querySelectorAll('.view-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pane = document.querySelector(`.view-pane[data-view="${id}"]`);
  const nav  = document.querySelector(`.nav-item[data-view="${id}"]`);
  if (pane) pane.classList.add('active');
  if (nav)  nav.classList.add('active');
}

/* ── SUB-TABS (analyse view) ─────────────────────────────── */
function activateTab(tabId) {
  document.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.subtab-pane').forEach(p => p.classList.remove('active'));
  const btn  = document.querySelector(`.subtab-btn[data-tab="${tabId}"]`);
  const pane = document.getElementById(`tab-${tabId}`);
  if (btn)  btn.classList.add('active');
  if (pane) pane.classList.add('active');
  // Switch to analyse view if not already there
  showView('analyse');
}

function initSubTabs() {
  document.querySelectorAll('.subtab-btn').forEach(btn => {
    btn.addEventListener('click', () => activateTab(btn.dataset.tab));
  });
}

/* ── DARK MODE ───────────────────────────────────────────── */
function toggleDarkMode() {
  document.body.classList.toggle('dark');
  localStorage.setItem('geria-dark', document.body.classList.contains('dark') ? '1' : '0');
  hideAllDropdowns();
}
function initDarkMode() {
  if (localStorage.getItem('geria-dark') === '1') document.body.classList.add('dark');
}

/* ── DROPDOWNS ───────────────────────────────────────────── */
function toggleDropdown(id, e) {
  if (e) e.stopPropagation();
  const el = document.getElementById(id);
  if (!el) return;
  const wasOpen = el.classList.contains('open');
  hideAllDropdowns();
  if (!wasOpen) el.classList.add('open');
}
function hideAllDropdowns() {
  document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
}
document.addEventListener('click', hideAllDropdowns);

/* legacy compat */
function toggleHdrMenu(id, e) { toggleDropdown(id, e); }
function hideHdrMenu(id) { const el = document.getElementById(id); if (el) el.classList.remove('open'); }

/* ── HEADER CHIPS ────────────────────────────────────────── */
function updateHeaderChips() {
  const age    = document.getElementById('patientAge')?.value || '—';
  const sexe   = document.getElementById('patientSexe')?.value || '';
  const dfg    = document.getElementById('patientDFG')?.value || '—';
  const cfs    = document.getElementById('scoreCFS')?.value || '0';
  const nom    = document.getElementById('patientNom')?.value || 'Nouveau patient';
  const meds   = typeof activeMeds !== 'undefined' ? activeMeds.length : 0;
  const comorbs = typeof activeComorbs !== 'undefined' ? activeComorbs.length : 0;

  const setChip = (id, text, cls) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = `chip ${cls || ''}`.trim();
    if (text && text !== '—') el.classList.remove('hidden');
  };

  const el = document.getElementById('hdrPatientName');
  if (el) el.textContent = nom || 'Nouveau patient';

  setChip('hdrChipAge', `${age} ans · ${sexe}`);
  const dfgNum = parseFloat(dfg);
  setChip('hdrChipDfg', `DFG ${dfg}`, dfgNum > 0 && dfgNum < 30 ? 'err' : dfgNum < 60 ? 'warn' : '');
  if (cfs !== '0') setChip('hdrChipCfs', `CFS ${cfs}`);
  if (meds > 0) { const ch = document.getElementById('hdrChipMeds'); if (ch) { ch.textContent = `${meds} Rx`; ch.classList.remove('hidden'); } }
  if (comorbs > 0) { const ch = document.getElementById('hdrChipComorbs'); if (ch) { ch.textContent = `${comorbs} cond.`; ch.classList.remove('hidden'); } }
}

/* ── FILTER ALERTES ──────────────────────────────────────── */
function filterAlertes(query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll('.subtab-pane .alert').forEach(el => {
    el.style.display = (!q || el.textContent.toLowerCase().includes(q)) ? '' : 'none';
  });
}

/* ── RESET PATIENT ───────────────────────────────────────── */
function resetPatient() {
  // Reset inputs
  ['patientAge','patientPoids','patientBmi','bioCreat','patientNa','patientK','bioAlbumSg'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = id === 'patientAge' ? 80 : id === 'patientNa' ? 140 : id === 'patientK' ? 4.0 : '';
  });
  document.getElementById('patientDFG').value = 45;
  document.getElementById('dfgMethodSelect').value = 'manuel';
  // Reset checkboxes
  document.querySelectorAll('input[type=checkbox]').forEach(cb => { cb.checked = false; });
  document.getElementById('scoreCFS').value = '0';
  // Reset state
  if (typeof activeComorbs !== 'undefined') activeComorbs.length = 0;
  if (typeof activeMeds !== 'undefined') activeMeds.length = 0;
  if (typeof window.suspendedMeds !== 'undefined') window.suspendedMeds.length = 0;
  // Clear tags
  ['selectedComorbs','selectedMeds'].forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = ''; });
  // Clear results
  ['alertes-eviter','alertes-initier','alertes-interact','alertes-auc','alertes-ansm',
   'alertes-bio','alertes-usage','alertes-suivi','alertes-scores','alertes-synthese','alertes-guidelines'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<span class="text-muted">Cliquez sur Analyser...</span>';
  });
  // Reset hero
  const ht = document.getElementById('heroTitle');
  if (ht) ht.textContent = 'Lancez l\'analyse clinique pour voir la synthèse.';
  const hs = document.getElementById('heroSub');
  if (hs) hs.textContent = 'Saisissez les données dans l\'onglet Dossier puis cliquez sur « Lancer l\'Analyse Clinique ».';
  updateHeaderChips();
}

/* ── CASCADE CHECKBOXES (SPC) ────────────────────────────── */
function toggleCascade(chkId, cascadeId) {
  const chk = document.getElementById(chkId);
  const cas = document.getElementById(cascadeId);
  if (chk && cas) cas.style.display = chk.checked ? '' : 'none';
}

/* ── CHILD-PUGH HELPERS ──────────────────────────────────── */
function toggleCpDetails(val) {
  const bl = document.getElementById('cpDetailsBlock');
  if (bl) bl.style.display = val === '0' ? '' : 'none';
}
function syncFoieToChildPugh() { /* hook for future */ }

/* ── LEGEND MODAL ────────────────────────────────────────── */
function openLegendModal() {
  const m = document.getElementById('legendModal');
  if (m) m.classList.add('open');
  if (typeof renderLegend === 'function') renderLegend();
}
function closeLegendModal() {
  const m = document.getElementById('legendModal');
  if (m) m.classList.remove('open');
}
// Legacy compat
function openSpcModal() {}
function setSpcDisplayMode(mode) {}

/* ── EXPORT/SHARE ────────────────────────────────────────── */
function copierSynthese() {
  const zones = ['alertes-eviter','alertes-initier','alertes-interact','alertes-ansm','alertes-bio','alertes-usage'];
  let txt = 'GeriaAssist — Synthèse Pharmaco-Clinique\n';
  txt += '==========================================\n';
  zones.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.innerText.trim()) txt += '\n' + el.innerText + '\n';
  });
  navigator.clipboard.writeText(txt).then(() => {
    const btn = document.getElementById('btnCopier');
    if (btn) { btn.textContent = '✓ Copié !'; setTimeout(() => btn.textContent = 'Copier la synthèse', 1500); }
  });
  hideAllDropdowns();
}

function exporterPDF() {
  if (typeof html2pdf === 'undefined') { window.print(); return; }
  const el = document.querySelector('.main');
  html2pdf().set({ margin: 10, filename: 'GeriaAssist-Synthese.pdf', html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).from(el).save();
  hideAllDropdowns();
}

function exporterPatientJSON() {
  const data = {
    age: document.getElementById('patientAge')?.value,
    sexe: document.getElementById('patientSexe')?.value,
    dfg: document.getElementById('patientDFG')?.value,
    cfs: document.getElementById('scoreCFS')?.value,
    meds: typeof activeMeds !== 'undefined' ? activeMeds.map(m => m.dci) : [],
    comorbs: typeof activeComorbs !== 'undefined' ? activeComorbs : []
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'patient.json'; a.click();
  hideAllDropdowns();
}
function importerPatientJSON() { hideAllDropdowns(); }

/* ── HERO CARD UPDATER ───────────────────────────────────── */
function updateHeroCard(nEviter, nInitier, nInteract) {
  const icon  = document.getElementById('heroIcon');
  const label = document.getElementById('heroLabel');
  const title = document.getElementById('heroTitle');
  const sub   = document.getElementById('heroSub');
  const chips = document.getElementById('heroChips');
  const ts    = document.getElementById('analyseUpdatedAt');

  const total = nEviter + nInitier + nInteract;
  const now   = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  if (ts) ts.textContent = `Mis à jour à ${now}`;

  if (icon)  icon.textContent = total === 0 ? 'check_circle' : total < 5 ? 'warning' : 'dangerous';
  if (label) label.textContent = total === 0 ? 'Ordonnance conforme' : 'Points d\'attention détectés';
  if (title) title.textContent = total === 0
    ? 'Aucun signal iatrogène majeur détecté pour ce patient.'
    : `${total} signal${total > 1 ? 's' : ''} iatrogène${total > 1 ? 's' : ''} à évaluer.`;
  if (sub) sub.textContent = total === 0
    ? 'L\'ordonnance ne déclenche aucune alerte STOPP/START ou interaction majeure dans le contexte clinique saisi.'
    : 'Consultez les onglets ci-dessous pour le détail des alertes par catégorie.';

  if (chips) {
    chips.innerHTML = '';
    const addChip = (txt, show) => { if (!show) return; const c = document.createElement('span'); c.className = 'hero-chip'; c.textContent = txt; chips.appendChild(c); };
    addChip(`${nEviter} à éviter`, nEviter > 0);
    addChip(`${nInitier} omission${nInitier > 1 ? 's' : ''}`, nInitier > 0);
    addChip(`${nInteract} interaction${nInteract > 1 ? 's' : ''}`, nInteract > 0);
  }

  // update preview badges
  const pb = (id, n, cls) => {
    const el = document.getElementById(id);
    if (el) { el.textContent = n || '0'; el.className = `preview-badge ${cls}`; }
  };
  pb('previewStoppBadge', nEviter, 'red');
  pb('previewStartBadge', nInitier, 'green');
  pb('previewInteractBadge', nInteract, 'amber');

  // update preview content snippets
  const snap = (srcId, destId) => {
    const src = document.getElementById(srcId);
    const dst = document.getElementById(destId);
    if (!src || !dst) return;
    const alerts = src.querySelectorAll('.alert');
    if (alerts.length === 0) { dst.innerHTML = '<em>Aucune alerte.</em>'; return; }
    dst.innerHTML = `<strong>${alerts[0].querySelector('strong')?.textContent || ''}</strong><br><em style="font-size:11px">${alerts.length > 1 ? `+${alerts.length - 1} autre(s)…` : ''}</em>`;
  };
  snap('alertes-eviter',   'previewStoppContent');
  snap('alertes-initier',  'previewStartContent');
  snap('alertes-interact', 'previewInteractContent');
}

/* ── SUBTAB BADGE UPDATER ────────────────────────────────── */
function updateSubTabBadge(tabId, count, cls) {
  const btn = document.querySelector(`.subtab-btn[data-tab="${tabId}"]`);
  if (!btn) return;
  let badge = btn.querySelector('.subtab-badge');
  if (!badge) { badge = document.createElement('span'); badge.className = 'subtab-badge'; btn.appendChild(badge); }
  badge.textContent = count;
  badge.className = `subtab-badge ${count > 0 ? (cls || 'amber') : ''}`;
}

/* ── OCR STUB ────────────────────────────────────────────── */
function ocrOpenModal() {
  alert('Fonctionnalité OCR disponible avec la librairie Tesseract intégrée.');
}
function toggleCompareMode() {}

/* ── SPC INLINE SLOT ─────────────────────────────────────── */
function imprimerSynthese(mode) { window.print(); hideAllDropdowns(); }

/* ── INIT ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  initDarkMode();
  showView('analyse');
  initSubTabs();

  // Live chip update on key inputs
  ['patientAge','patientSexe','patientDFG','scoreCFS','patientNom'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateHeaderChips);
    if (el) el.addEventListener('change', updateHeaderChips);
  });

  updateHeaderChips();
});
