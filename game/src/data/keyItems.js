// Key items (the Bag's KEY ITEMS list): story objects you carry. Not gear and not for sale. Each has
// a flag that says you have it, and text that can change with where you are or what has happened.

export const KEY_ITEMS = Object.freeze({
  brassKey: {
    name: "Brass key",
    has: "HAS_BRASS_KEY",
    text: [
      // Near the Hollowmarch every bit of metal runs warm; this is one of several items whose text changes there.
      { zone: "hollowmarch", text: "Warm in your hand. Everything metal is warm out here: buckles, coins, the blade at your hip." },
      { text: "A small brass key on a loop of string. Cal swore it opens the snack cupboard. The snack cupboard doesn't have a lock." },
    ],
  },
  calNotebook: {
    name: "Cal's notebook",
    has: "HAS_CAL_NOTEBOOK",
    text: [{ text: "Oilcloth, and Juno's red cord tied round it in a Quill knot. Lists, a bet he won, a drawing of Dagrun with a moustache, a door frame with its hinges on the far side. The last page says \"Tell Juno it held.\"" }],
  },
  wardenSummons: {
    name: "Brannoc's summons",
    has: "HAS_SUMMONS",
    text: [{ text: "Iron Wardens' seal, grey wax. \"The Ashfall Dominion is over the border at Ironhold. The wall is holding. Bring the Lanterns. — B.\"" }],
  },
});

/** The key items you have, with the text for where you are now. */
export function keyItemsHeld(flags, zoneId = null) {
  return Object.entries(KEY_ITEMS).filter(([, it]) => flags.get(it.has)).map(([id, it]) => ({
    id, name: it.name, text: (it.text.find((t) => !t.zone || t.zone === zoneId) ?? it.text[it.text.length - 1]).text,
  }));
}
