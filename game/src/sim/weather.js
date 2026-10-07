// Time of day and weather for free roam (GDD §29.10). Pure logic: the runtime turns it into sky,
// light, rain and how busy the streets are; townsfolk read `night` and `raining`.
//
// A full day takes 16 real minutes. Weather drifts between clear, overcast and rain; each region has
// its own climate (the Fens are wet and grey, the dry Sea of Marrow almost never rains).

export const DAY_SECONDS = 16 * 60;
export const CLIMATES = Object.freeze({
  default: { rain: 0.15, overcast: 0.3 },
  fens: { rain: 0.4, overcast: 0.45 },
  lighthouse: { rain: 0.05, overcast: 0.2 },
  undercroft: { rain: 0, overcast: 0, indoor: true },
});
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export class WorldClock {
  /** @param {{ hour?: number, rng?: () => number }} o */
  constructor({ hour = 9, rng = Math.random } = {}) {
    this.hour = hour;
    this.day = 1; // counts up at midnight (one gift and one chat a day per squadmate)
    this.rng = rng;
    this.sky = "clear";       // "clear" | "overcast" | "rain"
    this.wet = 0;             // eased 0–1 rain amount
    this.cloud = 0;           // eased 0–1 cloud cover
    this.next = 120 + rng() * 120;
    this.climate = CLIMATES.default;
  }

  /** Enter a region (its climate shapes the next weather change). */
  setClimate(id) { this.climate = CLIMATES[id] ?? CLIMATES.default; if (this.climate.indoor) return; if (this.sky === "rain" && this.climate.rain < 0.1) this.sky = "overcast"; }

  update(dt) {
    const h = this.hour + (dt * 24) / DAY_SECONDS;
    if (h >= 24) this.day++;
    this.hour = h % 24;
    this.next -= dt;
    if (this.next <= 0) { this._change(); this.next = 150 + this.rng() * 150; }
    const rain = this.sky === "rain" && !this.climate.indoor ? 1 : 0;
    const cloud = this.sky !== "clear" ? 1 : 0;
    this.wet += (rain - this.wet) * Math.min(1, dt * 0.25);
    this.cloud += (cloud - this.cloud) * Math.min(1, dt * 0.2);
  }

  _change() {
    const r = this.rng(), c = this.climate;
    this.sky = r < c.rain ? "rain" : r < c.rain + c.overcast ? "overcast" : "clear";
  }

  /** 1 in full daylight, 0 at night, easing through dawn (5–7) and dusk (18–20:30). */
  get daylight() { const h = this.hour; return smooth(5, 7, h) * (1 - smooth(18, 20.5, h)); }
  get night() { return this.hour < 5.5 || this.hour > 20.5; }
  get raining() { return this.wet > 0.5; }
  /** How many people are out: fewer at night and in the rain. */
  get density() { return Math.max(0.12, (0.25 + 0.75 * this.daylight) * (1 - this.wet * 0.7)); }
  /** "07:30" */
  get label() { const h = Math.floor(this.hour), m = Math.floor((this.hour - h) * 60); return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`; }
  toJSON() { return { hour: this.hour, sky: this.sky, day: this.day }; }
  load(d) { if (!d) return; this.hour = d.hour ?? this.hour; this.day = d.day ?? this.day; this.sky = d.sky ?? this.sky; this.wet = this.sky === "rain" ? 1 : 0; this.cloud = this.sky === "clear" ? 0 : 1; }
}
