const mongoose = require("mongoose");

const workoutSchema = mongoose.Schema(
{
  goal: String,
  experience: String,
  days: Number,
  plan: Array,
  
  // Recovery & Health Metrics
  sleepQuality: {
    type: Number,
    min: 1,
    max: 10,
    default: 7,
    description: "Sleep quality rating (1-10)"
  },
  stressLevel: {
    type: Number,
    min: 1,
    max: 10,
    default: 5,
    description: "Current stress level (1-10)"
  },
  recoveryScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 75,
    description: "Overall recovery percentage (0-100)"
  },
  totalXP: {
    type: Number,
    default: 0,
    description: "Total experience points earned from this workout"
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("Workout", workoutSchema);