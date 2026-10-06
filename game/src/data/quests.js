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
};
