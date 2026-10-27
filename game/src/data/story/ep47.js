// Episode 47 · Lanterns in the Smoke (GDD §15.8 the Siege of Aurelin, Phases 1–2; §15.11: the title is set). The Gate
// stands open over the Crown Ward, and down the hill out of it, in ranks, three deep, with one bigger than the rest at
// the back, comes an army nobody in Liraen has a name for. The Lanterns hold the Lowmarket Bridge while the city runs
// across it (sim/siege.js: a Defense meter that falls whatever you do, and falls slower for every one you put down).
// The spans behind them fall in. Bas goes down; Juno's pinned; Rook can only reach one first. Then the sky tears again,
// black this time, and everything stops, and the masked knight drops onto the bridge, and turns his back on the
// Lanterns, and goes through the Line like it's paper. He murmurs to every one of them as it falls. He cuts a tear
// under the Marshal and drops him out of the sky onto his own ranks, and kills him from a backstep. Through the Gate,
// framed in the red: an empty throne, a sealed black coffin, and its lid shifts. Then he turns for the Archive, where
// half the Lowmarket is sheltering around the lock, and Rook steps into his way.

import { AFTER_EP46 } from "./arc5.js";
import { BRIDGE_LAYOUT as L } from "../zones.js";

export const EP47_SCRIPT = `
title: Ep47_Cold
---
<<shot wide>>
The Lowmarket Bridge, the afternoon of the Founding. The whole city is running across it, south, away from the hill, carrying children and bread and nothing at all. The Gate hangs red over the Crown Ward.
<<shot on Dagrun>>
Dagrun: Lanterns. We hold the bridge. Nobody gets past us until the last of them's across. You hear me? Nobody.
<<shot on Tamsin>>
Tamsin: Hold it against what? I can't see anything coming.
<<sfx drums>>
<<shot on Lio>>
Lio: Listen.
<<shot wide>>
Down the hill from the Crown Ward, out of the smoke, in ranks: plate the colour of old blood, faceplates with narrow slits, long pole-blades held upright like a fence. Three lines deep. And at the back, one bigger than all the rest.
<<shot on Juno>>
Juno: What are they?
<<shot on Lio>>
Lio: I don't know. I've never seen anything like them in any book. Not one.
<<shot two Dagrun Rook>>
-> "Then we'll find out." #bold
    Dagrun: That's the spirit. Stupid, but the spirit.
-> "Get the people across." #earnest
    Dagrun: That's the job. Every one of them.
===

title: Ep47_Chaos
---
<<shot wide front>>
The second span goes. Stone and dust and screaming, and when it clears, Bas is down on one knee with his bad arm hanging, and the Line is twenty paces off.
<<shot on Juno>>
And Juno is on her back under a fallen lamp-post, pinned at the hip, reaching for her needles where they've skittered away.
<<shot on Juno>>
Juno: I'm fine! I'm FINE! Get Bas!
<<shot on Bas>>
Bas: Don't you dare. Get her out!
<<shot on Juno>>
-> Get Juno out first.
    <<set $SIEGE_FIRST to "juno">>
    Rook gets a shoulder under the lamp-post and heaves, and it moves, and Juno rolls out from under it swearing, and goes straight to Bas.
-> Cover Bas first.
    <<set $SIEGE_FIRST to "bas">>
    Rook gets between Bas and the front rank and holds there, and behind them Tamsin and Lio drag the lamp-post off Juno.
===

title: Ep47_Arrival
---
<<shot wide>>
The last stragglers are stumbling past behind them, and the Line is close enough to see the dents in its plate. And the sky above the bridge tears open. Black, this time. A jagged cut across the clouds.
<<shot wide>>
Everything stops. The soldiers stop mid-stride. Juno stops with a needle half-thrown. The smoke stops.
<<fx tear Masked>>
<<show Masked>>
<<shake 0.6>>
<<shot on Masked>>
And the masked knight drops out of it onto the bridge, between the Lanterns and the Line, and lands on one knee, and stands up.
<<shot on Tamsin>>
Tamsin: Is he with them?!
<<shot on Juno>>
Juno: Kill him if he moves!
<<shot on Masked>>
He doesn't look at them. He turns his back on the Lanterns, and faces the Line, and brings the glaive down off his shoulder.
<<set $SIEGE_ARRIVAL to 1>>
===

title: Ep47_Marshal
---
<<shot wide>>
The front ranks are gone. Behind them, the Marshal comes forward for the first time, enormous, the blade of his glaive as long as a man.
<<shot on Masked>>
The masked knight doesn't go to meet him. He lifts one hand.
<<fx floor Marshal>>
<<hide Marshal>>
<<shot wide>>
And a black tear opens in the ground under the Marshal's feet, and he's gone, and then he's falling out of the sky above his own ranks, and lands on them.
<<show MarshalFallen>>
<<shake 0.8>>
<<sfx slam>>
<<shot on Masked>>
One step back. One cut. The Marshal doesn't get up.
<<shot on Rook>>
Rook: That technique...
<<cue gateThrone>>
<<shot sky -34 46 78>>
And through the Gate, framed in the red, so far off it could be a painting: a vast empty throne. And before it, a sealed black coffin.
<<cue coffinShift>>
<<shot sky -34 42 78>>
As the Marshal falls, the coffin's lid shifts. Very slightly. Nobody on the bridge knows what they're looking at.
<<set $GATE_THRONE to 1>>
<<set $COFFIN_SHIFTED to 1>>
<<set $MARSHAL_DOWN to 1>>
===

title: Ep47_Turn
---
<<shot wide>>
What's left of the Line breaks and goes back up the hill. The bridge is full of armour that isn't moving. And the masked knight turns, not to the Lanterns, but north. To the hill. To the Archive.
<<shot on Lio>>
Lio: He's going to the Archive. To the lock.
<<shot on Juno>>
Juno: Half the Lowmarket's hiding in the Archive. Ottoline let them in. Everyone who couldn't get across.
<<shot two Rook Masked>>
Rook steps into his way.
-> "Not another step." #bold
    His head tilts, a little, as if he's listening. Then the glaive comes up.
-> "Whatever you're doing, not there." #earnest
    His head tilts, a little, as if he's listening. Then the glaive comes up.
<<set $SIEGE_TURN to 1>>
===
`;

const BR = { stage: "bridge" };
const HOLD = L.hold + 4; // where the Lanterns stand, a few paces north of where they won't give another inch
const LINE = { kind: "lineSoldier", rows: 3, cols: 4, at: { x: 0, z: HOLD + 14 }, gap: [2.0, 1.8] };
const squad = (z = HOLD) => [
  { id: "dagrun", look: "dagrun", x: -3.2, z: z - 1.6, yaw: 0.2 },
  { id: "tamsin", look: "tamsin", x: 3.4, z: z - 1.0, yaw: -0.3 },
  { id: "lio", look: "lio", x: -1.8, z: z - 3.4, yaw: 0.1 },
  { id: "juno", look: "juno", x: 1.6, z: z + 0.6, yaw: -0.1 },
];
// The Line, held in a frame: three ranks, staggered, facing down the bridge.
const ranks = (z0, n = 3, cols = 4) => Array.from({ length: n * cols }, (_, i) => {
  const r = Math.floor(i / cols), c = i % cols;
  return { id: `soldier${i}`, look: "lineSoldier", x: (c - (cols - 1) / 2) * 2.1 + (r % 2 ? 1.05 : 0), z: z0 + r * 1.9, yaw: Math.PI, crowd: true };
});

export const EPISODE_47 = {
  id: "ep47",
  number: 47,
  unlockAt: 5,
  setup: { ...AFTER_EP46 },
  title: "Lanterns in the Smoke",
  arc: "Arc 5 · Writ of Return",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "cold", type: "scene", node: "Ep47_Cold", ...BR,
      rook: { x: 0, z: HOLD, yaw: 0 },
      cast: [...squad(), { id: "bas", look: "bas", x: 3.0, z: HOLD - 3.6, yaw: -0.4 }] },
    { id: "title", type: "title" },
    { id: "hold", type: "fight", ...BR, wave: [], tokens: 2,
      siege: {
        meter: { label: "The city crossing", start: 1, end: 0.62, seconds: 70, perKill: 0.012 },
        line: { ...LINE, every: 540, max: 9 },
        rear: { kind: "lineMarshal", at: { x: 0, z: L.deck.z1 - 3 }, floor: 0.5 },
        marks: [{ meter: 0.8, cue: "collapse1", sfx: "slam", shake: 0.6, say: ["Tamsin", "The bridge! Behind us, it's going!"], set: { BRIDGE_FALLEN: 1 } }],
      },
      tutorial: [
        { at: 0.5, text: "Hold the bridge while the city crosses. They fight as a wall: guards toward you until they strike. Wait for the thrust, then get in." },
        { at: 16, text: "Left, left, back: when one steps back like that, the cut's coming. It can't be blocked. Dodge it." },
      ],
      lines: [["Dagrun", "Hold! Hold the bridge!"], ["Juno", "They're all moving together. All of them, at once."]],
      retry: "Up. The city's still crossing." },
    { id: "chaos", type: "scene", node: "Ep47_Chaos", ...BR,
      rook: { x: 0.4, z: HOLD - 0.6, yaw: 0.4 },
      cast: [
        { id: "juno", look: "juno", x: 1.6, z: HOLD + 2.4, yaw: -1.2, down: true }, // pinned, in front of them, between them and the Line
        { id: "bas", look: "bas", x: -2.6, z: HOLD + 0.8, yaw: 0.6 },
        { id: "tamsin", look: "tamsin", x: 3.6, z: HOLD - 2.6, yaw: -0.6 },
        { id: "lio", look: "lio", x: -2.2, z: HOLD - 3.4, yaw: 0.4 },
      ] },
    { id: "hold2", type: "fight", ...BR, wave: [], tokens: 2,
      siege: {
        meter: { label: "The city crossing", start: 0.62, end: 0.3, seconds: 60, perKill: 0.01 },
        line: { ...LINE, every: 480, max: 10 },
        rear: { kind: "lineMarshal", at: { x: 0, z: L.deck.z1 - 3 }, floor: 0.5 },
        marks: [{ meter: 0.48, cue: "collapse2", sfx: "slam", shake: 0.6, say: ["Dagrun", "That's the last span behind us! Nobody steps back!"], set: { BRIDGE_FALLEN: 2 } }],
      },
      lines: [["Bas", "I'm up. I'm up!"], ["Juno", "Nobody touches the Lanterns!"]],
      retry: "Up. Nearly everyone's across." },
    { id: "arrival", type: "scene", node: "Ep47_Arrival", ...BR,
      rook: { x: 0, z: HOLD, yaw: 0 },
      cast: [
        ...squad(),
        { id: "bas", look: "bas", x: 3.0, z: HOLD - 3.6, yaw: -0.4 },
        { id: "masked", look: "masked", x: 0.2, z: HOLD + 5.4, yaw: 0, hidden: true },
        ...ranks(HOLD + 10),
      ] },
    { id: "storm", type: "fight", ...BR, wave: [], tokens: 3,
      world: { companions: ["bas", "juno", "knightAlly"] },
      siege: {
        line: { ...LINE, every: 300, max: 10 },
        until: { kills: 14 },
        killLines: [{ by: "knightAlly", of: "lineSoldier", say: ["Masked", "Rest, soldier."], every: 360 }],
      },
      tutorial: [{ at: 0.5, text: "He's cutting through them. Fight in his wake." }],
      lines: [["Juno", "He's... he's fighting them."], ["Tamsin", "One cut. Every one of them, one cut."]],
      retry: "Up. He isn't waiting for anyone." },
    { id: "marshal", type: "scene", node: "Ep47_Marshal", ...BR,
      rook: { x: -0.6, z: HOLD + 2, yaw: 0 },
      cast: [
        { id: "masked", look: "masked", x: 0.4, z: HOLD + 7.6, yaw: 0 },
        { id: "marshal", look: "lineMarshal", x: 0, z: HOLD + 17, yaw: Math.PI },
        { id: "marshalFallen", look: "lineMarshal", x: 0.8, z: HOLD + 10.4, yaw: 2.6, down: true, hidden: true },
        { id: "juno", look: "juno", x: -3.0, z: HOLD + 0.6, yaw: 0.3 },
        { id: "lio", look: "lio", x: 3.2, z: HOLD + 0.2, yaw: -0.3 },
        ...ranks(HOLD + 13.2, 1, 3),
      ] },
    { id: "turn", type: "scene", node: "Ep47_Turn", ...BR,
      rook: { x: 0, z: HOLD + 6.0, yaw: 0 },
      cast: [
        { id: "masked", look: "masked", x: 0.3, z: HOLD + 9.4, yaw: Math.PI },
        { id: "lio", look: "lio", x: -3.0, z: HOLD + 3.4, yaw: 0.5 },
        { id: "juno", look: "juno", x: 2.8, z: HOLD + 3.0, yaw: -0.5 },
      ],
      set: { EP47_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep48",
      lines: [
        "Next time on UNWRITTEN: The Other Side of the Door.",
        "The bridge. The two of them. And everything Rook has learned since the vault.",
      ] },
  ],
};
