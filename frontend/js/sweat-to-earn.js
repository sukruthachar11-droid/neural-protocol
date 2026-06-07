/* ════════════════════════════════════════
   sweat-to-earn.js — Wallet & Rewards Logic
   ════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize wallet balance
  initWalletBalance();

  // Initialize and render Transaction Ledger
  initLedger();

  // Setup/Render already redeemed items
  initRedeemedItems();

  // Bind right panel biometrics dynamic stats
  loadBioStats();

  // Start live BPM simulation from ui.js
  if (typeof startBpmSimulation === 'function') {
    startBpmSimulation();
  }
});

/**
 * Initializes and syncs total wallet balance.
 */
function initWalletBalance() {
  let balance = localStorage.getItem('swtBalance');
  if (balance === null) {
    // Attempt to load from active session if exists, otherwise default 2475
    const dataStr = sessionStorage.getItem('workoutData');
    let defaultBalance = 2475;
    if (dataStr) {
      try {
        const parsed = JSON.parse(dataStr);
        if (parsed && parsed.totalXP) {
          defaultBalance = 2450 + Math.round(parsed.totalXP / 10);
        }
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem('swtBalance', defaultBalance);
    balance = defaultBalance;
  } else {
    balance = parseInt(balance, 10);
  }

  updateBalanceDisplays(balance);
}

/**
 * Updates all balance elements on the page.
 */
function updateBalanceDisplays(balance) {
  const sidebarXP = document.getElementById('totalXP');
  const walletTokens = document.getElementById('walletTokens');

  if (sidebarXP) sidebarXP.textContent = balance.toLocaleString();
  if (walletTokens) walletTokens.textContent = balance.toLocaleString();
}

/**
 * Pre-populates default transactions if history is empty, and renders table.
 */
function initLedger() {
  let transactions = localStorage.getItem('swtTransactions');
  
  if (!transactions) {
    // Generate realistic default transactions
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 16);
    const dayBefore = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 16);
    const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 16);

    transactions = [
      {
        date: yesterday,
        sector: 'QUAD_BURNER_INTENSITY',
        type: 'Protocol Reward',
        delta: '+250 $SWT',
        status: 'VERIFIED'
      },
      {
        date: yesterday,
        sector: 'STREAK_BONUS_3DAY',
        type: 'Milestone Reward',
        delta: '+100 $SWT',
        status: 'VERIFIED'
      },
      {
        date: dayBefore,
        sector: 'CORE_CALIBRATION_HIIT',
        type: 'Protocol Reward',
        delta: '+125 $SWT',
        status: 'VERIFIED'
      },
      {
        date: threeDaysAgo,
        sector: 'INITIAL_BIOMETRIC_CALIBRATION',
        type: 'System Credit',
        delta: '+2000 $SWT',
        status: 'VERIFIED'
      }
    ];
    localStorage.setItem('swtTransactions', JSON.stringify(transactions));
  } else {
    try {
      transactions = JSON.parse(transactions);
    } catch (e) {
      transactions = [];
    }
  }

  renderLedger(transactions);
}

/**
 * Renders the transactions array into the ledger table.
 */
function renderLedger(transactions) {
  const ledgerBody = document.getElementById('ledgerBody');
  if (!ledgerBody) return;

  ledgerBody.innerHTML = '';

  if (transactions.length === 0) {
    ledgerBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">// NO TRANSACTION TELEMETRY RECORDED</td></tr>`;
    return;
  }

  transactions.forEach(tx => {
    const isPlus = tx.delta.startsWith('+');
    const deltaClass = isPlus ? 'delta-plus' : 'delta-minus';
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${tx.date}</td>
      <td style="font-weight:bold; letter-spacing:1px;">${tx.sector}</td>
      <td style="color:var(--text-dim);">${tx.type}</td>
      <td class="${deltaClass}">${tx.delta}</td>
      <td><span class="ledger-status verified">VERIFIED</span></td>
    `;
    ledgerBody.appendChild(row);
  });
}

/**
 * Restores disabled state and green buttons for items that were already unlocked.
 */
function initRedeemedItems() {
  let unlocked = localStorage.getItem('swtUnlockedRewards');
  if (!unlocked) {
    unlocked = [];
    localStorage.setItem('swtUnlockedRewards', JSON.stringify(unlocked));
  } else {
    try {
      unlocked = JSON.parse(unlocked);
    } catch (e) {
      unlocked = [];
    }
  }

  // Update counter
  const counter = document.getElementById('unlocksHeldCount');
  if (counter) {
    counter.textContent = `${unlocked.length} / 4`;
  }

  // Set visual button states
  unlocked.forEach(itemId => {
    const card = document.getElementById(itemId);
    if (card) {
      const btn = card.querySelector('.market-redeem-btn');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span>🟢 Unlocked // Active</span>';
      }
    }
  });
}

/**
 * Triggers a purchase redemption. Check balance, deducts money, and logs transaction.
 */
window.triggerRedemption = function(itemId, cost, title) {
  let balance = localStorage.getItem('swtBalance');
  if (balance === null) balance = 2475;
  else balance = parseInt(balance, 10);

  const toast = document.getElementById('toast');

  if (balance >= cost) {
    // 1. Deduct cost
    const newBalance = balance - cost;
    localStorage.setItem('swtBalance', newBalance);
    updateBalanceDisplays(newBalance);

    // 2. Add item ID to unlocked rewards list
    let unlocked = [];
    try {
      unlocked = JSON.parse(localStorage.getItem('swtUnlockedRewards')) || [];
    } catch (e) {
      unlocked = [];
    }
    if (!unlocked.includes(itemId)) {
      unlocked.push(itemId);
      localStorage.setItem('swtUnlockedRewards', JSON.stringify(unlocked));
    }

    // 3. Add to dynamic transaction ledger history
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
      sector: sectorKey,
      type: 'Upgrade Purchase',
      delta: `-${cost} $SWT`,
      status: 'VERIFIED'
    });

    localStorage.setItem('swtTransactions', JSON.stringify(transactions));
    renderLedger(transactions);

    // 4. Update elements visual states
    const card = document.getElementById(itemId);
    if (card) {
      const btn = card.querySelector('.market-redeem-btn');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span>🟢 Unlocked // Active</span>';
      }
    }

    const counter = document.getElementById('unlocksHeldCount');
    if (counter) {
      counter.textContent = `${unlocked.length} / 4`;
    }

    // 5. Trigger Success cyber-toast
    if (toast) {
      toast.className = 'toast show success';
      toast.innerHTML = `<span>✔️ SUCCESS: UNLOCKED "${title.toUpperCase()}" [-${cost} $SWT]</span>`;
      setTimeout(() => toast.classList.remove('show'), 4000);
    }

  } else {
    // 6. Trigger Failure cyber-toast
    if (toast) {
      toast.className = 'toast show error';
      toast.innerHTML = `<span>❌ ACCESS DENIED: INSUFFICIENT SWT FUNDS FOR "${title.toUpperCase()}"</span>`;
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
