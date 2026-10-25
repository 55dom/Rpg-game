// Episode 4, "The Village That Wasn't There" (GDD §14 Arc 1, Ep 4): the Phase 2 combat run.
// Six Greywater Fens encounters, then Hask the Bogwarden. Squad lines are placeholders for the
// Phase 3 dialogue system; they set the scene without spoiling anything.

export const EPISODE_4 = Object.freeze({
  id: "ep4",
  title: "The Village That Wasn't There",
  subtitle: "EPISODE 4 · THE GREYWATER FENS",
  encounters: [
    { title: "The Road into the Fens", wave: ["acolyte", "acolyte", "acolyte"], lines: [
      ["Juno", "Choir robes, this far out? Stay sharp, one-page."],
      ["Bas", "If it gets heavy, Rook, get behind me."]] },
    { title: "Howls in the Reeds", wave: ["hound", "hound", "hound", "acolyte"], lines: [
      ["Bas", "Fen hounds. They never hunt alone."],
      ["Juno", "Then we cut the pack apart."]] },
    { title: "The Choir Sings", wave: ["acolyte", "acolyte", "cantor", "bulwark"], lines: [
      ["Juno", "Hear that hymn? Silence the singer first."],
      ["Bas", "And don't hit the shield head-on."]] },
    { title: "Shield Wall", wave: ["bulwark", "bulwark", "cantor", "hound", "hound"], lines: [
      ["Bas", "Two shields. Go around them, or let me lift them for you."],
      ["Juno", "Or I tie their arms. Your call, Rook."]] },
    { title: "Something in the Water", wave: ["beast", "cantor", "acolyte"], lines: [
      ["Juno", "That is not a hound."],
      ["Bas", "Break its stance first. It won't fall otherwise."]] },
    { title: "The Drowned Chapel", wave: ["beast", "bulwark", "hound", "hound", "cantor"], lines: [
      ["Bas", "The village should be right here. There's nothing. Not even ruins."],
      ["Juno", "A whole village doesn't just walk off."]] },
    { title: "Hask the Bogwarden", wave: ["hask"], boss: true, lines: [
      ["Juno", "The bog is moving."],
      ["Bas", "Wind, Rook! Tear it out of the mud!"]] },
  ],
  victoryLines: [
    ["Bas", "…So where did a whole village go?"],
    ["Juno", "Somewhere the Choir doesn't want us looking."]],
});

export const RUN_TUNING = Object.freeze({
  introFrames: 150,   // title and lines before each encounter spawns
  restFrames: 210,    // breather after a clear
  retryFrames: 160,   // after Rook falls, retry the same encounter
  restHeal: 0.35,     // fraction of missing HP restored to the squad after each clear
  victoryFrames: 200,
});

/** Letter grade for the results screen. */
export function runRank(s) {
  let score = 100;
  score -= s.retries * 18;
  score -= Math.min(30, s.damageTaken / 40);
  score -= Math.max(0, (s.frames / 60 - 600) / 20); // past 10 minutes costs points
  score += Math.min(15, s.maxCombo / 3) + Math.min(10, s.reactions);
  return score >= 95 ? "S" : score >= 80 ? "A" : score >= 60 ? "B" : "C";
}
