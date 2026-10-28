// Episode 50 · The First Time (GDD §15.8, the fight against Cal, Phases 4–6 and the ending; docs/BACKLASH.md "Return to
// the present" and "The Perspective Choice"; §15.11: this folder is the one allowed to name him).
//
// The match cut: the same grin, on the face he has now. The debris that hung in the air finishes falling. "So. That's how
// I died. ...The first time." He sits on a golden door frame and swings one leg. Whose story?
//
//   Rook's   Phase 4, Not serious: he grades you, and only what's interesting gets an answer (the Interest gauge, not his
//            health). Phase 5, the board: the Lanterns, moved through doors like pieces, each alone somewhere in the city.
//            Phase 6, Bonds: they fight their way back; every one who reaches you is a Link; all of them, the Lantern Chain.
//   His      the same three phases from the other side: on his door, only stepping aside, rating them; moving them like
//            pieces; then everything he has against a party that keeps finding each other, and the Chain, from the losing
//            side. (Cal's Path, the rest of his story, is for later: the Lore Archive, when the Field Notes are found.)
//
// Then: "Was any of it real?" "That's the funny part. ...I actually liked you. ...I just never said I had to be on your
// side." A door; the Gate, closed from the other side; the siege over. That night, on the bare bed in his old room, a
// stack of notebooks that wasn't there this morning. FIELD NOTES, for Rook.

import { AFTER_EP49 } from "./arcs.js";
import { ZONES, BRIDGE_LAYOUT as L } from "../data/zones.js";
import { CAL_WEAR, CAL_SEATED_WEAR } from "./finale.js";

export const EP50_SCRIPT = `
title: Ep50_First
---
<<shot on Cal>>
Cal: So. That's how I died.
<<shot on Cal>>
His smile grows.
<<shot on Cal>>
Cal: ...The first time.
<<shot on Rook>>
Rook doesn't say anything. Rook can't.
<<pose Cal tilt>>
<<shot on Cal>>
Cal: Don't mistake that for a confession.
<<shot on Cal>>
Cal: It was an introduction.
<<cue doorSeat>>
<<sfx door>>
<<pose Cal sit>>
<<shot wide>>
A golden door frame stands open beside him. He sits on its lower edge and swings one leg. Somewhere under the noise of the city, the march, once, low and quiet.
<<sfx tuneMarch>>
<<shot on Cal>>
Cal: Your move.
<<shot two Cal Rook>>
Whose story?
-> Rook's.
    <<set $PERSPECTIVE to "rook">>
-> His.
    <<set $PERSPECTIVE to "cal">>
===

title: Ep50_Board
---
<<cue doorSeatOff>>
<<pose Cal none>>
<<shot on Cal>>
He gets up off the door, and stretches, like someone who's been sitting too long.
<<shot on Cal>>
Cal: All right. Let's see how you do apart.
<<shot board>>
And it's as if the camera's gone up, and up, until the bridge is a board, and the Lanterns are pieces on it.
<<fx door Juno>>
<<hide Juno>>
Juno, through a door, into the Lowmarket and a squad of them.
<<fx door Bas>>
<<hide Bas>>
Bas, out onto the Archive steps.
<<fx door Dagrun>>
<<hide Dagrun>>
Dagrun, somewhere in the smoke by the south gate.
<<shot on Rook>>
And Rook, alone, on the bridge.
<<shot on Cal>>
Cal: Pieces on a board. Don't take it personally. I'd do it to anyone.
===

title: Ep50_BoardCal
---
<<cue doorSeatOff>>
<<shot board>>
From up here it's a board, and they're pieces on it, and every door in the city is yours.
Where does Juno go?
-> Through a door, into the Lowmarket.
    <<set $BOARD_JUNO to "lowmarket">>
    <<fx door Juno>>
    <<hide Juno>>
    Cal: She'll be furious. Good. She fights better furious.
-> Out onto the Archive steps.
    <<set $BOARD_JUNO to "archive">>
    <<fx door Juno>>
    <<hide Juno>>
    Cal: All those stairs. She hates stairs.
Where does Bas go?
-> Out to the south gate.
    <<set $BOARD_BAS to "gate">>
    <<fx door Bas>>
    <<hide Bas>>
    Cal: Somebody has to hold it. He'll think it was his idea.
-> Down into the old city.
    <<set $BOARD_BAS to "oldcity">>
    <<fx door Bas>>
    <<hide Bas>>
    Cal: Down where it's dark. He'll count his steps. He always does.
<<fx door Dagrun>>
<<hide Dagrun>>
And Dagrun, into the smoke by the south gate, because somebody has to keep him from following.
<<shot on rookStand>>
And Rook stays where you leave them. Alone, on the bridge.
Cal: Pieces on a board. Don't take it personally.
===

title: Ep50_End
---
<<shot on Cal>>
He's down on one knee, a hand on his ribs, and he's laughing. Softly. Hit, really hit, for the first time.
<<shot on rookStand>>
Rook: Was any of it real?
<<shot on Cal>>
Cal: That's the funny part.
<<shot wide front>>
He looks past Rook. At Juno. At Bas, and Tamsin, and Dagrun.
<<shot on Cal>>
Cal: I actually liked you.
<<wait 1.2>>
<<shot on Cal>>
Cal: I just never said I had to be on your side.
<<pose Cal none>>
<<fx door Cal>>
<<hide Cal>>
<<shot sky -34 44 78>>
He opens a door. Through it, the Gate, and the red beyond. He steps through, and closes it from the other side.
<<set $GATE_OPEN to 0>>
<<set $GATE_SEALED to 1>>
<<cue gateSeal>>
<<sfx slam>>
<<shake 0.4>>
<<shot sky -34 44 78>>
And over the Crown Ward the Gate draws shut, slowly, and the red goes out of the sky round it.
<<shot wide>>
On the bridge, the Line stops. No order comes. One by one, they lower their glaives.
<<shot on Juno>>
Juno: ...Is it over?
<<shot on Dagrun>>
Dagrun: The siege is.
<<set $SIEGE_OVER to 1>>
===

title: Ep50_Night
---
That night, the Lighthouse. Nobody says much. Nobody goes to bed, either.
===

title: Ep50_Notes
---
His old room. Juno boxed it up after the funeral, and since then it's been a bare bed and an empty shelf.
On the bare bed, a stack of notebooks that wasn't there this morning.
The cover, in a hand everyone at the table knows. FIELD NOTES. For Rook.
The first page is a careful sketch of every Lantern, each with a small note under it.
Juno. Ties a knot when she's scared. Don't tell her you know.
Bas. Counts his steps in a fight. Let him.
Tamsin. Means it, every time. Don't waste that.
Lio. Reads everything. Give him the hard ones.
Dagrun. Leaves the light on. Make sure he sleeps.
Under Rook's sketch, there's no note. Just a drawing of the brass key.
<<set $FIELD_NOTES to 1>>
===
`;

const BR = { stage: "bridge" };
const ROOK = { x: 0, z: 2.4 }, CAL = { x: L.seat.x, z: L.seat.z };
const DUEL = { bounds: ZONES.bridge.bounds, origin: { x: 0, z: -2 } };
const squad = [
  { id: "juno", look: "juno", x: -1.8, z: -4.0, yaw: 0.3 },
  { id: "bas", look: "bas", x: 2.4, z: -2.8, yaw: -0.4 },
  { id: "dagrun", look: "dagrun", x: 3.6, z: -0.4, yaw: -0.6 },
];
const CAL_SIDE = '$PERSPECTIVE == "cal"', ROOK_SIDE = '$PERSPECTIVE != "cal"';
const LANTERNS = (floor) => [
  { kind: "rookFoe", x: 0, z: 2.0, yaw: 0, floor }, { kind: "junoFoe", x: -2.2, z: 1.0, yaw: 0, floor }, { kind: "basFoe", x: 2.2, z: 1.0, yaw: 0, floor },
];

export const EPISODE_50 = {
  id: "ep50",
  number: 50,
  unlockAt: 5,
  setup: { ...AFTER_EP49 },
  title: "The First Time",
  arc: "Arc 5 · Writ of Return",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "return", type: "cutscene", cutscene: "ep50_return" },
    { id: "first", type: "scene", node: "Ep50_First", ...BR,
      rook: { x: ROOK.x, z: ROOK.z, yaw: 0 },
      cast: [{ id: "cal", look: "unmasked", x: CAL.x, z: CAL.z, yaw: Math.PI }, ...squad] },
    { id: "title", type: "title" },

    // ---- Rook's story ----
    { id: "notSerious", type: "fight", if: ROOK_SIDE, ...BR, wave: [], tokens: 2,
      world: { ...DUEL },
      siege: {
        foes: [{ kind: "calSeated", x: CAL.x, z: CAL.z, yaw: Math.PI }],
        line: { kind: "lineSoldier", rows: 1, cols: 3, at: { x: 0, z: 3.2 }, gap: [1.8, 1.6], every: 420, max: 4 },
        rise: { label: "Interest", gains: { perfectDodge: 0.14, parry: 0.14, postureBreak: 0.12, assist: 0.08, teamAttack: 0.3, reaction: 0.05 }, answer: "calSeated" },
        idle: { every: 420, say: [["Cal", "Boring."], ["Cal", "I've seen that one."], ["Cal", "Your move."], ["Cal", "Juno. Your left foot. Again."]] },
        marks: [
          { frame: 1, cue: "doorSeat" },
          { rise: 0.3, say: ["Cal", "Oh. There you are."] },
          { rise: 0.6, say: ["Cal", "Better. Again."] },
          { rise: 0.9, say: ["Cal", "Now you're interesting."] },
        ],
      },
      tutorial: [
        { at: 0.5, text: "He won't fight you. He sits on his door and grades you. His Interest is the bar now, not his health." },
        { at: 9, text: "Only something interesting catches his eye: a perfect dodge, a parry, a broken guard, an Assist, a team attack. And he answers it." },
      ],
      eventHints: { strikeWarn: "His answer: a door, under you. Step out of it." },
      lines: [["Cal", "Go on, then. Show me something."]],
      retry: "Up. He's still sitting there." },
    { id: "board", type: "scene", if: ROOK_SIDE, node: "Ep50_Board", ...BR,
      rook: { x: ROOK.x, z: ROOK.z, yaw: 0 },
      cast: [{ id: "cal", look: "unmasked", x: CAL.x, z: CAL.z, yaw: Math.PI }, ...squad] },
    { id: "alone", type: "fight", if: ROOK_SIDE, ...BR, wave: ["lineSoldier", "lineSoldier", "lineSoldier", "lineSoldier"], tokens: 2,
      world: { ...DUEL, companions: false },
      tutorial: [{ at: 0.5, text: "Alone. Juno, Bas and Dagrun are fighting somewhere else in the city, just as alone. Get back to them." }],
      lines: [["Rook", "...Fine."]],
      retry: "Up. They're out there somewhere." },
    { id: "bonds", type: "fight", if: ROOK_SIDE, ...BR, wave: [], tokens: 3,
      world: { ...DUEL, companions: false },
      siege: {
        foes: [{ kind: "calBonds", x: CAL.x, z: CAL.z - 1.4, yaw: Math.PI }],
        rise: { label: "Links", gains: { hit: 0.016, assist: 0.12, teamAttack: 0.3, perfectDodge: 0.05 } },
        marks: [
          { frame: 240, join: "juno", sfx: "door", say: ["Juno", "Found you. I've got your left."], set: { LINK_JUNO: 1 } },
          { frame: 720, join: "bas", sfx: "door", say: ["Bas", "Nobody touches the Lanterns. Nobody."], set: { LINK_BAS: 1 } },
          { rise: 0.55, say: ["Dagrun", "That's it. All of you. TOGETHER."], set: { LINK_DAGRUN: 1 } },
          { rise: 0.85, say: ["Cal", "...Huh."] },
        ],
      },
      tutorial: [
        { at: 0.5, text: "BONDS. The others are fighting their way back to you. Every one who reaches you is a Link." },
        { at: 10, text: "Fill the Links: hit him, together. Call your squad's Assists. With every Link, the Lantern Chain." },
      ],
      lines: [["Cal", "Let's see it, then. Whatever it is you've got that I don't."]],
      retry: "Up. They came back for you. Get up." },

    // ---- His ----
    { id: "notSeriousCal", type: "fight", if: CAL_SIDE, ...BR, wave: [], tokens: 3,
      world: { ...DUEL, companions: false, kit: CAL_SEATED_WEAR, origin: { x: CAL.x, z: CAL.z - 1.2 } },
      siege: {
        foes: LANTERNS(0.5),
        meter: { label: "Your patience", start: 1, end: 0, seconds: 40, perKill: 0 },
        marks: [
          { frame: 1, cue: "doorSeat" },
          { frame: 360, say: ["Cal", "Sloppy. Your guard drops every time you breathe."] },
          { frame: 1000, say: ["Cal", "Better."] },
          { frame: 1600, say: ["Cal", "Oh, that one was nice. Juno, again."] },
          { frame: 2200, say: ["Cal", "Now you're getting interesting."] },
        ],
      },
      tutorial: [
        { at: 0.5, text: "His side. He sits on his door and can't be bothered to fight. You can only step aside (DODGE: a door), and watch them, and rate them." },
      ],
      lines: [["Cal", "Go on, then. Show me something."]],
      retryBy: "Cal", retry: "Again. I wasn't watching." },
    { id: "boardCal", type: "scene", if: CAL_SIDE, node: "Ep50_BoardCal", ...BR, rook: null, // the player is him now: Rook is someone else on the board
      cast: [{ id: "rookStand", look: "player", x: ROOK.x, z: ROOK.z, yaw: 0 }, ...squad] },
    { id: "bondsCal", type: "fight", if: CAL_SIDE, ...BR, wave: [], tokens: 3, getUps: 3,
      world: { ...DUEL, companions: false, kit: CAL_WEAR, origin: { x: CAL.x, z: CAL.z - 1.2 } },
      siege: {
        foes: LANTERNS(0.6),
        until: { frames: 60 * 50 },
        marks: [
          { frame: 600, sfx: "door", say: ["Juno", "Rook! I'm here! Left!"] },
          { frame: 1500, sfx: "door", say: ["Bas", "Pillar's up. Go!"] },
          { frame: 2400, say: ["Rook", "Now. All of us."] },
        ],
      },
      tutorial: [{ at: 0.5, text: "Everything he has, against a party that keeps finding each other. You will lose. Feel it from the losing side." }],
      lines: [["Cal", "Come on, then."]],
      retryBy: "Cal", retry: "Not yet. They're not done with me." },

    // ---- Both: the Chain, and what he says, and the door ----
    { id: "chain", type: "cutscene", cutscene: "ep50_chain", set: { CHAIN_DONE: 1 } },
    { id: "ending", type: "scene", node: "Ep50_End", ...BR, rook: null, // whoever the player was a moment ago, this is Rook's question
      cast: [
        { id: "rookStand", look: "player", x: 0, z: 4.6, yaw: 0 },
        { id: "cal", look: "unmasked", x: CAL.x, z: CAL.z + 1.4, yaw: Math.PI, pose: "kneel" },
        { id: "juno", look: "juno", x: -2.8, z: 3.2, yaw: 0.5 },
        { id: "bas", look: "bas", x: 2.8, z: 3.4, yaw: -0.5 },
        { id: "dagrun", look: "dagrun", x: 3.4, z: 0.8, yaw: -0.4 },
        { id: "tamsin", look: "tamsin", x: -3.4, z: 0.6, yaw: 0.5 },
      ],
      set: { EP50_DONE: 1 } },
    { id: "notes", type: "explore", stage: "lighthouse", sky: { daylight: 0.18 }, fresh: true, // Rook again, in Rook's own body
      rook: { x: 0, z: 2, yaw: Math.PI },
      intro: "Ep50_Night",
      objective: "His old room.",
      required: ["notes"],
      cast: [{ id: "dagrun", look: "dagrun", x: -7, z: 5.6, yaw: 0.8, pose: "sit" }],
      pickups: [{ id: "notes", x: -4.0, z: 9.6, node: "Ep50_Notes", label: "His old room" }] },
    { id: "preview", type: "preview",
      lines: [
        "Next time on UNWRITTEN: Arc 6, The Light Left On.",
        "Field notes. For Rook.",
      ] },
  ],
};
