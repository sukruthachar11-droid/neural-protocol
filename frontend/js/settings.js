/* ════════════════════════════════════════
   settings.js — System Settings & Diagnostics
   Toggles, sliders, terminal console, danger zone
   ════════════════════════════════════════ */

/* ── Toggle definitions ── */
const TOGGLES = [
  { id: 'bioSync',      name: 'AUTOMATED BIOMETRIC SYNC',    desc: 'Continuously syncs sleep, stress, and recovery scores to adapt protocol intensity in real time.', default: true  },
  { id: 'audioTempo',   name: 'AUDIO TEMPO ANCHORING',       desc: 'Locks BPM output to match current workout block intensity. Adjusts track selection automatically.', default: true  },
  { id: 'xpNotify',     name: 'XP REWARD NOTIFICATIONS',     desc: 'Displays toast alerts when $SWT tokens are earned or deducted from the wallet balance.', default: true  },
  { id: 'formTelem',    name: 'JOINT TELEMETRY OVERLAY',     desc: 'Renders live joint angle readouts over the camera feed during form check sessions.', default: true  },
  { id: 'adaptiveLoad', name: 'ADAPTIVE LOAD CALIBRATION',   desc: 'Automatically adjusts set volume and intensity based on recovery score thresholds.', default: false },
  { id: 'duelAlerts',   name: 'DUEL CHALLENGE ALERTS',       desc: 'Sends in-app notifications when new community duels are available or entry windows close.', default: false },
  { id: 'darkScan',     name: 'DARK MODE SCAN LINES',        desc: 'Renders subtle CRT scan-line overlay across the interface for enhanced cybernetic aesthetic.', default: true  },
  { id: 'autoSave',     name: 'AUTO-SAVE SESSION STATE',     desc: 'Persists active workout session progress to localStorage on each block completion.', default: true  },
];

/* ── Slider definitions ── */
const SLIDERS = [
  { id: 'recovThresh', name: 'RECOVERY THRESHOLD',    min: 10, max: 100, default: 70,  unit: '%',  desc: 'Minimum recovery score required before high-intensity blocks are unlocked.' },
  { id: 'bpmOffset',   name: 'BPM SYNC OFFSET',       min: -20, max: 20, default: 0,   unit: ' BPM', desc: 'Fine-tune the BPM offset applied to audio track selection.' },
  { id: 'xpMulti',     name: 'XP MULTIPLIER',         min: 1,  max: 5,   default: 1,   unit: 'x',  desc: 'Simulated XP multiplier applied to all earned session points.' },
  { id: 'timerSpeed',  name: 'TIMER SPEED FACTOR',    min: 1,  max: 3,   default: 1,   unit: 'x',  desc: 'Accelerates countdown timer for demo and testing purposes.' },
];

/* ── Terminal log lines ── */
const BOOT_LOGS = [
  { tag: '[SYSTEM]',         msg: 'Neural Protocol v1.0.0-FINAL initializing...',          cls: '' },
  { tag: '[DATABASE_MATRIX]',msg: 'Connection stable on Port 5000',                        cls: 'ok' },
  { tag: '[CORE]',           msg: 'Memory usage nominal — heap 42.3 MB / 512 MB',          cls: 'ok' },
  { tag: '[AUTH]',           msg: 'Session token validated // SEC_LEVEL_10',               cls: 'ok' },
  { tag: '[BIOMETRIC]',      msg: 'Recovery telemetry module loaded',                      cls: 'ok' },
  { tag: '[AUDIO_ENGINE]',   msg: 'BPM sync module online — 142 BPM anchor set',           cls: 'ok' },
  { tag: '[FORM_CHECK]',     msg: 'Joint telemetry overlay ready — awaiting camera feed',  cls: '' },
  { tag: '[SWT_WALLET]',     msg: 'Balance loaded from localStorage — 2,475 $SWT',        cls: 'ok' },
  { tag: '[DUELS]',          msg: '3 active challenge brackets detected',                  cls: 'ok' },
  { tag: '[AI_COACH]',       msg: 'Response engine v2.4 loaded — 8 condition categories', cls: 'ok' },
  { tag: '[HISTORY]',        msg: '20 session records found in analytics matrix',          cls: 'ok' },
  { tag: '[SETTINGS]',       msg: 'Configuration panel mounted — all modules nominal',     cls: 'ok' },
  { tag: '[CORE]',           msg: 'All 10 pages loaded successfully',                      cls: 'ok' },
  { tag: '[SYSTEM]',         msg: 'Neural Protocol READY // AWAITING PILOT INPUT',         cls: 'ok' },
];

/* ── State ── */
const toggleState = {};
const sliderState = {};
let terminalInterval = null;
let logIndex = 0;

/* ── Render toggles ── */
function renderToggles() {
  const container = document.getElementById('toggleList');
  if (!container) return;

  TOGGLES.forEach(t => {
    // Load saved state or use default
    const saved = localStorage.getItem(`toggle_${t.id}`);
    const isOn  = saved !== null ? saved === 'true' : t.default;
    toggleState[t.id] = isOn;

    const row = document.createElement('div');
    row.className = 'toggle-row';
    row.innerHTML = `
      <div class="toggle-info">
        <div class="toggle-name">${t.name}</div>
        <div class="toggle-desc">${t.desc}</div>
      </div>
      <span class="toggle-status ${isOn ? 'on' : 'off'}" id="status-${t.id}">${isOn ? 'ENABLED' : 'DISABLED'}</span>
      <label class="toggle-switch">
        <input type="checkbox" id="toggle-${t.id}" ${isOn ? 'checked' : ''} onchange="handleToggle('${t.id}')">
        <span class="toggle-track"></span>
      </label>
    `;
    container.appendChild(row);
  });
}

function handleToggle(id) {
  const cb  = document.getElementById(`toggle-${id}`);
  const lbl = document.getElementById(`status-${id}`);
  const isOn = cb.checked;
  toggleState[id] = isOn;
  localStorage.setItem(`toggle_${id}`, isOn);
  lbl.textContent = isOn ? 'ENABLED' : 'DISABLED';
  lbl.className   = `toggle-status ${isOn ? 'on' : 'off'}`;
  termLog(`[SETTINGS] ${id.toUpperCase()} → ${isOn ? 'ENABLED' : 'DISABLED'}`, isOn ? 'ok' : 'warn');
  showToast(`${id.toUpperCase()} // ${isOn ? 'MODULE ENABLED' : 'MODULE DISABLED'}`);
}

/* ── Render sliders ── */
function renderSliders() {
  const container = document.getElementById('sliderList');
  if (!container) return;

  SLIDERS.forEach(s => {
    const saved = localStorage.getItem(`slider_${s.id}`);
    const val   = saved !== null ? Number(saved) : s.default;
    sliderState[s.id] = val;

    const wrap = document.createElement('div');
    wrap.className = 'slider-setting';
    wrap.innerHTML = `
      <div class="slider-setting-header">
        <span class="slider-setting-name">${s.name}</span>
        <span class="slider-setting-val" id="slval-${s.id}">${val}${s.unit}</span>
      </div>
      <input type="range" class="set-slider" id="slider-${s.id}"
        min="${s.min}" max="${s.max}" value="${val}"
        oninput="handleSlider('${s.id}', '${s.unit}', this.value)">
      <div style="font-family:var(--body);font-size:11px;color:var(--text-muted);margin-top:6px;">${s.desc}</div>
    `;
    container.appendChild(wrap);
  });
}

function handleSlider(id, unit, value) {
  sliderState[id] = Number(value);
  localStorage.setItem(`slider_${id}`, value);
  const lbl = document.getElementById(`slval-${id}`);
  if (lbl) lbl.textContent = `${value}${unit}`;
}

/* ── Terminal console ── */
function termLog(msg, cls = '') {
  const term = document.getElementById('terminalConsole');
  if (!term) return;

  // Remove cursor if present
  const cursor = term.querySelector('.term-cursor');
  if (cursor) cursor.remove();

  const now = new Date().toLocaleTimeString('en-US', { hour12: false });
  const line = document.createElement('span');
  line.className = 'term-line';

  const parts = msg.match(/^(\[[^\]]+\])\s(.+)$/);
  if (parts) {
    line.innerHTML = `<span class="dim">[${now}]</span> <span class="tag">${parts[1]}</span> <span class="${cls}">${parts[2]}</span>`;
  } else {
    line.innerHTML = `<span class="dim">[${now}]</span> <span class="${cls}">${msg}</span>`;
  }

  term.appendChild(line);
  term.appendChild(document.createElement('br'));

  // Re-add cursor
  const cur = document.createElement('span');
  cur.className = 'term-cursor';
  term.appendChild(cur);

  term.scrollTop = term.scrollHeight;
}

function bootTerminal() {
  const term = document.getElementById('terminalConsole');
  if (!term) return;
  term.innerHTML = '';

  // Add cursor immediately
  const cur = document.createElement('span');
  cur.className = 'term-cursor';
  term.appendChild(cur);

  // Stream boot logs with staggered delay
  BOOT_LOGS.forEach((entry, i) => {
    setTimeout(() => {
      termLog(`${entry.tag} ${entry.msg}`, entry.cls);
    }, i * 180);
  });

  // After boot, start periodic live logs
  setTimeout(() => {
    startLiveLogs();
  }, BOOT_LOGS.length * 180 + 500);
}

const LIVE_LOGS = [
  { tag: '[CORE]',           msg: 'Heartbeat OK — uptime 00:01:00',                cls: 'ok'  },
  { tag: '[DATABASE_MATRIX]',msg: 'Query latency 2ms — connection stable',         cls: 'ok'  },
  { tag: '[BIOMETRIC]',      msg: 'Recovery score recalculated — 88/100',          cls: 'ok'  },
  { tag: '[AUDIO_ENGINE]',   msg: 'BPM drift corrected — 142 BPM locked',          cls: 'ok'  },
  { tag: '[SWT_WALLET]',     msg: 'Balance sync verified — no delta detected',     cls: 'ok'  },
  { tag: '[CORE]',           msg: 'GC cycle complete — memory nominal',            cls: 'ok'  },
  { tag: '[AUTH]',           msg: 'Session token refreshed — TTL extended',        cls: 'ok'  },
  { tag: '[FORM_CHECK]',     msg: 'Telemetry module idle — no active session',     cls: ''    },
  { tag: '[DUELS]',          msg: 'Leaderboard sync — 4 pilots updated',           cls: 'ok'  },
  { tag: '[CORE]',           msg: 'Heartbeat OK — all systems nominal',            cls: 'ok'  },
];

let liveLogIdx = 0;
function startLiveLogs() {
  terminalInterval = setInterval(() => {
    const entry = LIVE_LOGS[liveLogIdx % LIVE_LOGS.length];
    termLog(`${entry.tag} ${entry.msg}`, entry.cls);
    liveLogIdx++;
  }, 4000);
}

/* ── Danger zone actions ── */
function confirmReset() {
  const confirmed = window.confirm(
    'SYSTEM RESET // IRREVERSIBLE\n\nThis will clear all localStorage data including your $SWT balance, session history, and settings.\n\nProceed?'
  );
  if (!confirmed) return;
  termLog('[SYSTEM] RESET INITIATED — clearing localStorage...', 'warn');
  setTimeout(() => {
    localStorage.clear();
    termLog('[SYSTEM] localStorage cleared — reloading...', 'warn');
    setTimeout(() => location.reload(), 800);
  }, 600);
}

function clearCache() {
  termLog('[CORE] Session cache purged — in-memory state cleared', 'warn');
  showToast('SESSION CACHE CLEARED // IN-MEMORY STATE RESET');
}

function exportLog() {
  const term = document.getElementById('terminalConsole');
  if (!term) return;
  const text = term.innerText || term.textContent;
  const blob = new Blob([text], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `neural_protocol_diagnostic_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  termLog('[SYSTEM] Diagnostic log exported successfully', 'ok');
  showToast('DIAGNOSTIC LOG EXPORTED // FILE DOWNLOADED');
}

/* ── SWT balance ── */
function loadSwtBalance() {
  const stored = localStorage.getItem('swtBalance');
  const val    = stored ? Number(stored).toLocaleString() : '2,475';
  const el     = document.getElementById('totalXP');
  const sysEl  = document.getElementById('sysBalanceDisplay');
  if (el)    el.textContent    = val;
  if (sysEl) sysEl.textContent = val + ' $SWT';
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  loadSwtBalance();
  startBpmSimulation();
  renderToggles();
  renderSliders();
  bootTerminal();
});
