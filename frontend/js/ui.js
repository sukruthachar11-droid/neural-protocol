/* ════════════════════════════════════════
   ui.js — UI utilities: toast, BPM sim, nav
   ════════════════════════════════════════ */

/* ── Toast notification ── */

/**
 * Show a brief toast message at the bottom of the screen.
 * @param {string} msg
 */
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), CONFIG.TOAST_DURATION);
}

/* ── BPM simulation ── */

let _bpm = CONFIG.BPM.INITIAL;

/**
 * Start the live BPM ticker. Call once on page load.
 */
function startBpmSimulation() {
  setInterval(() => {
    _bpm += (Math.random() - 0.5) * CONFIG.BPM.DRIFT;
    _bpm  = Math.max(CONFIG.BPM.MIN, Math.min(CONFIG.BPM.MAX, _bpm));
    document.getElementById('bpmValue').textContent = Math.round(_bpm);
  }, CONFIG.BPM.TICK_MS);
}

/* ── Navigation ── */

/**
 * Activate a nav item and deactivate the rest.
 * Passed directly as onclick handler on each .nav-item button.
 */
function showSection(name) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  event.currentTarget.classList.add('active');
}
