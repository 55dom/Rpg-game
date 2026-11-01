// Corruption (GDD §8.3) over the story's FlagStore: CORRUPTION (0–100) and CORRUPT_PEAK (the most it's been), so it
// saves and loads with everything else. Rising, it returns the stages it crossed; coming down to 0 after it had
// reached 50 finds the secret page Blank Verse (§8.4).

import { CORRUPTION } from "../data/forbidden.js";

export class Corruption {
  /** @param flags a FlagStore @param secrets core/secrets.js (for Blank Verse) */
  constructor(flags, secrets = null) { this.flags = flags; this.secrets = secrets; }
  get value() { return Math.max(0, Math.min(CORRUPTION.max, Number(this.flags.get("CORRUPTION")) || 0)); }
  get peak() { return Number(this.flags.get("CORRUPT_PEAK")) || 0; }
  /** The highest stage reached right now (0, 25, 50, 75 or 100). */
  get stage() { return [...CORRUPTION.stages].reverse().find((s) => this.value >= s) ?? 0; }

  /** Raise it; returns the stages crossed on the way up. */
  add(n) {
    const before = this.value, after = Math.min(CORRUPTION.max, before + Math.max(0, n));
    this.flags.set("CORRUPTION", after);
    if (after > this.peak) this.flags.set("CORRUPT_PEAK", after);
    return CORRUPTION.stages.filter((s) => before < s && after >= s);
  }
  /** Bring it down (never below 0). Returns "blankVerse" if this cleansed it to 0 after it had reached 50. */
  cleanse(n) {
    const after = Math.max(0, this.value - Math.max(0, n));
    this.flags.set("CORRUPTION", after);
    if (after === 0 && this.peak >= 50 && this.secrets?.find("blankVerse")) return "blankVerse";
    return null;
  }
  /** Erased, and out again: back to `CORRUPTION.back`. */
  restore() { this.flags.set("CORRUPTION", CORRUPTION.back); }
}
