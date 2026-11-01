// Boss 6, the Cantor Twins (GDD §16 B6, Ep 15): Mirror and Smoke, one song in two throats.
// P1: Mirror's glass turns away whatever hits it head-on; Smoke's hymn wards her sister (Gale breaks the ward).
// P2 (the pair down to 70%, together): they swap magic, and keep swapping. A glint warns you a second before.
// P3 (40%): smoke fills the hall and the mirrors fill with them: reflections, each one whole, among them the real two
//   (who trade places with a reflection every few seconds). The real ones are hurt; a reflection breaks at a touch.
//   Gale blows the smoke away and every reflection with it.
// P4: kill one and the other absorbs her sister's magic: the glass and the song both, and faster.

export const TWINS_TUNING = Object.freeze({
  swapAt: 0.7, smokeAt: 0.4,
  swapEvery: 600, swapWarn: 60,
  smoke: Object.freeze({ frames: 840, every: 1320, echoes: 4, ring: 5.2, shiftEvery: 180 }),
  absorb: Object.freeze({ heal: 0.3, speed: 1.2, wardEvery: 540 }),
});

// Resonance (Tamsin's Shatter Note, Ep 15: §16 B6 "Resonance shatters mirrors"): a note rung at the one she aims at.
// Every reflection within `r` of it breaks at once, and the glass guard on a twin in it cracks for `glassFrames`.
export const RESONANCE = Object.freeze({ r: 4.5, glassFrames: 420 });
