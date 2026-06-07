/* ════════════════════════════════════════
   display.js — Render results on separate page
   ════════════════════════════════════════ */

// High-fidelity exercise lookup map matching the backend goals & workout types
const EXERCISE_MAP = {
  // Muscle Gain Categories
  'Chest': [
    { name: 'Barbell Bench Press', reps: '8-12 reps' },
    { name: 'Incline Dumbbell Press', reps: '10 reps' },
    { name: 'Dumbbell Chest Flyes', reps: '12 reps' }
  ],
  'Back': [
    { name: 'Weighted Pull-Ups', reps: '8-10 reps' },
    { name: 'Barbell Bent-Over Rows', reps: '10 reps' },
    { name: 'Lat Pulldowns (Wide-Grip)', reps: '12 reps' }
  ],
  'Legs': [
    { name: 'Barbell Back Squats', reps: '8-12 reps' },
    { name: 'Romanian Deadlifts', reps: '10 reps' },
    { name: 'Seated Calf Raises', reps: '15 reps' }
  ],
  'Shoulders': [
    { name: 'Seated Military Press', reps: '8-10 reps' },
    { name: 'Dumbbell Lateral Raises', reps: '12-15 reps' },
    { name: 'Face Pulls (Cable)', reps: '15 reps' }
  ],
  'Arms': [
    { name: 'Barbell Bicep Curls', reps: '10-12 reps' },
    { name: 'Tricep Rope Pushdowns', reps: '12 reps' },
    { name: 'Incline Hammer Curls', reps: '12 reps' }
  ],

  // Fat Loss Categories
  'Upper Body HIIT': [
    { name: 'Burpee to Press', reps: '45s Work' },
    { name: 'Plyo Push-Ups', reps: '30s Work' },
    { name: 'Mountain Climbers', reps: '45s Work' }
  ],
  'Lower Body HIIT': [
    { name: 'Jump Squats', reps: '45s Work' },
    { name: 'Alternating Jump Lunges', reps: '45s Work' },
    { name: 'High Knees Sprint', reps: '45s Work' }
  ],
  'Core + Cardio': [
    { name: 'Plank Shoulder Taps', reps: '45s Work' },
    { name: 'Russian Twists', reps: '60s Work' },
    { name: 'Jumping Jacks', reps: '60s Work' }
  ],
  'Full Body Burn': [
    { name: 'Kettlebell Swings', reps: '45s Work' },
    { name: 'Dumbbell Thrusters', reps: '45s Work' },
    { name: 'Bicycle Crunches', reps: '45s Work' }
  ],
  'Circuit Training': [
    { name: 'Wall Ball Shots', reps: '45s Work' },
    { name: 'Box Jumps', reps: '45s Work' },
    { name: 'Renegade Rows', reps: '45s Work' }
  ],
  'Tabata': [
    { name: 'Tabata Burpees', reps: '20s Work / 10s Rest' },
    { name: 'Tabata Air Squats', reps: '20s Work / 10s Rest' },
    { name: 'Tabata Mountain Climbers', reps: '20s Work / 10s Rest' }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  const dataStr = sessionStorage.getItem('workoutData');
  
  if (!dataStr) {
    // Redirect back to index if no data found
    window.location.href = 'index.html';
    return;
  }
  
  try {
    const data = JSON.parse(dataStr);
    
    // Kick off live BPM ticker from ui.js
    if (typeof startBpmSimulation === 'function') {
      startBpmSimulation();
    }
    
    renderPlan(data);
  } catch (err) {
    console.error('Failed to parse workout data', err);
    window.location.href = 'index.html';
  }
});

function renderPlan(data) {
  const plan    = data.plan    || [];
  const totalXP = data.totalXP || 0;
  const goalLabel = (data.goal || '').replace(/_/g, ' ').toUpperCase();
  const experience = data.experience || 'beginner';
  const recoveryScore = typeof data.recoveryScore !== 'undefined' ? data.recoveryScore : 75;

  /* ── Sidebar & Header Assets ── */
  const totalXPEl = document.getElementById('totalXP');
  if (totalXPEl) {
    let balance = localStorage.getItem('swtBalance');
    if (balance === null) {
      balance = 2450 + Math.round(totalXP / 10);
      localStorage.setItem('swtBalance', balance);
    } else {
      balance = parseInt(balance, 10);
    }
    totalXPEl.textContent = balance.toLocaleString();
  }

  /* ── XP banner ── */
  document.getElementById('xpValue').textContent = totalXP.toLocaleString() + ' XP';
  document.getElementById('xpMeta').textContent  =
    `${goalLabel} · ${data.days} DAYS · ${experience.toUpperCase()}`;

  /* ── Right Panel Recovery & Bio ── */
  const readinessNumberEl = document.getElementById('readinessNumber');
  const rightBarFillEl = document.getElementById('rightBarFill');
  const readinessStatusEl = document.getElementById('readinessStatus');

  if (readinessNumberEl) readinessNumberEl.textContent = recoveryScore;
  if (rightBarFillEl) rightBarFillEl.style.height = recoveryScore + '%';

  if (readinessStatusEl) {
    let statusHTML;
    if (recoveryScore >= CONFIG.RECOVERY.HIGH) {
      statusHTML = 'Neural Load Optimized. Intensity Boost<br>'
                 + '<span class="readiness-status" style="color:#00FF88">Ready for Protocol.</span>';
    } else if (recoveryScore >= CONFIG.RECOVERY.MID) {
      statusHTML = 'Moderate Load Detected. Balanced Plan<br>'
                 + '<span class="readiness-status" style="color:#FFD700">Proceed with Caution.</span>';
    } else {
      statusHTML = 'Recovery Deficit Detected. Reduce Load<br>'
                 + '<span class="readiness-status" style="color:#FF1A1A">Light Protocol Only.</span>';
    }
    readinessStatusEl.innerHTML = statusHTML;
  }

  /* ── Day Cards & Stat Computations ── */
  const grid = document.getElementById('planGrid');
  grid.innerHTML = '';

  let totalCalories = 0;
  let activeDaysCount = 0;
  let totalSetsOnActiveDays = 0;

  plan.forEach((d, i) => {
    const isRest = d.workout === 'REST DAY';
    
    let duration = 0;
    let calories = 0;
    let bpmRange = '—';
    let intensityLabel = 'NONE';
    let intensityClass = 'intensity-low';
    let exercisesHTML = '';

    if (!isRest) {
      activeDaysCount++;
      totalSetsOnActiveDays += d.sets;

      // Classify intensity and set stats
      const isFatLoss = data.goal === 'fat_loss';
      duration = d.sets * (isFatLoss ? 8 : 10);
      
      let expMultiplier = 1;
      if (experience === 'intermediate') expMultiplier = 1.25;
      if (experience === 'advanced') expMultiplier = 1.5;
      
      calories = Math.round(d.sets * (isFatLoss ? 65 : 45) * expMultiplier);
      totalCalories += calories;

      bpmRange = isFatLoss ? '145-165' : '120-140';

      if (d.sets <= 2) {
        intensityLabel = 'LOW';
        intensityClass = 'intensity-low';
      } else if (d.sets === 3) {
        intensityLabel = 'MODERATE';
        intensityClass = 'intensity-moderate';
      } else if (d.sets === 4) {
        intensityLabel = 'HIGH';
        intensityClass = 'intensity-high';
      } else {
        intensityLabel = 'MAXIMAL';
        intensityClass = 'intensity-maximal';
      }

      // Map exercises for this category
      const targetKey = Object.keys(EXERCISE_MAP).find(k => k.toLowerCase() === d.workout.toLowerCase()) || d.workout;
      const exercises = EXERCISE_MAP[targetKey] || [
        { name: `${d.workout} Drill A`, reps: '10-12 reps' },
        { name: `${d.workout} Drill B`, reps: '12 reps' }
      ];

      exercisesHTML = exercises.map(ex => `
        <div class="exercise-item">
          <span class="exercise-name">${ex.name}</span>
          <span class="exercise-details">${d.sets} × ${ex.reps}</span>
        </div>
      `).join('');
    }

    const card = document.createElement('div');
    card.className = 'plan-day' + (isRest ? ' rest' : '');
    card.style.animationDelay = (i * 0.04) + 's';

    if (!isRest) {
      card.innerHTML = `
        <div class="plan-day-header">
          <span class="plan-day-num">${d.day}</span>
          <span class="plan-day-status">ACTIVE</span>
        </div>
        <div class="plan-day-title">${d.workout}</div>
        
        <div class="plan-day-stats-row">
          <div class="plan-day-stat">
            <span class="stat-icon">⏱</span>
            <span class="stat-label">${duration} MINS</span>
          </div>
          <div class="plan-day-stat">
            <span class="stat-icon">🔥</span>
            <span class="stat-label">${calories} KCAL</span>
          </div>
          <div class="plan-day-stat">
            <span class="stat-icon">💓</span>
            <span class="stat-label">${bpmRange} BPM</span>
          </div>
        </div>

        <div class="exercise-list">
          <div class="exercise-list-header">EXERCISE PROTOCOL</div>
          ${exercisesHTML}
        </div>

        <div class="plan-day-footer">
          <div class="sets-pill">${d.sets} SETS PER EXERCISE</div>
          <div class="intensity-indicator ${intensityClass}">${intensityLabel} INTENSITY</div>
        </div>
        <div class="plan-day-corner"></div>
      `;
    } else {
      card.innerHTML = `
        <div class="plan-day-header">
          <span class="plan-day-num">${d.day}</span>
          <span class="plan-day-status">RECOVERY</span>
        </div>
        <div class="plan-day-title">REST DAY</div>
        
        <div class="rest-message">
          <div class="rest-icon">⚡</div>
          <div class="rest-title">SYSTEM recalibration</div>
          <div class="rest-desc">Allow muscle tissue to repair and nervous system to restore energy reserves. Maintain high protein intake.</div>
        </div>
        <div class="plan-day-corner"></div>
      `;
    }

    grid.appendChild(card);
  });

  /* ── Right Panel Stats Grid ── */
  const statCalEl = document.getElementById('statCal');
  const statDaysEl = document.getElementById('statDays');
  const statSetsEl = document.getElementById('statSets');
  const statXPEl = document.getElementById('statXP');

  if (statCalEl) statCalEl.textContent = totalCalories.toLocaleString();
  if (statDaysEl) statDaysEl.textContent = activeDaysCount;
  
  const avgSets = activeDaysCount > 0 ? Math.round(totalSetsOnActiveDays / activeDaysCount) : 0;
  if (statSetsEl) statSetsEl.textContent = avgSets;
  if (statXPEl) statXPEl.textContent = totalXP.toLocaleString();
}
