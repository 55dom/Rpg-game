// Side quests (GDD §18.1). Stages complete when their flag condition holds; flags are set by
// dialogue (<<set>>, <<pay>>), pickups in zones, and fights. Rewards add Marks and reputation.

export const QUESTS = {
  fried: {
    title: "Something Fried for the Captain", giver: "Dagrun", region: "The Lighthouse",
    stages: [
      { text: "Buy something fried from the cook by Aurelin's fountain.", done: "$FRIED_FISH" },
      { text: "Bring it back to Dagrun at the Lighthouse.", done: "$FRIED_DELIVERED" },
    ],
    summary: "Dagrun ate it in two bites. Then he asked for another.",
    reward: { marks: 25, flags: { MERIT: 15, REP_SQUAD: 3 }, bond: { dagrun: 12 } },
  },
  rumors: {
    title: "The Village Nobody Remembers", giver: "Townsperson", region: "Aurelin",
    stages: [
      { text: "Ask around Aurelin about the vanished village: the gate guard, the town crier, the Lowmarket vendor. ({$ASKED_FENS}/3)", done: "$ASKED_FENS >= 3" },
      { text: "Tell the townsperson by the fountain what you learned.", done: "$RUMORS_TOLD" },
    ],
    summary: "Nobody remembers the village's name. Everyone remembers the singing.",
    reward: { marks: 30, flags: { RENOWN_AURELIN: 10, MERIT: 10 } },
  },
  toy: {
    title: "A Lantern for the Kid", giver: "Kid", region: "Aurelin",
    stages: [
      { text: "Find the kid's toy lantern. They dropped it near the south gate.", done: "$TOY_FOUND" },
      { text: "Bring the toy lantern back to the kid in the plaza.", done: "$TOY_RETURNED" },
    ],
    summary: "The kid says your lantern is the second-best lantern. After theirs.",
    reward: { marks: 15, flags: { RENOWN_AURELIN: 6, MERIT: 5 } },
  },
  bandits: {
    title: "Bandits on the Mill Road", giver: "Farmer Odo", region: "Thornwick",
    stages: [
      { text: "Drive off the bandits on the mill road, south-east of the green.", done: "$BANDITS_CLEARED" },
      { text: "Tell Farmer Odo the road is safe.", done: "$BANDITS_TOLD" },
    ],
    summary: "Odo says Thornwick always knew you'd amount to something. Odo is lying, but kindly.",
    reward: { marks: 30, flags: { RENOWN_THORNWICK: 10, MERIT: 10 } },
  },
  below: {
    title: "Something Below the Lowmarket", giver: "Fish Cook", region: "Aurelin",
    stages: [
      { text: "Go down the grate in the Lowmarket and find what's stealing the cook's fish.", done: "$VISITED_UNDERCROFT" },
      { text: "Clear the Undercroft down to the Gear Hall.", done: "$UNDERCROFT_CLEARED" },
      { text: "Tell the cook by the fountain what you found.", done: "$BELOW_TOLD" },
    ],
    summary: "Rats took the fish. Something made of brass was guarding the rats. Nobody knows who built it.",
    reward: { marks: 50, flags: { RENOWN_AURELIN: 8, MERIT: 15 } },
  },
  cake: {
    title: "The Day the Café Lost Its Cake", giver: "Madame Odette", region: "Aurelin",
    stages: [
      { text: "Ask around the Gilded Spoon about the missing lemon cake: staff, customers, the cake case. ({$CAKE_CLUES}/4)", done: "$CAKE_CLUES >= 4" },
      { text: "Everything points to table three, by the window. Go and see.", done: "$CAKE_FOUND" },
    ],
    summary: "The cake went to the wrong table. Old Fenwick ate two tiers out of politeness. The Countess got a 'brave, minimalist cake'.",
    reward: { marks: 40, xp: 120, flags: { RENOWN_AURELIN: 6, MERIT: 5 }, bond: { juno: 12 } },
  },
  // Luke (data/story/law.js): the eel seller whose sister you pulled out of the Fens, and who joined the Watch.
  luke: {
    title: "Owing a Life", giver: "Elsie", region: "The Greywater Fens",
    stages: [
      { text: "Tell Elsie's brother she's safe. Luke sells eels in Aurelin's Lowmarket.", done: "$LUKE_MET" },
      { text: "Luke said he'd sleep on it. Come back to Aurelin another day.", done: "$LUKE_GUARD" },
      { text: "Luke has joined the City Watch. Find him at the south gate.", done: "$LUKE_TALKED_GUARD" },
      { text: "Somebody's shaking down the kids in the Lowmarket. Luke is already on his way.", done: "$LUKE_SOFT" },
      { text: "Talk to Luke at the south gate.", done: "$LUKE_SOFT_TALK" },
    ],
    summary: "Luke still says \"whatever\" to everything. He also walked the kid home, and paid for her eel.",
    reward: { marks: 60, xp: 200, flags: { RENOWN_AURELIN: 6, REP_SQUAD: 3, MERIT: 10 } },
  },
  lukehome: {
    title: "A House in the Fens", giver: "Luke", region: "The Greywater Fens",
    stages: [
      { text: "Make the Fens village safe: the Deacon east of the empty village, and the bog beast in the west reeds.", done: "$ILSE_DEFEATED and $BOG_BEAST_DOWN" },
      { text: "Luke and Elsie are home. Visit their house in the Fens village.", done: "$LUKE_HOME_VISITED" },
    ],
    summary: "The door sticks. Luke says it's a feature. Elsie has drawn you a cape.",
    reward: { marks: 40, xp: 150, flags: { RENOWN_FENS: 10, MERIT: 5 } },
  },
  trail: {
    title: "The Pale Choir's Trail", giver: "The hymn on the well", region: "The Greywater Fens",
    stages: [
      { text: "The Deacon who nailed up the hymn is preaching east of the empty village. Face her.", done: "$ILSE_DEFEATED" },
      { text: "Something old is waking in the Tower of Choosing (world map). Go and see.", done: "$GALEN_DEFEATED" },
      { text: "Something huge croaks in the flooded cistern under the Undercroft. Go down, and bring the squad.", done: "$GULLMAW_DEFEATED" },
    ],
    summary: "A deacon, a dead knight and a winged thing from the cistern, all working for the same choir. Lio has started a wall of notes.",
    reward: { marks: 150, xp: 400, flags: { MERIT: 30, REP_SQUAD: 6 }, bond: { bas: 8, juno: 8 } },
  },
};
