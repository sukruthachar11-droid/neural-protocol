/* ════════════════════════════════════════
   ai-coach.js — AI Coach chat portal logic
   Response engine, chat rendering, typing indicator
   ════════════════════════════════════════ */

/* ── In-memory chat session (not persisted to localStorage) ── */
const _chatSession = [];

/* ── Response engine: keyword rules ── */
const RESPONSE_RULES = [
  {
    category: 'sleep',
    keywords: ['sleep', 'slept', 'tired', 'exhausted', 'fatigue', 'fatigued', 'rest', '4 hours', '3 hours', '5 hours', 'no sleep', 'insomnia'],
    responses: [
      'SLEEP DEFICIT DETECTED // Neural recovery telemetry shows sub-optimal restoration. Recalibrating today\'s protocol: drop all heavy compound lifts. Replace with mobility circuits, light resistance bands, and 20-min low-intensity cardio. Prioritize sleep architecture tonight — 7–9 hours minimum for full neural reload.',
      'RECOVERY SCAN: COMPROMISED // Sleep deprivation suppresses CNS output by up to 30%. Today\'s sector is being downgraded to active recovery mode. Recommended: 15-min foam roll sequence, bodyweight flow, and 10-min breathwork calibration. No heavy loading until sleep debt is cleared.',
    ],
  },
  {
    category: 'pain',
    keywords: ['pain', 'hurt', 'hurts', 'injury', 'injured', 'sore', 'ache', 'aching', 'knee', 'shoulder', 'back', 'wrist', 'ankle', 'strain', 'sprain', 'pulled'],
    responses: [
      'INJURY SIGNAL INTERCEPTED // Biomechanical alert flagged. Isolating affected sector from today\'s protocol. Activating pain-avoidance routing: substitute all movements loading the compromised joint with unilateral alternatives or upper/lower split that bypasses the zone. If pain exceeds 4/10, stand down and consult a medical operator.',
      'DAMAGE REPORT RECEIVED // Neural Protocol is rerouting your session around the compromised sector. Focus on antagonist muscle groups today. Ice the affected area post-session, elevate if possible. Persistent pain beyond 72 hours requires external diagnostic calibration — do not override the signal.',
    ],
  },
  {
    category: 'high_energy',
    keywords: ['energized', 'energy', 'pumped', 'strong', 'great', 'amazing', 'push harder', 'push me', 'max out', 'beast mode', 'fired up', 'ready', 'let\'s go', 'go hard'],
    responses: [
      'PEAK OUTPUT DETECTED // Neural load is optimal. Green-lighting intensity override: add one working set to each compound movement, reduce rest intervals by 15 seconds, and target progressive overload on your primary lifts. Your telemetry is primed — execute with precision.',
      'SYSTEM STATUS: FULLY CHARGED // Biometric readiness confirmed. Today is a PR attempt day. Warm up thoroughly, then push your top sets to RPE 9. Log every rep — this data feeds your next protocol cycle. Maximum output authorized.',
    ],
  },
  {
    category: 'low_energy',
    keywords: ['weak', 'low energy', 'drained', 'sluggish', 'slow', 'unmotivated', 'can\'t', 'cannot', 'no energy', 'feel bad', 'off day', 'not feeling it'],
    responses: [
      'LOW OUTPUT SIGNAL DETECTED // Recalibrating intensity parameters. Today\'s protocol is shifting to maintenance mode: keep all sets at RPE 6–7, reduce volume by 20%, and extend warm-up to 10 minutes. Movement is still the directive — low-intensity execution beats zero input every cycle.',
      'ENERGY DEFICIT LOGGED // Neural systems are running on reserve power. Recommended protocol: full-body circuit at 60% intensity, 45-second rest between sets. Focus on form telemetry rather than load. Nutrition check: have you consumed adequate carbohydrates and hydration today?',
    ],
  },
  {
    category: 'stress',
    keywords: ['stress', 'stressed', 'anxious', 'anxiety', 'overwhelmed', 'pressure', 'mental', 'burnout', 'burnt out', 'tense', 'tension', 'worried', 'work'],
    responses: [
      'CORTISOL SPIKE DETECTED // High psychological stress elevates cortisol, which degrades muscle protein synthesis and impairs recovery. Today\'s directive: replace high-intensity training with a 30-min moderate cardio session — this actively reduces cortisol levels. Breathwork protocol: 4-7-8 breathing for 5 minutes pre-session.',
      'STRESS LOAD FLAGGED // Neural Protocol recommends a deload sector today. Light movement, yoga flow, or a 20-min walk will regulate your autonomic nervous system more effectively than heavy lifting under stress. Your protocol will still be there tomorrow — protect the long-term system.',
    ],
  },
  {
    category: 'nutrition',
    keywords: ['eat', 'food', 'nutrition', 'diet', 'meal', 'protein', 'carbs', 'calories', 'hungry', 'fasted', 'pre-workout', 'post-workout', 'supplement', 'creatine', 'hydration', 'water'],
    responses: [
      'NUTRITION TELEMETRY QUERY // Pre-workout fuel directive: consume 30–50g fast-digesting carbohydrates and 20–30g protein 60–90 minutes before your session. Hydration baseline: 500ml water pre-session, 200ml every 20 minutes during. Avoid high-fat meals within 2 hours of training — they slow gastric emptying and blunt output.',
      'FUEL SYSTEM ANALYSIS // Post-workout recovery window is 30–45 minutes. Priority: 40–50g protein (whey or whole food) + 60–80g carbohydrates to replenish glycogen stores. Creatine monohydrate (5g/day) is the most evidence-backed performance supplement in the protocol database. Consistency over timing.',
    ],
  },
  {
    category: 'motivation',
    keywords: ['motivate', 'motivation', 'inspire', 'give up', 'quit', 'quitting', 'why', 'purpose', 'goal', 'worth it', 'hard', 'difficult', 'struggle'],
    responses: [
      'MOTIVATIONAL UPLINK INITIATED // Every rep you complete when you don\'t want to is a neural pathway being reinforced. The protocol doesn\'t care about your mood — it cares about your consistency. Show up. Execute. The results are a mathematical certainty if you stay in the system.',
      'DIRECTIVE FROM NEURAL COACH // The gap between who you are and who you want to be is closed one session at a time. You\'re not training for today — you\'re calibrating the version of yourself that exists 90 days from now. That pilot needs you to execute today\'s sector. Commence.',
    ],
  },
  {
    category: 'recovery',
    keywords: ['recover', 'recovery', 'rest day', 'overtraining', 'overtrained', 'muscle soreness', 'doms', 'stiff', 'tight'],
    responses: [
      'RECOVERY PROTOCOL ENGAGED // Active recovery is not optional — it\'s a performance multiplier. Today\'s directive: 20-min low-intensity cardio (zone 2), full-body foam roll sequence, and contrast shower (3 min hot / 1 min cold × 3 cycles). Sleep 8 hours. Your muscles grow during recovery, not during the session.',
      'SYSTEM MAINTENANCE MODE // DOMS indicates muscle adaptation is occurring — this is the signal, not the problem. Light movement accelerates clearance of metabolic waste. Recommended: 30-min walk, dynamic stretching, and adequate protein intake (1.6–2.2g per kg bodyweight). You\'re on track.',
    ],
  },
];

/* Fallback responses when no keyword matches */
const FALLBACK_RESPONSES = [
  'SIGNAL RECEIVED // Neural Coach is processing your input. For optimal protocol calibration, describe your current physical state: sleep quality (1–10), energy level (1–10), any pain or discomfort, and stress level. The more telemetry you provide, the more precise the adaptation.',
  'INPUT LOGGED // Your condition has been registered in the adaptive system. To generate a targeted protocol modification, try describing specific symptoms — e.g., fatigue level, muscle soreness location, or mental state. Neural Coach is standing by for your full biometric report.',
  'ADAPTIVE GUIDE ONLINE // I\'m here to calibrate your protocol to your real-world conditions. Tell me how you\'re feeling today — physically and mentally — and I\'ll adjust your session parameters accordingly. No generic plans. Only precision-tuned protocols.',
];

/* Greeting shown on page load */
const GREETING = 'NEURAL COACH ONLINE // ADAPTIVE_GUIDE v2.4 INITIALIZED\n\nPilot, I am your real-time protocol calibration system. Transmit your current physical and mental conditions — sleep quality, energy levels, pain signals, stress load, or nutritional status — and I will adapt your training protocol accordingly.\n\nYour session is not fixed. It responds to you.';

/* ── Utility: timestamp ── */
function _timestamp() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/* ── Render a message bubble into the chat window ── */
function renderMessage(role, text) {
  const win = document.getElementById('chatWindow');

  const wrapper = document.createElement('div');
  wrapper.className = `msg ${role}`;

  const meta = document.createElement('div');
  meta.className = 'msg-meta';
  meta.textContent = role === 'coach'
    ? `NEURAL COACH // ${_timestamp()}`
    : `PILOT // ${_timestamp()}`;

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  // Preserve newlines in coach messages
  bubble.style.whiteSpace = 'pre-wrap';
  bubble.textContent = text;

  wrapper.appendChild(meta);
  wrapper.appendChild(bubble);
  win.appendChild(wrapper);

  // Store in session memory
  _chatSession.push({ role, text, time: _timestamp() });

  // Auto-scroll to bottom
  win.scrollTop = win.scrollHeight;
}

/* ── Show / remove typing indicator ── */
function showTypingIndicator() {
  const win = document.getElementById('chatWindow');
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.id = 'typingIndicator';
  indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  win.appendChild(indicator);
  win.scrollTop = win.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

/* ── Response engine: keyword matching ── */
function getCoachResponse(userText) {
  const lower = userText.toLowerCase();
  const matched = [];

  for (const rule of RESPONSE_RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        matched.push(rule);
        break; // one match per category is enough
      }
    }
  }

  if (matched.length === 0) {
    // Fallback
    return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  }

  if (matched.length === 1) {
    const pool = matched[0].responses;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Multi-keyword: combine the first two matched categories
  const r1 = matched[0].responses[Math.floor(Math.random() * matched[0].responses.length)];
  const r2 = matched[1].responses[Math.floor(Math.random() * matched[1].responses.length)];
  return `COMPOUND SIGNAL DETECTED // Multiple condition flags active.\n\n[${matched[0].category.toUpperCase()}] ${r1}\n\n[${matched[1].category.toUpperCase()}] ${r2}`;
}

/* ── Core send flow ── */
function submitMessage(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  // Clear input
  document.getElementById('chatInput').value = '';

  // Render user bubble
  renderMessage('user', trimmed);

  // Show typing indicator
  showTypingIndicator();

  // Simulate processing delay (800–2000ms)
  const delay = 800 + Math.random() * 1200;
  setTimeout(() => {
    removeTypingIndicator();
    const response = getCoachResponse(trimmed);
    renderMessage('coach', response);
  }, delay);
}

/* ── Event handlers ── */
function handleSend() {
  const input = document.getElementById('chatInput');
  submitMessage(input.value);
}

function sendChip(btn) {
  submitMessage(btn.textContent);
}

/* ── SWT balance from localStorage ── */
function loadSwtBalance() {
  const stored = localStorage.getItem('swtBalance');
  const el = document.getElementById('totalXP');
  if (el) {
    el.textContent = stored ? Number(stored).toLocaleString() : '2,475';
  }
}

/* ── Init on page load ── */
document.addEventListener('DOMContentLoaded', () => {
  // Load SWT balance
  loadSwtBalance();

  // Start BPM simulation (from ui.js)
  startBpmSimulation();

  // Render greeting
  renderMessage('coach', GREETING);

  // Enter key to send
  document.getElementById('chatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  });
});
