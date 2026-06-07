/* ════════════════════════════════════════
   workout.js — API request & plan rendering
   ════════════════════════════════════════ */

const generateBtn = document.getElementById('generateBtn');

if (generateBtn) {
  console.log("🔥 SUCCESS: 'generateBtn' found in the DOM. Attaching click listener.");
  generateBtn.addEventListener('click', generateWorkout);
} else {
  console.error("❌ ERROR: Could not find an element with id='generateBtn' inside your HTML!");
}

/**
 * Click handler — calls POST /api/workout/generate
 * @param {Event} e
 */
async function generateWorkout(e) {
  e.preventDefault();
  console.log("🚀 Button clicked! Gathering payload data...");

  // Select UI elements safely
  const errorBox = document.getElementById('errorBox');
  const btn      = document.getElementById('generateBtn');
  const results  = document.getElementById('resultsSection');

  // Basic validation check to ensure elements exist before pulling values
  try {
    const payload = {
      goal:          document.getElementById('goal').value,
      experience:    document.getElementById('experience').value,
      days:          parseInt(document.getElementById('days').value) || 3,
      sleepQuality:  parseInt(document.getElementById('sleepQuality').value) || 7,
      stressLevel:   parseInt(document.getElementById('stressLevel').value) || 5,
      recoveryScore: parseInt(document.getElementById('recoveryScore').textContent) || 50,
    };

    console.log("Payload data built successfully:", payload);

    /* Reset UI for Loading State */
    if (errorBox) errorBox.style.display = 'none';
    if (results) results.style.display  = 'none';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>GENERATING PROTOCOL...';
    }

    // Make the backend connection
    const res = await fetch(`http://localhost:5000/api/workout/generate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Server error occurred during generation.');
    }

    const data = await res.json();
    console.log("Backend Response:", data);
    
    // Add rewards to local storage swtBalance
    let balance = localStorage.getItem('swtBalance');
    if (balance === null) {
      balance = 2475;
    } else {
      balance = parseInt(balance, 10);
    }
    const tokenRewards = Math.round((data.totalXP || 250) / 10);
    localStorage.setItem('swtBalance', balance + tokenRewards);

    // Record the earned rewards transaction
    let history = localStorage.getItem('swtTransactions');
    if (history) {
      try {
        history = JSON.parse(history);
      } catch (e) {
        history = [];
      }
    } else {
      history = [];
    }
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const goalText = (data.goal || 'Workout Plan').replace(/_/g, ' ').toUpperCase();
    history.unshift({
      date: timestamp,
      sector: `${goalText}_GENERATED`,
      type: 'Protocol Reward',
      delta: `+${tokenRewards} $SWT`,
      status: 'VERIFIED'
    });
    localStorage.setItem('swtTransactions', JSON.stringify(history));

    alert("Success! Backend responded. Teleporting to display protocol...");
    
    // Store data temporarily and move to display layout
    sessionStorage.setItem('workoutData', JSON.stringify(data));
    window.location.href = 'workout-display.html';

  } catch (err) {
    console.error("Network or Backend integration error:", err);
    alert("Error: " + err.message);
    if (errorBox) {
      errorBox.textContent   = '// ERROR: ' + (err.message || 'Could not connect to server. Ensure backend is running.');
      errorBox.style.display = 'block';
    }
  } finally {
    if (btn) {
      btn.disabled  = false;
      btn.innerHTML = 'Generate Workout Plan';
    }
  }
}

/**
 * Render the generated plan into the results section (Fallback helper)
 * @param {object} data — response from backend
 */
function renderPlan(data) {
  const plan    = data.plan    || [];
  const totalXP = data.totalXP || 0;
  const goalLabel = (data.goal || '').replace(/_/g, ' ').toUpperCase();

  const xpValue = document.getElementById('xpValue');
  if (xpValue) xpValue.textContent = totalXP.toLocaleString() + ' XP';
  
  const xpMeta = document.getElementById('xpMeta');
  if (xpMeta) xpMeta.textContent = `${goalLabel} · ${data.days} DAYS · ${(data.experience || '').toUpperCase()}`;

  const grid = document.getElementById('planGrid');
  if (grid) {
    grid.innerHTML = '';
    plan.forEach((d, i) => {
      const isRest = d.workout === 'REST DAY';
      const card   = document.createElement('div');
      card.className            = 'plan-day' + (isRest ? ' rest' : '');
      card.style.animationDelay = (i * 0.04) + 's';
      card.innerHTML = `
        <div class="plan-day-num">${d.day}</div>
        <div class="plan-day-workout">${d.workout}</div>
        ${!isRest ? `<div class="plan-day-sets">${d.sets} SETS</div>` : ''}
        <div class="plan-day-corner"></div>
      `;
      grid.appendChild(card);
    });
  }
}
