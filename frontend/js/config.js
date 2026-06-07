/* ════════════════════════════════════════
   config.js — App-wide configuration
   ════════════════════════════════════════ */

const CONFIG = {
  API_BASE: 'http://localhost:5000',

  /* Recovery score thresholds */
  RECOVERY: {
    HIGH:   70,   // green
    MID:    40,   // yellow
    // below MID = red
  },

  /* BPM simulation bounds */
  BPM: {
    INITIAL: 145,
    MIN:     120,
    MAX:     175,
    DRIFT:   8,       // max change per tick
    TICK_MS: 1200,
  },

  /* Toast auto-dismiss delay (ms) */
  TOAST_DURATION: 3000,
};
