/* ════════════════════════════════════════
   history.js — Biometric Analytics & Progress History
   Volume chart, analytics log table, SWT balance
   ════════════════════════════════════════ */

/* ── Weekly volume data (12 weeks, kg) ── */
const VOLUME_DATA = [
  { week: 'W01', kg: 3200,  type: 'standard' },
  { week: 'W02', kg: 3850,  type: 'standard' },
  { week: 'W03', kg: 4100,  type: 'standard' },
  { week: 'W04', kg: 1800,  type: 'deload'   },
  { week: 'W05', kg: 4400,  type: 'standard' },
  { week: 'W06', kg: 4750,  type: 'standard' },
  { week: 'W07', kg: 5100,  type: 'peak'     },
  { week: 'W08', kg: 1950,  type: 'deload'   },
  { week: 'W09', kg: 4600,  type: 'standard' },
  { week: 'W10', kg: 5300,  type: 'standard' },
  { week: 'W11', kg: 5800,  type: 'peak'     },
  { week: 'W12', kg: 2100,  type: 'deload'   },
];

/* ── Analytics log entries ── */
const LOG_ENTRIES = [
  { date: '21/05/2026', sector: 'SQUAT MATRIX ALPHA',        status: 'COMPLETED', acc: 97, vol: '4,820 KG', dur: '58 MIN', xp: 420 },
  { date: '20/05/2026', sector: 'DEADLIFT PROTOCOL OMEGA',   status: 'COMPLETED', acc: 94, vol: '5,100 KG', dur: '62 MIN', xp: 460 },
  { date: '19/05/2026', sector: 'OVERHEAD PRESS SEQUENCE',   status: 'COMPLETED', acc: 88, vol: '2,340 KG', dur: '45 MIN', xp: 310 },
  { date: '18/05/2026', sector: 'SQUAT MATRIX ALPHA',        status: 'COMPLETED', acc: 94, vol: '4,650 KG', dur: '55 MIN', xp: 400 },
  { date: '17/05/2026', sector: 'BENCH PRESS CALIBRATION',   status: 'COMPLETED', acc: 91, vol: '3,200 KG', dur: '50 MIN', xp: 350 },
  { date: '16/05/2026', sector: 'ACCESSORY CIRCUIT BETA',    status: 'COMPLETED', acc: 96, vol: '1,800 KG', dur: '38 MIN', xp: 280 },
  { date: '15/05/2026', sector: 'DELOAD RECOVERY PROTOCOL',  status: 'COMPLETED', acc: 99, vol: '1,200 KG', dur: '30 MIN', xp: 150 },
  { date: '14/05/2026', sector: 'DEADLIFT PROTOCOL OMEGA',   status: 'SKIPPED',   acc: 0,  vol: '—',        dur: '—',      xp: 0   },
  { date: '13/05/2026', sector: 'SQUAT MATRIX ALPHA',        status: 'COMPLETED', acc: 89, vol: '4,400 KG', dur: '54 MIN', xp: 380 },
  { date: '12/05/2026', sector: 'LUNGE SECTOR GAMMA',        status: 'COMPLETED', acc: 92, vol: '2,100 KG', dur: '42 MIN', xp: 290 },
  { date: '11/05/2026', sector: 'OVERHEAD PRESS SEQUENCE',   status: 'COMPLETED', acc: 85, vol: '2,200 KG', dur: '44 MIN', xp: 300 },
  { date: '10/05/2026', sector: 'BENCH PRESS CALIBRATION',   status: 'COMPLETED', acc: 93, vol: '3,100 KG', dur: '49 MIN', xp: 340 },
  { date: '09/05/2026', sector: 'PEAK INTENSITY BLOCK',      status: 'COMPLETED', acc: 96, vol: '5,800 KG', dur: '70 MIN', xp: 520 },
  { date: '08/05/2026', sector: 'ACCESSORY CIRCUIT BETA',    status: 'FAILED',    acc: 62, vol: '900 KG',   dur: '22 MIN', xp: 80  },
  { date: '07/05/2026', sector: 'SQUAT MATRIX ALPHA',        status: 'COMPLETED', acc: 90, vol: '4,300 KG', dur: '53 MIN', xp: 370 },
  { date: '06/05/2026', sector: 'BARBELL ROW PROTOCOL',      status: 'COMPLETED', acc: 87, vol: '2,800 KG', dur: '46 MIN', xp: 320 },
  { date: '05/05/2026', sector: 'DELOAD RECOVERY PROTOCOL',  status: 'COMPLETED', acc: 100,vol: '1,100 KG', dur: '28 MIN', xp: 140 },
  { date: '04/05/2026', sector: 'DEADLIFT PROTOCOL OMEGA',   status: 'COMPLETED', acc: 95, vol: '5,050 KG', dur: '60 MIN', xp: 450 },
  { date: '03/05/2026', sector: 'LUNGE SECTOR GAMMA',        status: 'COMPLETED', acc: 91, vol: '2,050 KG', dur: '41 MIN', xp: 285 },
  { date: '02/05/2026', sector: 'OVERHEAD PRESS SEQUENCE',   status: 'SKIPPED',   acc: 0,  vol: '—',        dur: '—',      xp: 0   },
];

/* ── Render volume chart ── */
function renderVolumeChart() {
  const container = document.getElementById('volumeChart');
  if (!container) return;

  const maxKg = Math.max(...VOLUME_DATA.map(d => d.kg));

  VOLUME_DATA.forEach(d => {
    const pct = Math.round((d.kg / maxKg) * 100);

    const group = document.createElement('div');
    group.className = 'vol-bar-group';
    group.title = `${d.week}: ${d.kg.toLocaleString()} KG`;

    const bar = document.createElement('div');
    bar.className = 'vol-bar' +
      (d.type === 'deload' ? ' highlight' : '') +
      (d.type === 'peak'   ? ' peak'      : '');
    bar.style.height = `${pct}%`;

    const label = document.createElement('div');
    label.className = 'vol-week-label';
    label.textContent = d.week;

    group.appendChild(bar);
    group.appendChild(label);
    container.appendChild(group);
  });
}

/* ── Render log table ── */
function renderLogTable() {
  const tbody = document.getElementById('logTableBody');
  if (!tbody) return;

  LOG_ENTRIES.forEach(e => {
    const tr = document.createElement('tr');

    // Accuracy badge class
    let accClass = 'acc-high';
    if (e.acc === 0)       accClass = '';
    else if (e.acc < 80)   accClass = 'acc-low';
    else if (e.acc < 90)   accClass = 'acc-mid';

    // Status class
    let statusClass = 'status-done';
    let statusText  = '✓ COMPLETED';
    if (e.status === 'SKIPPED') { statusClass = 'status-skip'; statusText = '⊘ SKIPPED'; }
    if (e.status === 'FAILED')  { statusClass = 'status-fail'; statusText = '✕ FAILED';  }

    const accDisplay = e.acc > 0
      ? `<span class="acc-badge ${accClass}">${e.acc}%</span>`
      : `<span style="color:var(--text-muted);font-size:10px;">—</span>`;

    const xpDisplay = e.xp > 0
      ? `<span class="xp-tag">+${e.xp} XP</span>`
      : `<span style="color:var(--text-muted);">—</span>`;

    tr.innerHTML = `
      <td style="font-family:var(--mono);font-size:10px;color:var(--text-dim);letter-spacing:1px;">${e.date}</td>
      <td style="font-family:var(--mono);font-size:10px;letter-spacing:1px;color:var(--text);">${e.sector}</td>
      <td><span class="status-pill ${statusClass}">${statusText}</span></td>
      <td>${accDisplay}</td>
      <td style="font-family:var(--mono);font-size:10px;color:var(--text-dim);">${e.vol}</td>
      <td style="font-family:var(--mono);font-size:10px;color:var(--text-dim);">${e.dur}</td>
      <td>${xpDisplay}</td>
    `;
    tbody.appendChild(tr);
  });
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
  renderVolumeChart();
  renderLogTable();
});
