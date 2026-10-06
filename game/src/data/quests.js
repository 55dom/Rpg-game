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
    reward: { marks: 25, flags: { MERIT: 15, REP_SQUAD: 3 } },
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
    reward: { marks: 40, xp: 120, flags: { RENOWN_AURELIN: 6, MERIT: 5 } },
  },
};
