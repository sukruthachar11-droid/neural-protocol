/* ════════════════════════════════════════
   form-check.js — AI Form Scanner logic
   Movement calibration, rep counter, joint telemetry
   ════════════════════════════════════════ */

/* ── Movement definitions ── */
const MOVEMENTS = [
  {
    id: 'squat',
    name: 'Back Squat',
    icon: '🏋️',
    joints: { knee: [85, 95], hip: [70, 85], spine: 'NEUTRAL', shoulder: [45, 55] },
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    icon: '⚡',
    joints: { knee: [25, 35], hip: [40, 55], spine: 'BRACED', shoulder: [10, 20] },
  },
  {
    id: 'ohp',
    name: 'Overhead Press',
    icon: '🔺',
    joints: { knee: [0, 5], hip: [0, 5], spine: 'VERTICAL', shoulder: [170, 180] },
  },
  {
    id: 'bench',
    name: 'Bench Press',
    icon: '💪',
    joints: { knee: [90, 100], hip: [0, 5], spine: 'ARCHED', shoulder: [75, 90] },
  },
  {
    id: 'lunge',
    name: 'Lunge',
    icon: '🦵',
    joints: { knee: [80, 95], hip: [60, 75], spine: 'UPRIGHT', shoulder: [0, 10] },
  },
  {
    id: 'row',
    name: 'Barbell Row',
    icon: '🔄',
    joints: { knee: [20, 30], hip: [45, 60], spine: 'HINGED', shoulder: [90, 110] },
  },
];

/* ── State ── */
let activeMovement = null;
let repCount = 0;
let setCount = 1;
let telemInterval = null;

/* ── Render movement list ── */
function renderMovements() {
  const list = document.getElementById('movementList');
  list.innerHTML = '';
  MOVEMENTS.forEach(m => {
    const item = document.createElement('div');
    item.className = 'movement-item';
    item.id = `mv-${m.id}`;
    item.onclick = () => calibrateMovement(m);
    item.innerHTML = `
      <span class="movement-icon">${m.icon}</span>
      <span class="movement-name">${m.name}</span>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px;min-width:90px;">
        <span class="movement-status" id="status-${m.id}">WAITING</span>
        <div class="calib-bar-wrap" style="width:90px;">
          <div class="calib-bar-fill" id="bar-${m.id}"></div>
        </div>
      </div>
    `;
    list.appendChild(item);
  });
}

/* ── Calibrate a movement ── */
function calibrateMovement(movement) {
  // Reset previous active
  if (activeMovement) {
    const prev = document.getElementById(`mv-${activeMovement.id}`);
    if (prev) {
      prev.classList.remove('calibrated');
      document.getElementById(`status-${activeMovement.id}`).textContent = 'WAITING';
      document.getElementById(`bar-${activeMovement.id}`).style.width = '0%';
    }
  }

  activeMovement = movement;
  repCount = 0;
  setCount = 1;
  updateRepDisplay();

  // Update feed status
  document.getElementById('feedStatusText').textContent = `CALIBRATING // ${movement.name.toUpperCase()}`;
  document.getElementById('feedSubText').textContent = 'JOINT MAPPING IN PROGRESS...';
  document.getElementById('activeMovementLabel').innerHTML =
    `${movement.icon} ${movement.name.toUpperCase()}<br>SET ${setCount}`;

  // Animate calibration bar
  const bar = document.getElementById(`bar-${movement.id}`);
  const statusEl = document.getElementById(`status-${movement.id}`);
  const item = document.getElementById(`mv-${movement.id}`);

  bar.style.width = '0%';
  statusEl.textContent = 'CALIBRATING...';
  statusEl.style.color = 'var(--yellow)';

  // Simulate calibration progress
  let progress = 0;
  const tick = setInterval(() => {
    progress += Math.random() * 18 + 8;
    if (progress >= 100) {
      progress = 100;
      clearInterval(tick);
      // Calibration complete
      bar.style.width = '100%';
      statusEl.textContent = 'CALIBRATED // TRACKING';
      statusEl.style.color = '';
      item.classList.add('calibrated');
      document.getElementById('feedStatusText').textContent =
        `TRACKING ACTIVE // ${movement.name.toUpperCase()}`;
      document.getElementById('feedSubText').textContent =
        'BIOMECHANICAL TELEMETRY ONLINE // PRESS + SIM REP TO TEST';
      logEvent(`✓ ${movement.name} calibrated. Tracking active.`);
      showToast(`CALIBRATED // ${movement.name.toUpperCase()} TRACKING ACTIVE`);
      startTelemSimulation(movement);
    } else {
      bar.style.width = `${progress}%`;
    }
  }, 120);

  logEvent(`⟳ Calibrating ${movement.name}...`);
}

/* ── Simulate live joint telemetry ── */
function startTelemSimulation(movement) {
  if (telemInterval) clearInterval(telemInterval);

  const j = movement.joints;

  function randInRange(arr) {
    return Math.round(arr[0] + Math.random() * (arr[1] - arr[0]));
  }

  function updateTelem() {
    const knee = Array.isArray(j.knee) ? `${randInRange(j.knee)}°` : j.knee;
    const hip  = Array.isArray(j.hip)  ? `${randInRange(j.hip)}°`  : j.hip;
    const spine = j.spine;
    const shoulder = Array.isArray(j.shoulder) ? `${randInRange(j.shoulder)}°` : j.shoulder;

    setTelem('telemKnee',     knee,     'good');
    setTelem('telemHip',      hip,      'good');
    setTelem('telemSpine',    spine,    'good');
    setTelem('telemShoulder', shoulder, 'good');
  }

  updateTelem();
  telemInterval = setInterval(updateTelem, 1400);
}

function setTelem(id, value, cls) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value;
  el.className = `telem-value ${cls}`;
}

function resetTelem() {
  ['telemKnee','telemHip','telemSpine','telemShoulder'].forEach(id => {
    setTelem(id, '—', 'idle');
  });
}

/* ── Rep counter ── */
function simulateRep() {
  if (!activeMovement) {
    showToast('SELECT A MOVEMENT FIRST // CALIBRATION REQUIRED');
    return;
  }

  repCount++;

  // Every 8 reps → new set
  if (repCount > 8) {
    repCount = 1;
    setCount++;
    logEvent(`◆ Set ${setCount - 1} complete. Starting Set ${setCount}.`);
    showToast(`SET ${setCount - 1} COMPLETE // STARTING SET ${setCount}`);
  }

  updateRepDisplay();

  // Flash the rep value
  const repEl = document.getElementById('repCount');
  repEl.style.textShadow = '0 0 20px var(--green), 0 0 40px rgba(0,255,136,0.5)';
  setTimeout(() => {
    repEl.style.textShadow = '0 0 12px rgba(0,255,136,0.4)';
  }, 200);

  // Occasionally log a form note
  if (repCount % 3 === 0) {
    const notes = [
      'Form telemetry nominal.',
      'Depth calibration: OPTIMAL.',
      'Spine alignment: VERIFIED.',
      'Tempo variance detected — slow the eccentric.',
      'Joint angles within target range.',
    ];
    logEvent(`Rep ${repCount}: ${notes[Math.floor(Math.random() * notes.length)]}`);
  }
}

function updateRepDisplay() {
  document.getElementById('repCount').textContent = repCount;
  document.getElementById('setCount').textContent = setCount;
  if (activeMovement) {
    document.getElementById('activeMovementLabel').innerHTML =
      `${activeMovement.icon} ${activeMovement.name.toUpperCase()}<br>SET ${setCount}`;
  }
}

/* ── Session log ── */
function logEvent(msg) {
  const log = document.getElementById('sessionLog');
  const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const entry = document.createElement('div');
  entry.style.cssText = 'font-family:var(--mono);font-size:9px;color:var(--text-dim);letter-spacing:1px;border-bottom:1px dashed rgba(255,255,255,0.05);padding-bottom:4px;';
  entry.textContent = `[${now}] ${msg}`;
  // Remove placeholder if present
  const placeholder = log.querySelector('[style*="AWAITING"]');
  if (placeholder) placeholder.remove();
  log.insertBefore(entry, log.firstChild);
  // Keep max 12 entries
  while (log.children.length > 12) log.removeChild(log.lastChild);
}

/* ── SWT balance ── */
function loadSwtBalance() {
  const stored = localStorage.getItem('swtBalance');
  const el = document.getElementById('totalXP');
  if (el) el.textContent = stored ? Number(stored).toLocaleString() : '2,475';
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  loadSwtBalance();
  startBpmSimulation();
  renderMovements();
  resetTelem();
  logEvent('System online. Select a movement to begin calibration.');
});
