/* ════════════════════════════════════════
   app.js — Entry point, bootstraps the app
   ════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Sync Stored Assets ($SWT Token) balance in sidebar
  let balance = localStorage.getItem('swtBalance');
  if (balance === null) {
    localStorage.setItem('swtBalance', '2475');
    balance = '2475';
  }
  const totalXPEl = document.getElementById('totalXP');
  if (totalXPEl) {
    totalXPEl.textContent = parseInt(balance, 10).toLocaleString();
  }

  updateRecoveryDisplay();   // recovery.js  — set initial score from default slider values
  startBpmSimulation();      // ui.js        — kick off live BPM ticker
});
