/* ════════════════════════════════════════
   profile.js — Client-side dashboard logic
   ════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Load pilot name from localStorage or set default
  initPilotProfile();

  // Load session storage workout details
  loadWorkoutData();

  // Wire up optical capture uploads for transformation gallery
  initPhotoUploads();

  // Start live BPM simulation from ui.js
  if (typeof startBpmSimulation === 'function') {
    startBpmSimulation();
  }
});

/**
 * Initializes pilot name input, hooks save triggers, and updates avatar badge.
 */
function initPilotProfile() {
  const nameInput = document.getElementById('pilotNameInput');
  const avatarEl = document.getElementById('pilotAvatar');
  
  if (!nameInput || !avatarEl) return;

  // Retrieve stored pilot name or set default
  const savedName = localStorage.getItem('pilotName') || 'NEURAL_PILOT';
  nameInput.value = savedName;
  updateAvatarInitials(savedName, avatarEl);

  // Update localStorage and initials instantly on typing
  nameInput.addEventListener('input', () => {
    let currentName = nameInput.value.trim().toUpperCase();
    if (!currentName) currentName = 'NEURAL_PILOT';
    localStorage.setItem('pilotName', currentName);
    updateAvatarInitials(currentName, avatarEl);
  });

  // Handle enter key blur
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      nameInput.blur();
    }
  });

  nameInput.addEventListener('blur', () => {
    if (!nameInput.value.trim()) {
      nameInput.value = 'NEURAL_PILOT';
      localStorage.setItem('pilotName', 'NEURAL_PILOT');
      updateAvatarInitials('NEURAL_PILOT', avatarEl);
    }
  });
}

/**
 * Maps a username to 2 capital initials and puts it inside the avatar circle.
 * @param {string} name
 * @param {HTMLElement} avatarEl
 */
function updateAvatarInitials(name, avatarEl) {
  const clean = name.replace(/[^A-Z0-9\s-_]/gi, '').trim();
  const parts = clean.split(/[\s-_]+/);
  let initials = '';
  
  if (parts.length >= 2 && parts[0] && parts[1]) {
    initials = (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (parts[0] && parts[0].length >= 2) {
    initials = parts[0].substring(0, 2).toUpperCase();
  } else {
    initials = name.substring(0, 2).toUpperCase();
  }
  
  avatarEl.textContent = initials.substring(0, 2) || 'N1';
}

/**
 * Parses sessionStorage to fill in pilot details and dynamic bio stats.
 */
function loadWorkoutData() {
  const dataStr = sessionStorage.getItem('workoutData');
  
  // Elements
  const totalXPEl = document.getElementById('totalXP');
  const profileGoal = document.getElementById('profileGoal');
  const profileExp = document.getElementById('profileExperience');
  const profileDays = document.getElementById('profileDays');
  const profileRec = document.getElementById('profileRecovery');
  const profileTokens = document.getElementById('profileTokens');
  const streakCount = document.getElementById('streakCount');

  // Right Panel elements
  const readinessNumberEl = document.getElementById('readinessNumber');
  const rightBarFillEl = document.getElementById('rightBarFill');
  const readinessStatusEl = document.getElementById('readinessStatus');
  const statCalEl = document.getElementById('statCal');
  const statDaysEl = document.getElementById('statDays');
  const statSetsEl = document.getElementById('statSets');
  const statXPEl = document.getElementById('statXP');

  // Set default starting base stats if no session exists yet
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

  const goalText = (data.goal || '').replace(/_/g, ' ').toUpperCase();
  const experienceText = (data.experience || '').toUpperCase();
  const totalXP = data.totalXP || 0;
  const recoveryScore = typeof data.recoveryScore !== 'undefined' ? data.recoveryScore : 75;

  // ── Populating Middle Board ──
  if (profileGoal) profileGoal.textContent = hasCustomProtocol ? goalText : 'NO ACTIVE PLAN';
  if (profileExp) profileExp.textContent = hasCustomProtocol ? experienceText : 'N/A';
  if (profileDays) profileDays.textContent = hasCustomProtocol ? `${data.days} DAYS` : 'N/A';
  if (profileRec) {
    profileRec.textContent = hasCustomProtocol ? `${recoveryScore}%` : 'N/A';
    // set recovery score neon color
    profileRec.style.color = recoveryScore >= 70 ? 'var(--green)' : recoveryScore >= 40 ? 'var(--yellow)' : 'var(--red)';
  }

  // Sweat-to-Earn FitCoins: load from localStorage
  let totalSWTBalance = localStorage.getItem('swtBalance');
  if (totalSWTBalance === null) {
    const tokenRewards = Math.round(totalXP / 10);
    totalSWTBalance = 2450 + tokenRewards;
    localStorage.setItem('swtBalance', totalSWTBalance);
  } else {
    totalSWTBalance = parseInt(totalSWTBalance, 10);
  }

  if (totalXPEl) totalXPEl.textContent = totalSWTBalance.toLocaleString();
  if (profileTokens) profileTokens.textContent = totalSWTBalance.toLocaleString();

  // Streak counter mapping
  let activeCount = 5;
  if (hasCustomProtocol) {
    // calculate a dynamic streak based on active days completed
    const activeDays = data.plan.filter(d => d.workout !== 'REST DAY').length;
    activeCount = Math.min(7, Math.max(1, Math.round(activeDays / 2)));
  }

  if (streakCount) {
    streakCount.textContent = `${activeCount} DAY STREAK 🔥`;
  }

  // Highlight weekly active nodes based on computed streak count
  const streakNodes = document.querySelectorAll('.streak-day');
  streakNodes.forEach((node, idx) => {
    if (idx < activeCount) {
      node.classList.add('active');
    } else {
      node.classList.remove('active');
    }
  });

  // ── Populating Symmetrical Right Panel ──
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

/**
 * Configures event listeners to upload photos dynamically inside the timeline log.
 */
function initPhotoUploads() {
  const slots = document.querySelectorAll('.gallery-slot');
  
  slots.forEach((slot, idx) => {
    slot.addEventListener('click', (e) => {
      // Ignore click if clicking the remove button
      if (e.target.classList.contains('slot-remove-btn')) return;
      
      const fileInput = slot.querySelector('.file-input');
      if (fileInput) fileInput.click();
    });

    const fileInput = slot.querySelector('.file-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            // Check if slot has image already, or construct one
            let img = slot.querySelector('.slot-image');
            if (!img) {
              img = document.createElement('img');
              img.className = 'slot-image';
              slot.appendChild(img);
            }
            img.src = event.target.result;
            
            // Build neon red removal trigger
            let removeBtn = slot.querySelector('.slot-remove-btn');
            if (!removeBtn) {
              removeBtn = document.createElement('button');
              removeBtn.className = 'slot-remove-btn';
              removeBtn.innerHTML = '×';
              removeBtn.addEventListener('click', (ev) => {
                ev.stopPropagation();
                img.remove();
                removeBtn.remove();
                fileInput.value = '';
                
                // Show placeholders back
                slot.querySelector('.slot-icon').style.display = 'block';
                slot.querySelector('.slot-label').style.display = 'block';
              });
              slot.appendChild(removeBtn);
            }

            // Hide original icons and texts
            slot.querySelector('.slot-icon').style.display = 'none';
            slot.querySelector('.slot-label').style.display = 'none';
          };
          reader.readAsDataURL(file);
        }
      });
    }
  });
}
