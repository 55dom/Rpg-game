// The law, as pure logic (data/law.js has the numbers): who saw a crime, how each witness reacts, and the
// ledger kept in the story flags (bounty and "wanted" per region, renown, squad reputation).

import { POV, CRIMES, LAW_REGIONS, ZONE_REGION, TIMID_ROLES, renownTier, sentence } from "../data/law.js";

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

/** Does a watcher ({ x, z, yaw }) see a point? Within POV.radius, inside their field of view (or close enough to feel it). */
export function canSee(w, at, pov = POV) {
  const dx = at.x - w.x, dz = at.z - w.z, d = Math.hypot(dx, dz);
  if (d > pov.radius) return false;
  if (d < 0.6) return true;
  return Math.abs(wrap(Math.atan2(dx, dz) - w.yaw)) <= pov.half;
}

/** people: [{ id, x, z, yaw, hidden?, asleep? }]. The ones who see `at`. */
export const witnesses = (people, at, pov = POV) => people.filter((p) => !p.hidden && !p.asleep && canSee(p, at, pov));

/** "arrest" (the Watch), "fight" (grown-ups and squadmates fight back), or "flee" (children and the old shout for the Watch). */
export function reaction(p) {
  if (p.role === "guard") return "arrest";
  if (TIMID_ROLES.includes(p.role)) return "flee";
  return "fight";
}

/** The zone's region, or null where there's no law at all (the Undercroft). */
export function regionOf(zoneId) {
  const key = ZONE_REGION[zoneId];
  return key ? { key, ...LAW_REGIONS[key] } : null;
}

export class Law {
  /** @param flags core/flags.js FlagStore */
  constructor(flags) { this.flags = flags; }

  bounty(r) { return r ? Number(this.flags.get(`BOUNTY_${r.id}`)) || 0 : 0; }
  wanted(r) { return !!r && !!Number(this.flags.get(`WANTED_${r.id}`)); }
  renown(r) { return Number(this.flags.get(r.renown)) || 0; }
  tier(r) { return renownTier(this.renown(r)); }

  /**
   * Someone saw it. byGuard: a guard did (a trusted face gets one warning a day for something petty).
   * Returns { crime, warned, bounty }.
   */
  commit(kind, r, { byGuard = false, day = 1 } = {}) {
    const c = CRIMES[kind];
    if (!c || !r) return null;
    const warnKey = `WARNED_${r.id}`;
    if (byGuard && c.petty && this.tier(r).warn && Number(this.flags.get(warnKey)) !== day) {
      this.flags.set(warnKey, day);
      return { crime: c, warned: true, bounty: this.bounty(r) };
    }
    if (!r.comrades) this.flags.add(`BOUNTY_${r.id}`, c.bounty);
    if (r.renown !== "REP_SQUAD") this.flags.add(r.renown, c.renown);
    if (c.squad) this.flags.add("REP_SQUAD", c.squad);
    this.flags.add("CRIMES_SEEN", 1);
    return { crime: c, warned: false, bounty: this.bounty(r) };
  }

  /** Fought the Watch, or ran from it: guards attack on sight until the bounty is settled. */
  setWanted(r, on = true) { if (r && !r.comrades) this.flags.set(`WANTED_${r.id}`, on ? 1 : 0); }

  clear(r) { if (!r) return; this.flags.set(`BOUNTY_${r.id}`, 0); this.setWanted(r, false); }

  /** Pay the bounty in Marks. False if you can't afford it. */
  pay(r, inventory) {
    const b = this.bounty(r);
    if (inventory.marks < b) return false;
    inventory.marks -= b;
    this.clear(r);
    this.flags.add("BOUNTIES_PAID", 1);
    return true;
  }

  /** Time in the cells settles the bounty. Carried in (not surrendered): a fine of half the bounty too, if you have it. */
  serve(r, inventory, { surrendered }) {
    const b = this.bounty(r), s = sentence(b, { surrendered });
    const fine = Math.min(inventory.marks, Math.round(b * s.fineShare));
    inventory.marks -= fine;
    this.clear(r);
    if (r.renown !== "REP_SQUAD") this.flags.add(r.renown, -2);
    this.flags.add("TIMES_JAILED", 1);
    return { hours: s.hours, fine, bounty: b };
  }
}
