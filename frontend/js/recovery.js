/* ════════════════════════════════════════
   recovery.js — Slider logic & recovery score
   Mirrors the backend formula in workoutController.js:
     score = (sleepQuality × 10) − (stressLevel × 5), clamped 0–100
   ════════════════════════════════════════ */

/**
 * Compute recovery score — identical to backend calculateRecoveryScore()
 * @param {number} sleep  1–10
 * @param {number} stress 1–10
 * @returns {number} 0–100
 */
function calcRecoveryScore(sleep, stress) {
  const sq = Math.max(1, Math.min(10, sleep));
  const sl = Math.max(1, Math.min(10, stress));
  return Math.max(0, Math.min(100, (sq * 10) - (sl * 5)));
}

/**
 * Map a 1–10 slider value to a fill percentage width.
 * @param {number} v 1–10
 * @returns {string} CSS percentage string
 */
function sliderPct(v) {
  return ((v - 1) / 9 * 100) + '%';
}

/**
 * Called by the sleep/stress range inputs (oninput).
 * @param {'sleep'|'stress'} type
 */
function updateSlider(type) {
  if (type === 'sleep') {
    const v = document.getElementById('sleepQuality').value;
    document.getElementById('sleepVal').textContent = v;
    document.getElementById('sleepFill').style.width = sliderPct(v);
  } else {
    const v = document.getElementById('stressLevel').value;
    document.getElementById('stressVal').textContent = v;
    document.getElementById('stressFill').style.width = sliderPct(v);
  }
  updateRecoveryDisplay();
}

/**
 * Refresh all recovery-score-dependent UI elements.
 */
function updateRecoveryDisplay() {
  const sleep  = parseInt(document.getElementById('sleepQuality').value) || 7;
  const stress = parseInt(document.getElementById('stressLevel').value)  || 5;
  const score  = calcRecoveryScore(sleep, stress);

  /* ── Score text & bar (main form) ── */
  const scoreEl = document.getElementById('recoveryScore');
  const barEl   = document.getElementById('recoveryBarFill');

  scoreEl.textContent      = score;
  barEl.style.width        = score + '%';

  const colour = score >= CONFIG.RECOVERY.HIGH ? '#00FF88'
               : score >= CONFIG.RECOVERY.MID  ? '#FFD700'
               : '#FF1A1A';

  scoreEl.style.color     = colour;
  barEl.style.background  = colour;

  /* ── Right panel readiness ── */
  document.getElementById('readinessNumber').textContent = score;
  document.getElementById('rightBarFill').style.height   = score + '%';

  let statusHTML;
  if (score >= CONFIG.RECOVERY.HIGH) {
    statusHTML = 'Neural Load Optimized. Intensity Boost<br>'
               + '<span class="readiness-status">Ready for Protocol.</span>';
  } else if (score >= CONFIG.RECOVERY.MID) {
    statusHTML = 'Moderate Load Detected. Balanced Plan<br>'
               + '<span class="readiness-status">Proceed with Caution.</span>';
  } else {
    statusHTML = 'Recovery Deficit Detected. Reduce Load<br>'
               + '<span class="readiness-status" style="color:#FFD700">Light Protocol Only.</span>';
  }
  document.getElementById('readinessStatus').innerHTML = statusHTML;
}
