// Episode 28 · Eclipse (GDD §14 Arc 3 finale, §16 B10, §8.6). At Mirrorlake Saelith the forbidden page has nearly
// finished writing Severin out. Boss 10: Severin Eclipsed. When the fight turns, the lake takes Rook; under the
// water the grimoire's under-text wakes (Annotation, the first stage), and Rook writes one clause: Severin comes
// home. The last phase is fought in ink. Hesper Voss steps out of a seam and takes the page's corruption away with
// a smile: she wanted the Palimpsest awake. The arc ends in the Valcourt crypt, with a flower on a grave.
//
// Then, for playtesters who opt in, the end-of-arc survey (core/playtest.js).

import { AFTER_EP27 } from "./arc3.js";
import { INSCRIBE } from "../inscription.js";

export const EP28_SCRIPT = `
title: Ep28_Shore
---
<<shot wide>>
Mirrorlake Saelith. A lake so still it holds the whole sky, and an island of pale stone in the middle of it.
Half the stars in the water have gone out. The other half are going.
<<shot on Severin>>
Severin stands at the island's heart. His whites have gone the color of ash. Around him the air is full of small black stars, and every one of them is pulling.
<<shot on Elodie>>
Elodie: Severin! I don't want it. Do you hear me? I never wanted it!
<<shot on Severin>>
Severin: You'll want it when it's done. Everyone wants what they were told they couldn't have.
<<shot on Lio>>
Lio: The page isn't writing a grimoire into Elodie. It's writing him out. When it's finished, there'll be a grimoire and no Severin.
<<shot two Severin Rook>>
-> "Severin. Come home." #earnest
    Severin: I can't hear you very well, one-page. It's so quiet in here.
-> "I'm not here as a friend. You said so." #bold
    Severin: Good. Then it won't hurt to lose to you.
<<shot on Severin>>
Severin: The last time, I let you get up. Not this time.
===

title: Ep28_Margin
---
<<shot wide>>
Rook comes up out of the shallows at the island's edge, coughing, soaked, and the grimoire in Rook's hand is burning cold.
The one page is still the one page. But there's a margin now, white and wide, and words have started down it in a hand Rook doesn't know.
And room, at the bottom, for one more line.
<<shot on Lio>>
Lio: The under-text. It's awake. {name}, it's asking you to write.
<<shot two Severin Rook>>
-> Write: "Severin comes home." #earnest
    <<set $CLAUSE_I to "home">>
-> Write: "Severin comes home. Whether he likes it or not." #bold
    <<set $CLAUSE_I to "home-anyway">>
<<shot on Severin>>
The ink runs off the page and into the air between you, and Severin flinches as if it's touched him.
Severin: ...What did you write?
<<set $ANNOTATION to 1>>
<<set $UNDERTEXT_STAGE to 1>>
===

title: Ep28_Hesper
---
<<shot wide>>
Severin is on his knees in the water. The black stars are gone. The page in his hand is smoking, the writing on it crawling like ants.
<<fx rift Hesper>>
<<show Hesper>>
A pale seam opens beside him, tall as a door, and a woman in white steps out of it as if it were a door she'd used every day of her life.
<<shot on Hesper>>
Hesper: Oh, well done. Well done, all of you.
She takes the page from Severin's hand. The black crawls up her fingers, her wrist, her arm, and she smiles as it goes, as if it tickles.
<<shot on Lio>>
Lio: Mother Hesper.
<<shot on Hesper>>
Hesper: Brother Lio. You never sent your third letter. You didn't need to. I could hear it from the other side of the country.
<<shot two Hesper Rook>>
Hesper: And you, little Palimpsest. Fifteen years I've waited for you to wake up. They gave you one page so you'd stay small.
Hesper: I could give you none, and you'd be free. Think about it. I'll ask again.
-> "Get away from him." #bold
    Hesper: I'm already going. I've got what I came for, and so have you.
-> "What are you?" #earnest
    Hesper: The only person in this kingdom who's ever been honest with you. Goodnight, Lanterns.
<<shot wide>>
She steps back into the seam, and it closes on her smile.
<<set $HESPER_SEEN to 1>>
===

title: Ep28_Home
---
<<shot wide>>
Dawn over Mirrorlake. The stars are back in the water, all of them, fading the way stars should.
<<shot on Elodie>>
Elodie: You idiot. You absolute idiot. I don't want a grimoire. I want a brother.
<<shot on Severin>>
Severin: You have one. ...You have one. I'm sorry.
<<shot two Severin Rook>>
Severin: You wrote on me, one-page. I felt it. Like a hand on my shoulder.
-> "It said 'come home.'" #earnest
    Severin: I know. I heard. ...Thank you.
-> "You're welcome. Don't make me do it again." #wry
    Severin: I'll try to be less interesting.
<<shot on Severin>>
Severin: One more thing, before I lose my nerve. My father's guards saw a man in a mask leave our family's crypt, the night before I read the page.
Severin: He'd left a flower on my brother's grave. Aurek was lost in the Hollowmarch six years ago. They never found him.
Severin: Why would a stranger bring my brother flowers?
<<set $RUMOR_AUREK to 1>>
<<shot on Dagrun>>
Dagrun: Let's go home. All of us. We'll be wrong about the knight tomorrow, when we've slept.
===

title: Ep28_Survey
---
<<survey arc3>>
===
`;

const ML = { stage: "mirrorlake" };

export const EPISODE_28 = {
  id: "ep28",
  number: 28,
  unlockAt: 5,
  setup: { ...AFTER_EP27 },
  title: "Eclipse",
  arc: "Arc 3 · Ashes and Echoes",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "title", type: "title" },
    { id: "shore", type: "scene", node: "Ep28_Shore", ...ML,
      rook: { x: 0, z: -8.4, yaw: 0 },
      cast: [
        { id: "severin", look: "eclipsed", x: 0, z: 4, yaw: Math.PI },
        { id: "elodie", look: "elodie", x: -2.2, z: -9.6, yaw: 0.3 },
        { id: "lio", look: "lio", x: 2.2, z: -9.8, yaw: -0.3 },
        { id: "juno", look: "juno", x: -3.6, z: -11, yaw: 0.4 },
        { id: "bas", look: "basSling", x: 3.4, z: -11.4, yaw: -0.4 },
      ] },
    { id: "eclipse", type: "fight", ...ML, wave: ["eclipsed"], tokens: 2,
      tutorial: [
        { at: 0.5, text: "Black stars pull you toward their cores, and the cores burn. Walk or dash out of the pull." },
        { at: 14, text: "His rapier is as quick as it ever was. Don't trade blows when you're being dragged." },
      ],
      eventHints: {
        lionCalled: "A Lion drawn in dark stars. While it stands, he's warded: bring it down first.",
        mirrorRise: "His reflection fights as he does, but nothing touches it. Watch them trade places: hit the one that isn't see-through.",
        eclipseClause: "The Eclipse clause: your Surge is gone, and it won't build for a while. Fight without it.",
      },
      lines: [["Juno", "Severin, snap out of it!"], ["Bas", "One arm's enough for this."]],
      retry: "Up. He doesn't get to disappear." },
    { id: "lake", type: "cutscene", cutscene: "ep28_lake" },
    { id: "margin", type: "scene", node: "Ep28_Margin", ...ML,
      rook: { x: 0, z: -15.4, yaw: 0 },
      cast: [
        { id: "severin", look: "eclipsed", x: 0, z: -9.6, yaw: Math.PI },
        { id: "lio", look: "lio", x: 3.4, z: -13.6, yaw: -1.4 },
      ] },
    { id: "final", type: "fight", ...ML, wave: ["eclipsedFinal"], tokens: 1,
      world: { loadout: { Spell1: INSCRIBE }, annotation: true, pages: false },
      tutorial: [
        { at: 0.5, text: "Your grimoire has a margin now. INSCRIBE (Gale's button) writes on him. Three clauses, and the page lets go." },
        { at: 9, text: "Anything your spells hit carries ink for a while, and your hits land harder on it." },
      ],
      lines: [["Lio", "Write, {name}! Write!"]],
      retry: "Up. One more line." },
    { id: "hesper", type: "scene", node: "Ep28_Hesper", ...ML,
      rook: { x: 0, z: -3.4, yaw: 0 },
      cast: [
        { id: "severin", look: "eclipsed", x: 0.4, z: 0.4, yaw: Math.PI, down: false },
        { id: "hesper", look: "hesper", x: 2.2, z: 1.6, yaw: -2.2, hidden: true },
        { id: "lio", look: "lio", x: -2.4, z: -3.6, yaw: 0.6 },
        { id: "elodie", look: "elodie", x: -1.2, z: -5.2, yaw: 0.2 },
      ],
      set: { SEVERIN_ECLIPSED: 1 } },
    { id: "home", type: "scene", node: "Ep28_Home", ...ML,
      rook: { x: 1.2, z: -4.6, yaw: -0.4 },
      cast: [
        { id: "severin", look: "severin", x: -0.6, z: -2.6, yaw: 2.6 },
        { id: "elodie", look: "elodie", x: -1.8, z: -3.4, yaw: 1.2 },
        { id: "dagrun", look: "dagrun", x: 2.8, z: -6.4, yaw: -0.8 },
        { id: "juno", look: "juno", x: -3.2, z: -6, yaw: 0.6 },
        { id: "bas", look: "basSling", x: 0.6, z: -7.6, yaw: 0 },
        { id: "lio", look: "lio", x: 3.6, z: -4.2, yaw: -1.6 },
        { id: "tamsin", look: "tamsin", x: -4.4, z: -4.2, yaw: 1.2 },
      ] },
    { id: "crypt", type: "cutscene", cutscene: "ep28_crypt", set: { CRYPT_FLOWER: 1, CRYPT_SEEN: 1 } },
    { id: "survey", type: "scene", node: "Ep28_Survey", ...ML, rook: null, cast: [],
      set: { EP28_DONE: 1, ARC3_DONE: 1 } },
    { id: "preview", type: "preview", next: "Arc 4 · The Unanswered Door",
      lines: [
        "Next on UNWRITTEN:",
        "Severin goes looking for a brother who was lost six years ago.",
        "And somewhere, a man in a mask is already one step ahead of him.",
      ] },
  ],
};
