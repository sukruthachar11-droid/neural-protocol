/* ════════════════════════════════════════
   duels.js — Community challenges & leaderboards logic
   ════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Synchronize and update wallet balance
  initWalletBalance();

  // Populate leaderboard user row details dynamically
  initLeaderboardUser();

  // Restore already joined duels
  initJoinedDuels();

  // Bind right panel biometrics dynamic stats
  loadBioStats();

  // Start live BPM simulation from ui.js
  if (typeof startBpmSimulation === 'function') {
    startBpmSimulation();
  }
});

/**
 * Syncs the total stored assets balance.
 */
function initWalletBalance() {
  let balance = localStorage.getItem('swtBalance');
  if (balance === null) {
    balance = 2475;
    localStorage.setItem('swtBalance', balance);
  } else {
    balance = parseInt(balance, 10);
  }

  const totalXPEl = document.getElementById('totalXP');
  if (totalXPEl) {
    totalXPEl.textContent = balance.toLocaleString();
  }
}

/**
 * Dynamic mapping of active pilot details to leaderboard rankings.
 */
function initLeaderboardUser() {
  const pilotNameEl = document.getElementById('leaderboardPilotName');
  const pilotLevelEl = document.getElementById('leaderboardPilotLevel');
  const pilotStreakEl = document.getElementById('leaderboardPilotStreak');
  const pilotTokensEl = document.getElementById('leaderboardPilotTokens');

  // 1. Fetch Pilot name
  const savedName = localStorage.getItem('pilotName') || 'NEURAL_PILOT';
  if (pilotNameEl) {
    pilotNameEl.textContent = `${savedName} // YOU`;
  }

  // 2. Fetch active workout data
  const dataStr = sessionStorage.getItem('workoutData');
  let totalXP = 1450;
  let activeStreak = 5;

  if (dataStr) {
    try {
      const parsed = JSON.parse(dataStr);
      if (parsed) {
        if (parsed.totalXP) totalXP = parsed.totalXP;
        
        // calculate a dynamic streak based on active days completed
        if (parsed.plan && parsed.plan.length > 0) {
          const activeDays = parsed.plan.filter(d => d.workout !== 'REST DAY').length;
          activeStreak = Math.min(7, Math.max(1, Math.round(activeDays / 2)));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Calculate level based on XP
  const level = Math.floor(totalXP / 100) + 1;

  if (pilotLevelEl) {
    pilotLevelEl.innerHTML = `Level ${level} // <span style="color:var(--text-dim)">${totalXP.toLocaleString()} XP</span>`;
  }

  if (pilotStreakEl) {
    pilotStreakEl.textContent = `${activeStreak} Days 🔥`;
  }

  // 3. Fetch active token balance
  let balance = localStorage.getItem('swtBalance');
  if (balance === null) balance = 2475;
  else balance = parseInt(balance, 10);

  if (pilotTokensEl) {
    pilotTokensEl.textContent = `${balance.toLocaleString()} $SWT`;
  }
}

/**
 * Restores and locks engaged button states for joined duels.
 */
function initJoinedDuels() {
  let joined = localStorage.getItem('swtJoinedDuels');
  if (!joined) {
    joined = [];
    localStorage.setItem('swtJoinedDuels', JSON.stringify(joined));
  } else {
    try {
      joined = JSON.parse(joined);
    } catch (e) {
      joined = [];
    }
  }

  joined.forEach(duelId => {
    const card = document.getElementById(duelId);
    if (card) {
      const btn = card.querySelector('.duel-commence-btn');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span>🟢 Engaged // Active</span>';
      }
    }
  });
}

/**
 * Clicks JOIN DUEL — validates balance, subtracts fee, and registers enrollment.
 */
window.joinDuel = function(duelId, fee, title) {
  let balance = localStorage.getItem('swtBalance');
  if (balance === null) balance = 2475;
  else balance = parseInt(balance, 10);

  const toast = document.getElementById('toast');

  if (balance >= fee) {
    // 1. Deduct cost
    const newBalance = balance - fee;
    localStorage.setItem('swtBalance', newBalance);
    
    const totalXPEl = document.getElementById('totalXP');
    if (totalXPEl) totalXPEl.textContent = newBalance.toLocaleString();
    
    const pilotTokensEl = document.getElementById('leaderboardPilotTokens');
    if (pilotTokensEl) pilotTokensEl.textContent = `${newBalance.toLocaleString()} $SWT`;

    // 2. Add duel ID to joined list
    let joined = [];
    try {
      joined = JSON.parse(localStorage.getItem('swtJoinedDuels')) || [];
    } catch (e) {
      joined = [];
    }
    if (!joined.includes(duelId)) {
      joined.push(duelId);
      localStorage.setItem('swtJoinedDuels', JSON.stringify(joined));
    }

    // 3. Log dynamic entry fee transaction in sweat to earn history
    let transactions = [];
    try {
      transactions = JSON.parse(localStorage.getItem('swtTransactions')) || [];
    } catch (e) {
      transactions = [];
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const sectorKey = title.toUpperCase().replace(/\s+/g, '_');

    transactions.unshift({
      date: timestamp,
      sector: `DUEL_FEE_${sectorKey}`,
      type: 'Challenge Fee Staked',
      delta: `-${fee} $SWT`,
      status: 'VERIFIED'
    });

    localStorage.setItem('swtTransactions', JSON.stringify(transactions));

    // 4. Update button visuals
    const card = document.getElementById(duelId);
    if (card) {
      const btn = card.querySelector('.duel-commence-btn');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span>🟢 Engaged // Active</span>';
      }
    }

    // 5. Trigger Success cyber-toast
    if (toast) {
      toast.className = 'toast show success';
      toast.innerHTML = `<span>✔️ COMMENCED: ENGAGED CHALLENGE "${title.toUpperCase()}" [-${fee} $SWT]</span>`;
      setTimeout(() => toast.classList.remove('show'), 4000);
    }

  } else {
    // 6. Trigger Failure cyber-toast
    if (toast) {
      toast.className = 'toast show error';
      toast.innerHTML = `<span>❌ ACCESS DENIED: INSUFFICIENT SWT FUNDS FOR DUEL ENTRY FEE</span>`;
      setTimeout(() => toast.classList.remove('show'), 4000);
    }
  }
};

/**
 * Loads dynamic biometrics/plan stats from sessionStorage into Symmetrical Right Panel.
 */
function loadBioStats() {
  const dataStr = sessionStorage.getItem('workoutData');

  const readinessNumberEl = document.getElementById('readinessNumber');
  const rightBarFillEl = document.getElementById('rightBarFill');
  const readinessStatusEl = document.getElementById('readinessStatus');
  const statCalEl = document.getElementById('statCal');
  const statDaysEl = document.getElementById('statDays');
  const statSetsEl = document.getElementById('statSets');
  const statXPEl = document.getElementById('statXP');

  // Standard fallback default stats
  let data = {
    goal: 'muscle_gain',
    experience: 'intermediate',
    days: 28,
    recoveryScore: 85,
    totalXP: 1450,
    plan: []
  };

  let hasCustomProtocol = false;

  if (dataStr) {
    try {
      const parsed = JSON.parse(dataStr);
      if (parsed && parsed.plan && parsed.plan.length > 0) {
        data = parsed;
        hasCustomProtocol = true;
      }
    } catch (err) {
      console.error('Failed to parse active protocol data', err);
    }
  }

  const recoveryScore = typeof data.recoveryScore !== 'undefined' ? data.recoveryScore : 85;
  const totalXP = data.totalXP || 1450;

  // Populating Symmetrical Right Panel Biometrics
  if (readinessNumberEl) readinessNumberEl.textContent = recoveryScore;
  if (rightBarFillEl) rightBarFillEl.style.height = recoveryScore + '%';

  if (readinessStatusEl) {
    let statusHTML;
    if (recoveryScore >= 70) {
      statusHTML = 'Neural Load Optimized. Intensity Boost<br>'
                 + '<span class="readiness-status" style="color:#00FF88">Ready for Protocol.</span>';
    } else if (recoveryScore >= 40) {
      statusHTML = 'Moderate Load Detected. Balanced Plan<br>'
                 + '<span class="readiness-status" style="color:#FFD700">Proceed with Caution.</span>';
    } else {
      statusHTML = 'Recovery Deficit Detected. Reduce Load<br>'
                 + '<span class="readiness-status" style="color:#FF1A1A">Light Protocol Only.</span>';
    }
    readinessStatusEl.innerHTML = statusHTML;
  }

  // Dynamic statistics block calculation
  let activeDays = 18;
  let totalSets = 4;
  let calories = 14240;

  if (hasCustomProtocol) {
    activeDays = data.plan.filter(d => d.workout !== 'REST DAY').length;
    
    const isFatLoss = data.goal === 'fat_loss';
    let expMultiplier = 1;
    if (data.experience === 'intermediate') expMultiplier = 1.25;
    if (data.experience === 'advanced') expMultiplier = 1.5;

    // sum active days sets
    let setsSum = 0;
    data.plan.forEach(d => {
      if (d.workout !== 'REST DAY') setsSum += d.sets;
    });

    totalSets = activeDays > 0 ? Math.round(setsSum / activeDays) : 0;
    calories = Math.round(setsSum * (isFatLoss ? 65 : 45) * expMultiplier);
  }

  if (statCalEl) statCalEl.textContent = calories.toLocaleString();
  if (statDaysEl) statDaysEl.textContent = activeDays;
  if (statSetsEl) statSetsEl.textContent = totalSets;
  if (statXPEl) statXPEl.textContent = totalXP.toLocaleString();
}
