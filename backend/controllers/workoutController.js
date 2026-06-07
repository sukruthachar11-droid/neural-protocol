const Workout = require("../models/Workout");

// 🔄 Recovery Score Calculator
const calculateRecoveryScore = (sleepQuality = 7, stressLevel = 5) => {
  // Validate and clamp inputs to safe ranges
  const sq = Math.max(1, Math.min(10, sleepQuality || 7));
  const sl = Math.max(1, Math.min(10, stressLevel || 5));
  
  // Score formula: (sleep_quality × 10) - (stress_level × 5)
  // This weights sleep 2x more than stress, as it's more critical for recovery
  let score = (sq * 10) - (sl * 5);
  
  // Normalize to 0-100 range for consistency with schema
  return Math.max(0, Math.min(100, score));
};

// recovery‑aware volume helper (same logic as frontend)
const adjustVolume = (experience = "beginner", sleepQuality = 7, stressLevel = 5) => {
  let baseSets;
  switch (experience) {
    case "intermediate":
      baseSets = 4;
      break;
    case "advanced":
      baseSets = 5;
      break;
    default:
      baseSets = 3;
  }

  if (sleepQuality <= 4) baseSets -= 1;
  if (stressLevel >= 7) baseSets -= 1;

  return Math.max(baseSets, 2);
};

// 1️⃣ Workout generator function (ENGINE)
const generateWorkoutPlan = (goal, days, experience = "beginner", sleepQuality = 7, stressLevel = 5) => {
  // compute simple recovery score and intensity multiplier
  const recoveryScore = sleepQuality * 2 - stressLevel;
  let intensityMultiplier = 1;
  if (recoveryScore < 3) intensityMultiplier = 0.8;
  if (recoveryScore > 6) intensityMultiplier = 1.2;

  // determine base sets using existing volume helper
  const baseSets = adjustVolume(experience, sleepQuality, stressLevel);
  const adjustedSets = Math.max(2, Math.round(baseSets * intensityMultiplier));

  // additional params now shape plan via sets
  let exercises = [];
  let workoutDaysPerWeek = 0;
  let restDaysPerWeek = 0;

  if (goal === "muscle_gain") {
    exercises = ["Chest", "Back", "Legs", "Shoulders", "Arms"];
    workoutDaysPerWeek = 5;
    restDaysPerWeek = 2;
  }

  if (goal === "fat_loss") {
    exercises = [
      "Upper Body HIIT",
      "Lower Body HIIT",
      "Core + Cardio",
      "Full Body Burn",
      "Circuit Training",
      "Tabata"
    ];
    workoutDaysPerWeek = 6;
    restDaysPerWeek = 1;
  }

  const totalCycleDays = workoutDaysPerWeek + restDaysPerWeek;
  let plan = [];

  for (let i = 0; i < days; i++) {
    const dayOfCycle = i % totalCycleDays;

    if (dayOfCycle < workoutDaysPerWeek) {
      plan.push({
        day: `Day ${i + 1}`,
        workout: exercises[dayOfCycle],
        sets: adjustedSets
      });
    } else {
      plan.push({
        day: `Day ${i + 1}`,
        workout: "REST DAY",
        sets: 0
      });
    }
  }

  return plan;
};

// 2️⃣ Controller function (API handler)
const createWorkoutPlan = async (req, res) => {
  const { goal, days, experience = "beginner", sleepQuality = 7, stressLevel = 5 } = req.body;

  if (!goal || !days) {
    return res.status(400).json({ message: "goal and days required" });
  }

  const normalizedGoal = goal.toLowerCase();
  const recoveryScore = calculateRecoveryScore(sleepQuality, stressLevel);

  const workoutPlan = generateWorkoutPlan(
    normalizedGoal,
    days,
    experience,
    sleepQuality,
    stressLevel
  );

  // 🎮 Calculate XP: 50 per workout day + recovery bonus if sleep >= 8
  let totalXP = 0;
  workoutPlan.forEach(day => {
    if (day.workout !== "REST DAY") {
      totalXP += 50;
      if (sleepQuality >= 8) {
        totalXP += 20; // recovery bonus
      }
    }
  });

  try {
    const workout = await Workout.create({
      goal: normalizedGoal,
      days,
      experience,
      sleepQuality,
      stressLevel,
      recoveryScore,
      totalXP,
      plan: workoutPlan,
    });

    res.json(workout);
  } catch (err) {
    console.error("DB error", err);
    res.status(500).json({ message: "failed to save workout" });
  }
};

// 3️⃣ Export controller
module.exports = { createWorkoutPlan };
