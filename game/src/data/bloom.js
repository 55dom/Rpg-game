// Boss 7, the Hollow Bloom (GDD §16 B7, Ep 18): it can't be killed, only held back until it opens (seventy seconds,
// "Until It Opens"), so its phases run on that clock, not on its health.
// P1: tendrils and petals, and the pulse that erases whatever stands in it.
// P2: it erases the ground. A white ring, then a hole in the world: stand on the blank and it takes a bite out of you too.
// P3: its petals close over you, and for a few seconds you're somewhere else (a fire, a long time ago). It goes on outside.
// P4: it starts erasing your pages: one spell at a time goes blank for a few seconds.

export const BLOOM_TUNING = Object.freeze({
  phases: Object.freeze({ holes: 840, memory: 1900, pages: 2700 }), // frames into the fight (the meter runs 4200)
  holes: Object.freeze({ every: 300, warn: 60, r: 2.1, frames: 900, max: 4, grace: 9, bite: 0.06 }),
  memory: Object.freeze({ frames: 540 }),
  pages: Object.freeze({ every: 360, frames: 300 }),
});
