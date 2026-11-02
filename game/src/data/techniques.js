// Technique Points and the mentors (GDD §17: "Sword techniques (new combo nodes, cancels, air options); training at HQ
// with mentors (Dagrun, Bas, Brannoc)"). Points come from training: one drill a day with each mentor, and one with
// every Knight Rank (data/ranks.js). They're spent on techniques: two a mentor, each a change to Rook's combo graph
// (data/rook.js buildRookGraph) or to what Rook can do in the air (sim/world.js). Points: the TECH_POINTS flag;
// techniques learned: TECH_<ID>; a drill done today: DRILL_<MENTOR>_DAY.
//
// Brannoc trains you at Ironhold while he's there to do it. After the wall (Ep 22), Bas teaches what Brannoc taught him.

export const TP_FLAG = "TECH_POINTS";
export const techFlag = (id) => `TECH_${id.toUpperCase()}`;

export const TECHNIQUES = Object.freeze({
  // Bas: the ground. New combo nodes.
  risingEdge: { name: "Rising Edge", mentor: "bas", cost: 1, kind: "combo node",
    desc: "The third swing can launch: Slash, Slash, Slash, then Heavy throws them up for the air string." },
  stonebreaker: { name: "Stonebreaker", mentor: "bas", cost: 2, kind: "combo node",
    desc: "When the fourth swing lands, Heavy brings the blade down two-handed: a blow that breaks guards." },
  // Dagrun: the air. Gravity is his magic, and falling is just flying you haven't finished.
  secondWind: { name: "Second Wind", mentor: "dagrun", cost: 1, kind: "air option",
    desc: "Two air dashes before you land." },
  hangTime: { name: "Hang Time", mentor: "dagrun", cost: 2, kind: "air option",
    desc: "Two air jumps before you land." },
  // Brannoc: the wall. Cancels.
  ironAnswer: { name: "Iron Answer", mentor: "brannoc", cost: 1, kind: "cancel",
    desc: "Block out of a swing's recovery: the guard comes up between blows (the first three swings and the Dash Strike)." },
  unbroken: { name: "Unbroken", mentor: "brannoc", cost: 2, kind: "cancel",
    desc: "When the fourth swing lands, Slash starts the string again instead of waiting it out." },
});

/**
 * Who teaches, where, and the drill that earns a point (once a day each). goal: what the drill counts on the training
 * posts (blade hits; hits from the air) or "spar" (a bout with the mentor). n, limit: how many, in how many seconds.
 * teaches: the mentors whose techniques they'll show you (Bas takes Brannoc's on once Brannoc is gone).
 */
export const MENTORS = Object.freeze({
  bas: { name: "Bas", where: "the Lighthouse", drill: { goal: "hits", n: 15, limit: 20, label: "BAS'S DRILL · THE POSTS",
    text: "Fifteen clean hits on the posts in twenty seconds. Don't think. Hit." }, teaches: ["bas"], alsoAfter: { flag: "BRANNOC_DEAD", teaches: "brannoc" } },
  dagrun: { name: "Dagrun", where: "the Lighthouse", drill: { goal: "air", n: 6, limit: 30, label: "DAGRUN'S DRILL · UP THERE",
    text: "Six hits on the posts from the air, inside thirty seconds. Jump. Then don't come down yet." }, teaches: ["dagrun"] },
  brannoc: { name: "Brannoc", where: "Ironhold", when: "not $BRANNOC_DEAD", drill: { goal: "spar", label: "SPARRING · BRANNOC",
    text: "A bout with the captain of the Iron Wardens. Stay standing." }, teaches: ["brannoc"] },
});

/** Where there are no training dummies already (the Lighthouse ring has four straw ones), a drill puts up two posts here,
 *  relative to Rook. */
export const DRILL_POSTS = Object.freeze([[-2, 3], [2, 3]]);

/** Every Knight Rank promotion gives this many points too. */
export const TP_PER_RANK = 1;

/** Spend the points and learn it: false if it's unknown, known already, or too dear. */
export function learnTechnique(flags, id) {
  const t = TECHNIQUES[id];
  if (!t || flags.get(techFlag(id)) || (Number(flags.get(TP_FLAG)) || 0) < t.cost) return false;
  flags.add(TP_FLAG, -t.cost); flags.set(techFlag(id), 1);
  return true;
}
/** The techniques learned, as the world wants them. */
export const learnedTechniques = (flags) => Object.keys(TECHNIQUES).filter((id) => flags.get(techFlag(id)));

// ---- The training menus (after the bond chat for Bas and Dagrun; after Brannoc's own lines at Ironhold) ----
const teachList = (mentor, ids, condition = "") => ids.map((id) => {
  const t = TECHNIQUES[id], f = techFlag(id);
  return `-> Learn ${t.name} (${t.cost} point${t.cost > 1 ? "s" : ""}): ${t.desc} <<if $${TP_FLAG} >= ${t.cost} and not $${f}${condition}>>
    <<technique learn ${id}>>
    ${mentor}: ${LEARN_LINES[id]}`;
}).join("\n");

const LEARN_LINES = Object.freeze({
  risingEdge: "Third swing, you're already turning. So keep turning, and bring it up. ...There. That's the whole secret. Nobody believes me.",
  stonebreaker: "Two hands. Lift with the ground, not your arms. Then let it fall. You don't swing a stone, you drop it.",
  secondWind: "Mm? Oh. You push off nothing. Twice. Don't look down, it upsets the nothing.",
  hangTime: "Jump. Now jump again. No, from up there. Gravity's a suggestion, kid. I should know, I'm its biggest fan.",
  ironAnswer: "The wall doesn't wait for you to finish your sentence. Swing, and if it's wrong, the shield's already there. Again.",
  unbroken: "You land the heavy one and then you stand there admiring it. Don't. Start again. The wall doesn't stop for applause.",
});

export const TECHNIQUE_SCRIPT = `
title: T_Menu_bas
---
<<technique check bas>>
Bas: Training? Good. Points: {$${TP_FLAG}}.
-> Drill on the posts (a point a day). <<if $DRILL_READY>>
    Bas: Fifteen clean hits in twenty seconds. Don't think. Hit.
    <<drill bas>>
${teachList("Bas", ["risingEdge", "stonebreaker"])}
${teachList("Bas", ["ironAnswer", "unbroken"], " and $BRANNOC_DEAD")}
-> Not now.
    Bas: The posts'll be here.
===

title: T_Menu_dagrun
---
<<technique check dagrun>>
Dagrun: Mm. You want to fall better. Everyone should. Points: {$${TP_FLAG}}.
-> Drill from the air (a point a day). <<if $DRILL_READY>>
    Dagrun: Six hits off the ground before you touch it. Go on. I'll watch. With my eyes closed.
    <<drill dagrun>>
${teachList("Dagrun", ["secondWind", "hangTime"])}
-> Not now.
    Dagrun: Good. I was comfortable.
===

title: T_Brannoc
---
<<technique check brannoc>>
<<if $CAN_TRAIN>>
    -> Ask him to train you.
        <<jump T_Menu_brannoc>>
    -> Leave him to it.
<<endif>>
===

title: T_Menu_brannoc
---
<<technique check brannoc>>
Brannoc: You want the wall taught to you. Fine. Points: {$${TP_FLAG}}.
-> Spar with him (a point a day). <<if $DRILL_READY>>
    Brannoc: On the gate field. Guard up. I won't go easy, and I won't go hard. Somewhere in the middle, where you learn.
    <<drill brannoc>>
${teachList("Brannoc", ["ironAnswer", "unbroken"])}
-> Not now.
    Brannoc: Then go and stand somewhere. Standing's half of it.
===
`;
