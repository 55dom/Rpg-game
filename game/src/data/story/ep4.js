// Episode 4 · The Village That Wasn't There (GDD §14, Arc 1; Boss 2 in §16).

export const EP4_SCRIPT = `
title: Ep4_Briefing
---
<<shot wide>>
Morning at the Lighthouse. Dagrun has spread a map across the dinner table.
<<shot on Dagrun>>
<<pose Dagrun point>>
Dagrun: First mission. Greywater Fens. A courier swears she passed a village out there yesterday.
<<pose Dagrun none>>
Dagrun: There's no village on the map. There never has been.
<<shot on Juno>>
Juno: So she was drunk.
<<shot on Dagrun>>
Dagrun: She was very sober and very scared. Bas, Juno, you're with the kid.
<<shot on Lio>>
Lio: {name}. Your grimoire. May I?
He opens it to the one page. Then he goes very still.
Lio: There are two new lines on it. Under the first spell. They weren't there yesterday.
<<shot on Rook>>
-> "New spells?" #earnest
    Lio: Tempest Edge. Wind Wall. Written in... your hand. I think.
-> "I didn't write those." #wry
    Lio: No. I don't think you did.
-> "Then I'm getting stronger." #bold
    Lio: ...Yes. That's one way to read it.
<<shot on Cal>>
Cal: Pages grow when you use them. Go use them. And bring Juno back in one piece; she's the only one who can sew.
<<set $NEW_LINES_SEEN to 1>>
===

title: Ep4_Fens
---
THE GREYWATER FENS
<<shot wide>>
Reeds, fog, and still water. And in the middle of it, a village. Whole houses, standing empty.
<<shot on Bas>>
Bas: The map says there's nothing here. Not even ruins.
<<shot on Juno>>
<<pose Juno cross>>
Juno: The doors are open. The tables are set. Where did everyone go?
<<pose Juno none>>
<<shot on Bas>>
Bas: Footprints. Choir boots. Lots of them.
<<shot two Juno Rook>>
Juno: Stay close, one-page. If this goes bad, I'm not carrying you.
-> "Deal." #earnest
-> "You'd carry me. Admit it." #wry
    Juno: I would drag you. By the ankle.
-> "Try to keep up." #bold
    Juno: Ha. Cute.
===

title: Ep4_Choice
---
<<shot wide>>
The last Choir acolyte breaks and runs for the reeds, clutching a book.
<<shot on Mirren>>
Mirren: Help! Help me, please!
A little girl is up to her chest in the bog, and it's pulling her down.
<<shot on Juno>>
Juno: The acolyte has a book. That might be why this village vanished.
<<shot on Bas>>
Bas: {name}. The child.
<<shot on Rook>>
-> Save the girl.
    <<set $MIRREN_SAVED to 1>>
    <<move Rook 1 7 wait>>
    You reach in up to your shoulders and haul her out. She's freezing, and she's holding on tight.
    <<shot two Mirren Rook>>
    Mirren: I'm Mirren. I live... I lived here. I think. Everyone was gone when I woke up.
    The acolyte, and his book, are gone into the fog.
-> Chase the acolyte.
    <<set $MIRREN_SAVED to 0>>
    You run. Behind you, Bas shouts something, and the bog goes quiet.
    The acolyte is fast, but you're faster. You tackle him in the reeds. The book is soaked through, its ink running away.
    <<shot on Bas>>
    Bas: ...I couldn't reach her in time. I'm sorry. I'm so sorry.
<<shot on Juno>>
Juno: The bog. Something in the bog is moving.
===

title: Ep4_After
---
<<shot wide>>
The bog drains away. The Bogwarden doesn't get up.
<<shot on Rook>>
A page tears loose from the mud and floats to you, glowing faintly. It settles into your grimoire like it always belonged there.
<<sfx surgeFull>>
RARE PAGE · VACUUM PULL
<<set $PAGE_VACUUM_PULL to 1>>
<<if $MIRREN_SAVED>>
    <<shot on Mirren>>
    Mirren: You fixed it. You fixed the bog.
    Mirren: Will you come back? Promise you'll come back.
    -> "I promise." #earnest
    -> "Try and stop me." #bold
    -> "Only if you save me a snack." #wry
        Mirren: I don't have any snacks. Everyone's gone.
<<else>>
    <<shot on Bas>>
    Bas sits at the edge of the drained bog for a long time. Nobody tells him to get up.
<<endif>>
<<shot two Juno Rook>>
Juno: ...You did all right, one-page.
Juno: Don't let it go to your head. There's not much room in there.
<<shot on Bas>>
Bas: So where did a whole village go?
<<shot on Juno>>
Juno: Somewhere the Choir doesn't want us looking.
===
`;

const FENS = { stage: "fens" };
const SQUAD = [
  { id: "juno", look: "juno", x: -1.4, z: -3.4, yaw: 0.3 },
  { id: "bas", look: "bas", x: 1.6, z: -3.6, yaw: -0.3 },
];

export const EPISODE_4_STORY = {
  id: "ep4",
  number: 4,
  title: "The Village That Wasn't There",
  arc: "Arc 1 · The One-Page Mage",
  // The squad's first mission: Bas and Juno fight beside you. New lines have appeared on the page.
  world: { companions: true, ultimate: true, pages: true, loadout: { Spell2: null } },
  beats: [
    { id: "title", type: "title" },
    { id: "briefing", type: "scene", node: "Ep4_Briefing", stage: "lighthouse",
      rook: { x: 3.6, z: 7.8, yaw: Math.PI / 2 },
      cast: [
        { id: "dagrun", look: "dagrun", x: 5, z: 2.6, yaw: 0 },
        { id: "juno", look: "juno", x: 3.6, z: 5.6, yaw: Math.PI / 2 },
        { id: "bas", look: "bas", x: 6.4, z: 5.4, yaw: -Math.PI / 2 },
        { id: "lio", look: "lio", x: 6.4, z: 7.8, yaw: -Math.PI / 2 },
        { id: "cal", look: "cal", x: 5, z: 10, yaw: Math.PI },
      ] },
    { id: "fens", type: "scene", node: "Ep4_Fens", ...FENS, rook: { x: 0, z: -4.4, yaw: 0 }, cast: SQUAD },
    { id: "road", type: "fight", ...FENS, wave: ["acolyte", "acolyte", "acolyte"],
      lines: [["Juno", "Choir robes, this far out? Stay sharp, one-page."], ["Bas", "If it gets heavy, get behind me."]],
      tutorial: [
        { at: 1, text: "Bas and Juno fight beside you. Press {Assist} to call Bas, {Assist2} to call Juno." },
        { at: 10, text: "Fill the bright Surge bar, then press {Ultimate} for Skyrender." },
      ],
      retry: "Again. Together this time." },
    { id: "reeds", type: "fight", ...FENS, wave: ["hound", "hound", "hound", "acolyte"],
      lines: [["Bas", "Fen hounds. They never hunt alone."], ["Juno", "Then we cut the pack apart."]],
      retry: "Again. Watch the lunges." },
    { id: "choir", type: "fight", ...FENS, wave: ["acolyte", "acolyte", "cantor", "bulwark"],
      lines: [["Juno", "Hear that hymn? Silence the singer first."], ["Bas", "And don't hit the shield head-on."]],
      retry: "Again. Singer first." },
    { id: "water", type: "fight", ...FENS, wave: ["beast", "cantor", "acolyte"],
      lines: [["Juno", "That is not a hound."], ["Bas", "Break its stance first. It won't fall otherwise."]],
      retry: "Again. Break its stance." },
    { id: "choice", type: "scene", node: "Ep4_Choice", ...FENS,
      rook: { x: 0, z: 2, yaw: 0 },
      cast: [
        { id: "mirren", look: "mirren", x: 1.4, z: 8, y: -0.75, yaw: Math.PI }, // chest-deep in the bog
        { id: "acolyte", look: "acolyte", x: -5, z: 9, yaw: -0.8 },
        ...SQUAD.map((c) => ({ ...c, z: c.z + 4.6 })),
      ] },
    { id: "hask", type: "fight", ...FENS, wave: ["hask"],
      lines: [["Juno", "The bog is moving."], ["Bas", "Wind, {name}! Tear it out of the mud!"]],
      eventHints: {
        submerge: "It dove. Watch the mound: hit it with a wind spell ({Spell1}) to uproot it.",
        eruptWarning: "Red circle: get out before it erupts!",
      },
      retry: "Again. Wind tears it out of the mud." },
    { id: "after", type: "scene", node: "Ep4_After", ...FENS, if: "$MIRREN_SAVED",
      rook: { x: 0, z: 0, yaw: 0 },
      cast: [
        { id: "juno", look: "juno", x: -1.6, z: 1.4, yaw: 2.4 },
        { id: "bas", look: "bas", x: 1.8, z: 1.6, yaw: -2.4 },
        { id: "mirren", look: "mirren", x: 0.2, z: 2.6, yaw: Math.PI },
      ] },
    { id: "afterAlone", type: "scene", node: "Ep4_After", ...FENS, if: "not $MIRREN_SAVED",
      rook: { x: 0, z: 0, yaw: 0 },
      cast: [
        { id: "juno", look: "juno", x: -1.6, z: 1.4, yaw: 2.4 },
        { id: "bas", look: "bas", x: 1.8, z: 1.6, yaw: -2.4 },
      ] },
    { id: "preview", type: "preview", next: "Episode 5 · Thread and Needle",
      lines: [
        "Next time on UNWRITTEN:",
        "Juno thinks you're a liability. A mission where thread decides everything.",
        "And a red cord tied on every Lantern's wrist.",
      ] },
  ],
};
