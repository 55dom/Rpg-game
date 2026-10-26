// Episode 26 · The Vault Beneath Ironhold (GDD §14 Arc 3, §15.7 Encounter II, §16 B9). The Lanterns guard the
// Crown's sealed vault under the mountain. On the third night the masked knight steps out of the wall, cuts the
// door open, and fights the whole squad (Boss 9). At a quarter of his strength he takes the sealed reliquary,
// breaks Bas's arm when Bas won't move out of the doorway, looks at Rook, and leaves. Three days later the
// Crown's posters give him a name: the Sable Knight.
//
// Bridge clues here, never pointed at (§15.4 rule 4): B2 (his sidesteps, in the fight), B3 (the head tilt
// when Rook speaks to him), B7 (the mask's voice, a little lighter than it will be next time).

import { AFTER_EP25 } from "./arc3.js";

export const EP26_SCRIPT = `
title: Ep26_Descent
---
<<shot wide>>
Ironhold, under the mountain. Two hundred steps down from the gatehouse, the stairs open into a round stone room with braziers along the walls and gold inlaid in the floor.
<<shot on Hale>>
Hale: Quartermaster Hale. Iron Wardens. The vault's been under my keys for eleven years, and in eleven years nobody but me has set foot down here.
<<shot on Archivist>>
Archivist: Reliquary Seven is behind that door. Sealed by the Paragon's own hand. I'm not permitted to know what's inside it, Captain, and neither are you.
<<shot on Dagrun>>
Dagrun: Wonderful. My favorite kind of thing to die guarding.
<<if $LIO_STATUS == 2>>
    <<shot on Lio>>
    Lio: These wards in the floor aren't to keep people out. Look at the way the lines run. They're to keep something in.
    <<shot on Juno>>
    Juno: Did the Choir teach you that?
    Lio: ...Yes. They taught me a lot of things. I'm trying to use them on our side now.
<<else>>
    <<shot on Tamsin>>
    Tamsin: Lio would know what these lines in the floor say. ...Don't look at me like that. He would.
<<endif>>
<<shot on Bas>>
Bas walks to the Crown's door and turns his back on it, facing the room.
Bas: Nobody gets past me. The wall doesn't move.
===

title: Ep26_Hale
---
Hale: Three nights now. Every hour I walk the room and count the braziers, and every hour there are sixteen.
Hale: Two other vaults were opened this month. No locks broken. If he comes, he won't come down the stairs.
===

title: Ep26_Archivist
---
Archivist: I keep a ledger of every seal the Paragon has set. Reliquary Seven's entry is one line long.
Archivist: "Not to be opened." That's all. I've read it every day for nine years, and it has never once said why.
===

title: Ep26_Bas
---
Bas: Brannoc held a wall for twenty years. I can hold a door for three nights.
Bas: I'm fine, {name}. Go walk your rounds. If anything comes through that door, it comes through me first.
===

title: Ep26_Juno
---
Juno: I hate it down here. No sky. Every time a brazier pops I think it's him.
Juno: If he comes, I'm tying him to that pillar. I brought a lot of cord.
===

title: Ep26_Tamsin
---
Tamsin: I've been trying to write the song about the man on the ridge. I can't get past the first line. The first line is "Who the hell was that?"
===

title: Ep26_Dagrun
---
Dagrun: Old soldier's trick: you don't watch the door. You watch the walls. Anyone can come through a door.
===

title: Ep26_Lio
---
Lio: The gold in the floor is old Crown script. It says the same thing all the way round: "Hold. Hold. Hold."
Lio: Whatever's in that reliquary, somebody wanted it to stay put very badly.
===

title: Ep26_Arrival
---
<<shot wide>>
The third night of the watch. The braziers burn low. Somewhere above, the wind moves over the mountain. Down here, nothing moves at all.
<<shot on Bas>>
Bas: Did you hear that?
<<shot wide>>
Nobody did. Then the stone beside the Crown's door splits from top to bottom, and the split is black.
<<fx tear Masked>>
<<show Masked>>
<<set $SABLE_ENCOUNTER to 2>>
<<shot on Masked>>
A figure steps out of the wall. A heavy cloak, a smooth black mask, a long black glaive held low. The gold in the floor flares, and does nothing at all.
<<shot on Hale>>
Hale: Halt! In the Crown's name, halt!
<<shot on Masked>>
He doesn't look at the quartermaster. He looks at the door.
<<shot two Masked Rook>>
-> "You. From the ridge." #bold
    <<pose Masked tilt>>
    His head tips a little to one side, as if he's listening for the rest of the sentence.
-> "Who are you?" #earnest
    <<pose Masked tilt>>
    His head tips a little to one side, as if the question interests him more than any answer would.
<<set $CLUE_B3 to 1>>
<<shot on Masked>>
Masked: Stand aside.
<<pose Masked none>>
<<shot on Bas>>
Bas: No. The wall doesn't move.
<<shot on Masked>>
The glaive comes up once. A black line runs down the Crown's door, and the door comes apart around it like cloth.
<<cue doorCut>>
<<set $VAULT_BREACHED to 1>>
<<shot on Masked>>
Masked: It will.
===

title: Ep26_Arm
---
<<pose Bas bow>>
<<shot wide>>
The seam closes behind him. The vault is very quiet. Behind the broken door, the plinth is empty.
<<shot on Bas>>
Bas is on one knee in the doorway, holding his left arm against his chest. It's bent in a place arms don't bend.
Bas: The wall moved.
<<shot on Juno>>
Juno: Don't talk. Give it here. ...Give it here, Bas.
She splints it with a Warden's scabbard and binds it with red cord, knot by knot, the same knot as always.
<<pose Bas none>>
<<shot two Bas Rook>>
-> "He could have killed you." #earnest
    Bas: He could have killed all of us. He broke my arm instead, so I'd stop standing in his way. I don't know what that is.
-> "We'll get it back. Whatever he took." #bold
    Bas: Get it back first. Then tell me what it was. I'd like to know what my arm was worth.
<<shot on Dagrun>>
Dagrun: He had me in his first ten seconds, and then he just... didn't. He let every one of us live.
<<shot on Tamsin>>
Tamsin: He let {name} live. He was standing right there. He looked at you, and then he left.
<<shot on Archivist>>
Archivist: Reliquary Seven. Sealed since before the Paragon's grandfather was born, and he walked through the wards like they were cobwebs.
Archivist: The Crown will want a name for whoever took it. It will have one by morning.
<<if $LIO_STATUS == 2>>
    <<shot on Lio>>
    Lio: He didn't break the wards. He went under them. Like a draught under a door.
<<else>>
    <<shot on Tamsin>>
    Tamsin: Somebody should tell Lio about those wards. ...I'm only saying. He'd want to know.
<<endif>>
===

title: Ep26_Posters
---
<<shot wide>>
Three days later, Aurelin. Bas's arm is in a sling. There's a new poster on every notice board in the city.
<<shot on Tamsin>>
Tamsin: "Wanted by the Crown. The Sable Knight. Five thousand Marks." ...The Sable Knight.
Tamsin: They gave him a name. It's a good name. I hate that it's a good name.
<<shot on Juno>>
Juno: Five thousand Marks. For that we could put a new roof on the Lighthouse. And a new Lighthouse under it.
<<shot on Gossip>>
Gossip: You're the Lanterns, aren't you? You were there. They're saying he walked through the vault's wards like he'd been taught them.
Gossip: You don't learn that outside the Crown, do you? He's one of their own. Has to be.
<<set $RUMOR_CROWN to 1>>
<<shot two Bas Rook>>
Bas: One of the Crown's own. A Choir runaway. A Hollow thing in a man's armor. Everyone has an answer.
-> "And you?" #earnest
    Bas: I'd settle for knowing why he looked at you like that.
-> "We'll find out." #bold
    Bas: We will. One-armed, if we have to.
===
`;

const VT = { stage: "vault" };
// The watch: everyone at their post (also where they stand when he comes).
const POSTS = {
  bas: { x: 0, z: 15.6, yaw: Math.PI }, hale: { x: -5.2, z: 10.4, yaw: 0.6 }, archivist: { x: 4.8, z: 11.2, yaw: -0.8 },
  juno: { x: -7.6, z: 4.2, yaw: 0.9 }, tamsin: { x: 8, z: 2.8, yaw: -1.1 }, dagrun: { x: 2.6, z: -5.4, yaw: 0 }, lio: { x: -3.6, z: 12.6, yaw: 0.2 },
};
const at = (id, extra = {}) => ({ id, ...POSTS[id], ...extra });

export const EPISODE_26 = {
  id: "ep26",
  number: 26,
  unlockAt: 5,
  setup: { ...AFTER_EP25 },
  title: "The Vault Beneath Ironhold",
  arc: "Arc 3 · Ashes and Echoes",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "title", type: "title" },
    { id: "descent", type: "scene", node: "Ep26_Descent", ...VT,
      rook: { x: 0.6, z: -11.4, yaw: 0 },
      cast: [
        { id: "hale", look: "quartermaster", x: -1.4, z: -9.4, yaw: Math.PI * 0.85 },
        { id: "archivist", look: "archivist", x: 1.8, z: -9.2, yaw: -2.6 },
        { id: "dagrun", look: "dagrun", x: -1.8, z: -12.4, yaw: 0.6 },
        { id: "juno", look: "juno", x: 2.6, z: -12.2, yaw: -0.4 },
        { id: "tamsin", look: "tamsin", x: -3.4, z: -9.8, yaw: 1.2 },
        { id: "lio", look: "lio", x: 3.6, z: -10.6, yaw: -0.9, when: "$LIO_STATUS == 2" },
        { id: "bas", look: "bas", x: 0.4, z: -7.6, yaw: 0 },
      ] },
    { id: "watch", type: "explore", ...VT,
      rook: { x: 0, z: -8, yaw: 0 },
      objective: "Walk your rounds of the vault. Check in with everyone on watch ({n}/{total}).",
      required: ["hale", "archivist", "bas"], counts: "required",
      cast: [
        at("hale", { look: "quartermaster", node: "Ep26_Hale" }), at("archivist", { look: "archivist", node: "Ep26_Archivist" }),
        at("bas", { look: "bas", node: "Ep26_Bas" }), at("juno", { look: "juno", node: "Ep26_Juno" }),
        at("tamsin", { look: "tamsin", node: "Ep26_Tamsin" }), at("dagrun", { look: "dagrun", node: "Ep26_Dagrun" }),
        at("lio", { look: "lio", node: "Ep26_Lio", when: "$LIO_STATUS == 2" }),
      ] },
    { id: "arrival", type: "scene", node: "Ep26_Arrival", ...VT,
      rook: { x: 1.8, z: 11.2, yaw: -0.15 },
      cast: [
        at("bas", { look: "bas" }), at("hale", { look: "quartermaster" }), at("archivist", { look: "archivist" }),
        { id: "juno", look: "juno", x: -1.6, z: 10.6, yaw: 0.2 }, { id: "tamsin", look: "tamsin", x: 3.8, z: 9.6, yaw: -0.4 },
        { id: "dagrun", look: "dagrun", x: 0.4, z: 9, yaw: 0 }, at("lio", { look: "lio", when: "$LIO_STATUS == 2" }),
        { id: "masked", look: "masked", x: -2.4, z: 16.4, yaw: Math.PI * 0.9, hidden: true },
      ] },
    { id: "fight", type: "fight", ...VT, wave: ["masked"], tokens: 2,
      tutorial: [
        { at: 0.5, text: "He steps into a black tear and out of another at your left side. The tear he comes out of stays open a moment: that's when to hit him." },
        { at: 12, text: "Swing at him up close and he steps aside. Watch where he goes." },
      ],
      eventHints: {
        severExposed: "The seam behind him is still open. He's exposed: hit him now.",
        hardLanding: "Dropped out of the air? Jump or dash before you land and you'll come down on your feet.",
        severMouths: "Every way out of the room leads back into it. There's nowhere to run.",
        severLine: "A black wall splits the room. Hold on: it won't last.",
      },
      lines: [["Bas", "Nobody touches that door!"], ["Juno", "Two tears. Watch for the second one!"]],
      retry: "Up. He's not finished, and neither am I.",
      set: { CLUE_B2: 1 } },
    { id: "taken", type: "cutscene", cutscene: "ep26_arm", set: { VAULT_TAKEN: 1, BAS_ARM_BROKEN: 1 } },
    { id: "arm", type: "scene", node: "Ep26_Arm", ...VT,
      rook: { x: 1.6, z: 16.2, yaw: -0.3 },
      cast: [
        { id: "bas", look: "basSling", x: 0.2, z: 19.4, yaw: Math.PI },
        { id: "juno", look: "juno", x: -0.9, z: 18.6, yaw: 2.2 },
        { id: "dagrun", look: "dagrun", x: 3, z: 14.4, yaw: -0.6 }, { id: "tamsin", look: "tamsin", x: -2.4, z: 14.8, yaw: 0.6 },
        { id: "archivist", look: "archivist", x: 4.2, z: 16.6, yaw: -1.4 }, { id: "hale", look: "quartermaster", x: -4, z: 16.2, yaw: 1.2 },
        { id: "lio", look: "lio", x: -3.4, z: 13.2, yaw: 0.6, when: "$LIO_STATUS == 2" },
      ],
      set: { SABLE_NAMED: 1 } },
    { id: "posters", type: "scene", node: "Ep26_Posters", stage: "aurelin",
      rook: { x: -6.0, z: -18.3, yaw: 0 }, // in front of the notice board on the gate road
      cast: [
        { id: "tamsin", look: "tamsin", x: -7.5, z: -17.8, yaw: 0.4 },
        { id: "juno", look: "juno", x: -4.6, z: -17.9, yaw: -0.5 },
        { id: "bas", look: "basSling", x: -5.2, z: -19.6, yaw: -0.2 },
        { id: "gossip", look: "gossip", x: -8.6, z: -19.4, yaw: 0.9 },
      ],
      set: { EP26_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep27",
      lines: [
        "Next time on UNWRITTEN:",
        "Severin's sister has never had a grimoire. His father has found a page that might change that.",
        "It only costs everything.",
      ] },
  ],
};
