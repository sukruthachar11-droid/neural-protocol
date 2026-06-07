/* ════════════════════════════════════════
   workout-player.js
   Live Protocol Timer + Audio BPM Sync
   ════════════════════════════════════════ */

/* ── Session blocks ── */
const BLOCKS = [
  { name: 'WARM-UP SEQUENCE',    duration: 45, phase: 'WARM-UP // ACTIVATION',      xp: 50,  cal: 8  },
  { name: 'COMPOUND LIFT A',     duration: 60, phase: 'WORK BLOCK // SET 1',         xp: 120, cal: 18 },
  { name: 'COMPOUND LIFT B',     duration: 60, phase: 'WORK BLOCK // SET 2',         xp: 120, cal: 18 },
  { name: 'ACCESSORY CIRCUIT',   duration: 45, phase: 'ACCESSORY // ISOLATION',      xp: 90,  cal: 14 },
  { name: 'COOL-DOWN PROTOCOL',  duration: 30, phase: 'COOL-DOWN // RECOVERY',       xp: 40,  cal: 5  },
];

/* ── Track list ── */
const TRACKS = [
  { title: 'NEURAL_DRIVE_MATRIX.MP3',   artist: 'PROTOCOL_AUDIO // SECTOR_01', bpm: 142 },
  { title: 'CYBERNETIC_PULSE_V2.MP3',   artist: 'PROTOCOL_AUDIO // SECTOR_02', bpm: 148 },
  { title: 'SYNTHETIC_OVERDRIVE.MP3',   artist: 'PROTOCOL_AUDIO // SECTOR_03', bpm: 135 },
  { title: 'NEURAL_STORM_REMIX.MP3',    artist: 'PROTOCOL_AUDIO // SECTOR_04', bpm: 155 },
  { title: 'BIOMECH_FREQUENCY.MP3',     artist: 'PROTOCOL_AUDIO // SECTOR_05', bpm: 128 },
];

/* ── Timer state ── */
let currentBlockIdx = 0;
let timeRemaining   = BLOCKS[0].duration;
let totalDuration   = BLOCKS[0].duration;
let isPaused        = false;
let timerInterval   = null;

/* ── Session accumulators ── */
let elapsedSeconds  = 0;
let blocksDone      = 0;
let totalCal        = 0;
let totalXpEarned   = 0;
let elapsedInterval = null;

/* ── Audio state ── */
let currentTrackIdx = 0;
let audioPlaying    = true;

/* ════════════════════════════════════════
   TIMER
   ════════════════════════════════════════ */

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

function updateTimerUI() {
  const digits = document.getElementById('timerDigits');
  const fill   = document.getElementById('timerProgressFill');
  const phase  = document.getElementById('timerPhaseLabel');

  digits.textContent = formatTime(timeRemaining);
  phase.textContent  = BLOCKS[currentBlockIdx].phase;

  const pct = (timeRemaining / totalDuration) * 100;
  fill.style.width = `${pct}%`;

  // Colour states
  digits.classList.remove('warning','critical');
  fill.style.background = 'var(--red)';
  if (timeRemaining <= 10) {
    digits.classList.add('critical');
    fill.style.background = 'var(--red)';
  } else if (timeRemaining <= 20) {
    digits.classList.add('warning');
    fill.style.background = 'var(--yellow)';
  }
}

function tickTimer() {
  if (isPaused) return;
  if (timeRemaining > 0) {
    timeRemaining--;
    updateTimerUI();
  } else {
    advanceBlock();
  }
}

function advanceBlock() {
  // Award XP + cal for completed block
  totalCal       += BLOCKS[currentBlockIdx].cal;
  totalXpEarned  += BLOCKS[currentBlockIdx].xp;
  blocksDone++;
  updateSessionStats();

  // Mark block done in queue
  const doneEl = document.getElementById(`block-${currentBlockIdx}`);
  if (doneEl) {
    doneEl.classList.remove('active-block');
    doneEl.classList.add('done-block');
  }

  currentBlockIdx++;

  if (currentBlockIdx >= BLOCKS.length) {
    // Session complete
    clearInterval(timerInterval);
    clearInterval(elapsedInterval);
    document.getElementById('timerDigits').textContent = 'DONE';
    document.getElementById('timerDigits').classList.remove('warning','critical');
    document.getElementById('timerPhaseLabel').textContent = 'SESSION COMPLETE // PROTOCOL EXECUTED';
    document.getElementById('timerProgressFill').style.width = '0%';
    document.getElementById('timerStatusBadge').textContent = '✓ COMPLETE';
    document.getElementById('timerStatusBadge').style.color = 'var(--green)';
    document.getElementById('pauseBtn').disabled = true;
    showToast('SESSION COMPLETE // XP AWARDED: ' + totalXpEarned + ' PTS');
    return;
  }

  // Load next block
  timeRemaining = BLOCKS[currentBlockIdx].duration;
  totalDuration = BLOCKS[currentBlockIdx].duration;
  updateTimerUI();

  // Activate next block in queue
  const nextEl = document.getElementById(`block-${currentBlockIdx}`);
  if (nextEl) nextEl.classList.add('active-block');

  showToast(`BLOCK COMPLETE // NEXT: ${BLOCKS[currentBlockIdx].name}`);

  // Auto-advance track to match intensity
  if (currentBlockIdx === 1 || currentBlockIdx === 2) selectTrack(1);
  if (currentBlockIdx === 3) selectTrack(2);
  if (currentBlockIdx === 4) selectTrack(4);
}

function togglePause() {
  isPaused = !isPaused;
  const btn   = document.getElementById('pauseBtn');
  const label = document.getElementById('pauseBtnLabel');
  const badge = document.getElementById('timerStatusBadge');
  const sw    = document.getElementById('soundwave');
  const disc  = document.getElementById('audioDisc');

  if (isPaused) {
    label.textContent = 'RESUME SEQUENCE';
    btn.style.borderColor = 'var(--green)';
    btn.style.color = 'var(--green)';
    badge.textContent = '⏸ PAUSED';
    badge.style.color = 'var(--yellow)';
    sw.classList.add('paused');
    disc.classList.remove('spinning');
    document.getElementById('audioStatusBadge').textContent = '⏸ PAUSED';
    document.getElementById('audioStatusBadge').style.color = 'var(--yellow)';
  } else {
    label.textContent = 'PAUSE SEQUENCE';
    btn.style.borderColor = 'var(--yellow)';
    btn.style.color = 'var(--yellow)';
    badge.textContent = '● RUNNING';
    badge.style.color = 'var(--red)';
    sw.classList.remove('paused');
    disc.classList.add('spinning');
    document.getElementById('audioStatusBadge').textContent = '◉ SYNCED';
    document.getElementById('audioStatusBadge').style.color = 'var(--green)';
  }
}

function skipBlock() {
  showToast(`SKIPPING // ${BLOCKS[currentBlockIdx].name}`);
  timeRemaining = 0;
  advanceBlock();
}

function resetTimer() {
  clearInterval(timerInterval);
  clearInterval(elapsedInterval);
  currentBlockIdx = 0;
  timeRemaining   = BLOCKS[0].duration;
  totalDuration   = BLOCKS[0].duration;
  isPaused        = false;
  elapsedSeconds  = 0;
  blocksDone      = 0;
  totalCal        = 0;
  totalXpEarned   = 0;

  // Reset pause button state
  const btn = document.getElementById('pauseBtn');
  btn.disabled = false;
  btn.style.borderColor = '';
  btn.style.color = '';
  document.getElementById('pauseBtnLabel').textContent = 'PAUSE SEQUENCE';
  document.getElementById('timerStatusBadge').textContent = '● RUNNING';
  document.getElementById('timerStatusBadge').style.color = 'var(--red)';
  document.getElementById('soundwave').classList.remove('paused');
  document.getElementById('audioDisc').classList.add('spinning');
  document.getElementById('audioStatusBadge').textContent = '◉ SYNCED';
  document.getElementById('audioStatusBadge').style.color = 'var(--green)';

  updateTimerUI();
  updateSessionStats();
  renderBlockQueue();
  startIntervals();
  showToast('PROTOCOL RESET // SEQUENCE RESTARTED');
}

/* ── Elapsed session clock ── */
function tickElapsed() {
  if (isPaused) return;
  elapsedSeconds++;
  document.getElementById('elapsedDisplay').textContent = formatTime(elapsedSeconds);
  // Accumulate cal estimate (rough: 0.15 kcal/sec during work blocks)
  if (currentBlockIdx >= 1 && currentBlockIdx <= 3) {
    totalCal = Math.round(totalCal + 0.15);
  }
  updateSessionStats();
}

function updateSessionStats() {
  document.getElementById('blocksDoneDisplay').textContent = blocksDone;
  document.getElementById('calDisplay').textContent        = totalCal;
  document.getElementById('xpDisplay').textContent         = totalXpEarned;
}

/* ── Block queue render ── */
function renderBlockQueue() {
  const container = document.getElementById('blockQueue');
  container.innerHTML = '';
  BLOCKS.forEach((b, i) => {
    const el = document.createElement('div');
    el.className = 'block-item' + (i === 0 ? ' active-block' : '');
    el.id = `block-${i}`;
    el.innerHTML = `
      <div class="block-dot"></div>
      <span class="block-name">${b.name}</span>
      <span class="block-dur">${formatTime(b.duration)}</span>
    `;
    container.appendChild(el);
  });
}

/* ════════════════════════════════════════
   AUDIO
   ════════════════════════════════════════ */

function renderTrackList() {
  const list = document.getElementById('trackList');
  list.innerHTML = '';
  TRACKS.forEach((t, i) => {
    const el = document.createElement('div');
    el.className = 'track-item' + (i === 0 ? ' playing' : '');
    el.id = `track-${i}`;
    el.onclick = () => selectTrack(i);
    el.innerHTML = `
      <span class="track-num">${String(i + 1).padStart(2,'0')}</span>
      <div class="track-info">
        <div class="track-title">${t.title}</div>
        <div class="track-detail">${t.artist}</div>
      </div>
      <span class="track-bpm">${t.bpm} BPM</span>
    `;
    list.appendChild(el);
  });
}

function selectTrack(idx) {
  // Deactivate old
  const old = document.getElementById(`track-${currentTrackIdx}`);
  if (old) old.classList.remove('playing');

  currentTrackIdx = idx;
  const t = TRACKS[currentTrackIdx];

  // Activate new
  const el = document.getElementById(`track-${currentTrackIdx}`);
  if (el) el.classList.add('playing');

  // Update header
  document.getElementById('nowPlayingName').textContent   = t.title;
  document.getElementById('nowPlayingArtist').textContent = t.artist;
  document.getElementById('audioBpmDisplay').textContent  = t.bpm;
}

function toggleAudio() {
  audioPlaying = !audioPlaying;
  const sw    = document.getElementById('soundwave');
  const disc  = document.getElementById('audioDisc');
  const icon  = document.getElementById('audioPlayIcon');
  const label = document.getElementById('audioPlayLabel');
  const btn   = document.getElementById('audioPlayBtn');

  if (audioPlaying) {
    sw.classList.remove('paused');
    disc.classList.add('spinning');
    icon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
    label.textContent = 'PAUSE';
    btn.classList.add('active-audio');
    document.getElementById('audioStatusBadge').textContent = '◉ SYNCED';
    document.getElementById('audioStatusBadge').style.color = 'var(--green)';
  } else {
    sw.classList.add('paused');
    disc.classList.remove('spinning');
    icon.innerHTML = '<path d="M8 5v14l11-7z"/>';
    label.textContent = 'PLAY';
    btn.classList.remove('active-audio');
    document.getElementById('audioStatusBadge').textContent = '⏸ PAUSED';
    document.getElementById('audioStatusBadge').style.color = 'var(--yellow)';
  }
}

function nextTrack() {
  selectTrack((currentTrackIdx + 1) % TRACKS.length);
}

function prevTrack() {
  selectTrack((currentTrackIdx - 1 + TRACKS.length) % TRACKS.length);
}

/* ════════════════════════════════════════
   INIT
   ════════════════════════════════════════ */

function startIntervals() {
  timerInterval   = setInterval(tickTimer,   1000);
  elapsedInterval = setInterval(tickElapsed, 1000);
}

function loadSwtBalance() {
  const stored = localStorage.getItem('swtBalance');
  const el = document.getElementById('totalXP');
  if (el) el.textContent = stored ? Number(stored).toLocaleString() : '2,475';
}

document.addEventListener('DOMContentLoaded', () => {
  loadSwtBalance();
  startBpmSimulation();
  renderBlockQueue();
  renderTrackList();
  updateTimerUI();
  startIntervals();
});
