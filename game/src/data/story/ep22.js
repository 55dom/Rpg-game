// Episode 22 · Ironsong (GDD §14 Arc 3, §16 B8). General Varka Ironsong and her siege engine. Brannoc's Final
// Vow ends the fight and he truly dies, on screen, his body there. At the Hall of Lanterns his wick turns to ash.

export const EP22_SCRIPT = `
title: Ep22_March
---
<<shot wide>>
Morning. The Ironsong rolls out of the smoke: a war tower on iron wheels, blue lightning crawling over its crown.
Walking in front of it, alone, is a woman in steel and gold, singing.
<<shot on Varka>>
Varka: Iron Wardens! Your wall has stood for eighty years. I've come to hear what it sounds like when it falls.
<<shot on Brannoc>>
Brannoc: Varka. You took Coldwater in a morning.
<<shot on Varka>>
Varka: I took Coldwater before breakfast. You'll take longer, old man. I respect that.
<<shot two Brannoc Rook>>
Brannoc: Lanterns. Bastion. Whatever happens out there, don't look back at the wall. The wall can look after itself.
Brannoc: Watch the ground. Watch the engine. Watch each other.
===

title: Ep22_Vow
---
<<pose Brannoc bow>>
<<shot wide>>
The light fades. The Ironsong lies in burning pieces across the field. Varka is down and doesn't get up.
Brannoc is on one knee, his sword in the earth, both hands on the hilt.
<<shot two Bas Brannoc>>
Bas: Sir. Sir, get up. It's over. You can get up.
<<shot on Brannoc>>
Brannoc: Final Vow. Everything, in one cut. There's nothing left to get up with, Bastion.
Brannoc: I knew. When I said it. That's how it works.
<<shot two Brannoc Rook>>
<<if $BRANNOC_VOW == 1>>
    Brannoc: You swore you wouldn't step back. You didn't. Not once. I watched.
<<elseif $BRANNOC_VOW == 2>>
    Brannoc: You swore you wouldn't leave anyone behind. Don't. Don't leave him behind either. He'll try to go alone.
<<elseif $BRANNOC_VOW == 3>>
    Brannoc: You swore you wouldn't lie to your squad. So tell them the truth. I'm not getting up.
<<else>>
    Brannoc: You stood. I told you you'd find out how, the day you needed to.
<<endif>>
-> "Don't. Stay with us." #earnest
    Brannoc: Can't, kid. Wish I could. You'd have been good at the Oath.
-> "The wall didn't move." #bold
    Brannoc: No. It didn't. Neither did I.
<<shot two Brannoc Bas>>
Brannoc: Bastion. The Wardens. It's yours now. Not the captaincy. The wall.
<<shot on Bas>>
Bas: I can't. I'm not you.
<<shot on Brannoc>>
Brannoc: Good. Be you. Stand there anyway.
<<shot wide>>
He doesn't say anything else. After a while, Bas takes his hand off the hilt and lays him down.
Behind them, along the whole length of the wall, the Iron Wardens take off their helmets.
<<set $BRANNOC_DEAD to 1>>
===

title: Ep22_HallBas
---
<<shot two Bas Rook>>
Bas is standing at the Iron Wardens' shelf. He hasn't moved since you came in.
Bas: It went to ash while we were still on the road. The Keeper said it fell in on itself, the moment it happened.
Bas: That's how they know. Ash. That's how everyone knows.
-> "He'd want you to stand." #earnest
    Bas: I know. I'm standing. Look at me. I'm standing.
-> "Come home, Bas. The Lighthouse is home too." #wry
    Bas: Mm. Both of them, then. I'll be a wall in two places. He'd find that funny.
<<shot wide>>
The squad stays until the Keeper starts putting out the hall lamps. Nobody says much. It's enough.
===

title: Ep22_HallJuno
---
Juno: Two lanterns in a month. I'm going to stop learning people's names.
Juno: ...No I'm not. Don't listen to me.
===
`;

const IH = { stage: "ironhold" };
const HL = { stage: "hall" };

export const EPISODE_22 = {
  id: "ep22",
  number: 22,
  unlockAt: 5,
  setup: { CAL_STATE: 1, LANTERN_LIT: 1, HAS_BRASS_KEY: 1, ARC2_DONE: 1, HAS_SUMMONS: 1, EP19_DONE: 1, EP20_DONE: 1, EP21_DONE: 1 },
  title: "Ironsong",
  arc: "Arc 3 · Ashes and Echoes",
  world: { companions: ["bas", "brannoc"] },
  beats: [
    { id: "title", type: "title" },
    { id: "march", type: "scene", node: "Ep22_March", ...IH,
      rook: { x: 0, z: -4, yaw: 0 },
      cast: [
        { id: "varka", look: "varka", x: 0, z: 7, yaw: Math.PI },
        { id: "brannoc", look: "brannoc", x: 1.7, z: -3.4, yaw: -0.2 },
        { id: "bas", look: "bas", x: -1.8, z: -4.2, yaw: 0.2 },
      ] },
    { id: "boss", type: "fight", ...IH, wave: ["varka"],
      tutorial: [
        { at: 0.5, text: "The Ironsong fires from behind her. Break it if you like; it can't walk." },
        { at: 10, text: "Rings on the ground are Thunderheads. Step out of them before the bolt lands." },
      ],
      eventHints: {
        engineRoll: "The engine is charging down the red lane. Get out of it.",
        engineBreaks: "Burning wreckage is falling. Orange rings: move.",
        railgun: "Railgun: a red glint, then she fires herself down the field. Dodge it.",
      },
      lines: [["Brannoc", "Iron Wardens! The wall does not move!"]],
      retry: "Up. The wall's still standing. So are we." },
    { id: "vow", type: "scene", node: "Ep22_Vow", ...IH,
      rook: { x: -1.2, z: 1.8, yaw: Math.PI * 0.9 },
      cast: [
        { id: "brannoc", look: "brannoc", x: 0, z: 0, yaw: 0 },
        { id: "bas", look: "bas", x: 1.3, z: 0.6, yaw: -1.9 },
        { id: "varka", look: "varka", x: 0.6, z: 8.5, yaw: 0.4, down: true },
      ] },
    { id: "hall", type: "explore", ...HL,
      rook: { x: 0, z: -8.6, yaw: 0 },
      objective: "The Hall of Lanterns, a week later. **Bas** is at the Iron Wardens' shelf.",
      required: ["bas"],
      cast: [
        { id: "bas", look: "bas", x: -4.2, z: 1.2, yaw: -Math.PI / 2, node: "Ep22_HallBas" },
        { id: "juno", look: "juno", x: 1.4, z: 4.4, yaw: 0.2, node: "Ep22_HallJuno" },
        { id: "dagrun", look: "dagrun", x: -2.4, z: 2.6, yaw: -1.2 },
        { id: "tamsin", look: "tamsin", x: -0.6, z: 3.2, yaw: -0.8 },
        { id: "lio", look: "lio", x: 2.6, z: 7.2, yaw: 0 },
        { id: "keeper", look: "keeper", x: 1.6, z: -7.4, yaw: -2.6, node: "W_HallKeeperIn" },
      ],
      pickups: [
        { id: "brannocLantern", x: -4.1, z: -1.2, marker: false, node: "W_Hall_Brannoc", label: "The Iron Wardens' shelf" },
        { id: "calLantern", x: -1.4, z: 8.3, marker: false, node: "W_Hall_CalLantern", label: "Cal's lantern" },
        { id: "myLantern", x: 2.1, z: 8.3, marker: false, node: "W_Hall_MyLantern", label: "Your lantern" },
      ],
      set: { EP22_DONE: 1 } },
    { id: "preview", type: "preview", next: "Episode 23 · Juno's Thread",
      lines: [
        "Next time on UNWRITTEN:",
        "Juno knows where Cal hid something.",
        "At Brannoc's funeral, the air itself tears open.",
      ] },
  ],
};
