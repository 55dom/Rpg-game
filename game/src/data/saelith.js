// Mirrorlake Saelith (GDD §13: "Reflects places that no longer exist · Mirror wraiths · Drowned Archive"): the lake
// from Eps 27–28, a place to go back to once the story has been there. Its own foe: the mirror wraith, a storm wisp's
// kit in a body of silvered water. It's glass (sim/world.js _states): Tamsin's Note makes it ring, and the next blow
// bursts it (Shatter Chorus, §7.2).

import { ISLES_ENEMIES } from "./isles.js";

const W = ISLES_ENEMIES.wisp;
export const SAELITH_ENEMIES = Object.freeze({
  mirrorWraith: { ...W, stats: { ...W.stats, name: "Mirror Wraith", maxHealth: 90, maxPosture: 40 }, traits: { ...W.traits, glass: true } },
});

export const SAELITH_SCRIPT = `
title: W_SaelithReflection
---
You look down at the water. The island's reflection lies there, perfectly still: the stones, the arch, the ring cut in the floor.
And a village. Roofs, a well, a row of washing on a line, all on an island that has none of them. In the water, someone is lighting a fire in a hearth that isn't there.
You look up. Bare stone. You look down. Smoke, rising, upside down.
Mirrorlake shows what used to be. Nobody in Aurelin can tell you what used to be here.
===

title: W_DrownedArchive
---
You kneel at the island's edge and look straight down. The water is clear for a long way.
Far below, shelves. Rows and rows of them, standing in the dark, every book on them closed. The Drowned Archive: the old maps call it that, and nothing else.
A fish noses along the third shelf from the top, as if reading the spines.
===
`;
