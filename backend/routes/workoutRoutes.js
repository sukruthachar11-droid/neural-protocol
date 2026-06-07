const express = require("express");
const router = express.Router();
const { createWorkoutPlan } = require("../controllers/workoutController");

router.post("/generate", createWorkoutPlan);

module.exports = router;