// Knight Rank (GDD §17): Ember → Spark → Flame → Blaze → Sun. Rook's own rank among the Crown's knights (the squad's
// place on the Merit roll is a different thing: core/quests.js squadRank). A rank is earned only by a promotion exam at
// the Exam Grounds: an interview before the Proctor and a visiting captain, then a trial in the ring with something to
// show. Each exam opens once the story has got that far and Rook is near the level the story expects (power gating:
// data/skills.js bracketOf). The rank is the KNIGHT_RANK flag (0 = Ember), so it saves with everything.
//
// What a rank opens (§17: "mission tiers, story gates, page tiers, title in dialogue"):
//   • page tiers: the Grimoire Tree's second row needs Spark, its third needs Flame (data/skills.js tier);
//   • mission tiers: the squad board's contracts, one tier a rank (Phase 12 Step 3);
//   • title in dialogue: {rank} in any line, and the city's knights and guards use it.

export const KNIGHT_RANKS = Object.freeze([
  { id: "ember", name: "Ember", desc: "The colour every new knight is given at the exam. It means: not yet." },
  {
    id: "spark", name: "Spark", after: "$EP4_DONE", ep: 4, afterText: "your first mission (Episode 4)", level: 5,
    guest: "Ysolde", node: "R_Spark",
    trial: { label: "SPARK EXAM · THE PACK", wave: ["hound", "hound", "hound", "hound", "hound"], goal: "evade", n: 3,
      text: "Three perfect dodges or parries. Show me the thing you learned the day you got here." },
    reward: { marks: 60, flags: { MERIT: 10, REP_SQUAD: 3 } },
    tiers: "the Grimoire Tree's second row; the squad board's second tier",
  },
  {
    id: "flame", name: "Flame", after: "$EP12_DONE", ep: 12, afterText: "the drowned cistern (Episode 12)", level: 11,
    guest: "Sylvie", node: "R_Flame",
    trial: { label: "FLAME EXAM · THE WALL", wave: ["bulwark", "bulwark", "acolyte", "acolyte"], goal: "break", n: 2,
      text: "Break two guards. A wall that won't move is still a wall you can go through." },
    reward: { marks: 120, flags: { MERIT: 15, REP_SQUAD: 4 } },
    tiers: "the Grimoire Tree's third row; the squad board's third tier",
  },
  {
    id: "blaze", name: "Blaze", after: "$EP28_DONE", ep: 28, afterText: "the Tower steps (Episode 28)", level: 22,
    guest: "Corvina", node: "R_Blaze",
    trial: { label: "BLAZE EXAM · THE LINE", wave: ["lance", "lance", "rider", "rider"], goal: "clean", n: 3,
      text: "Win, and let no more than three blows land on you. A Blaze comes home in one piece." },
    reward: { marks: 220, flags: { MERIT: 20, REP_SQUAD: 5 } },
    tiers: "the squad board's fourth tier",
  },
  {
    id: "sun", name: "Sun", after: "$EP46_DONE", ep: 46, afterText: "the Gate (Episode 46)", level: 33,
    guest: "Nobody (Silent Quill)", node: "R_Sun",
    trial: { label: "SUN EXAM · THE LONG MINUTE", wave: ["bulwark", "bulwark", "clockwork", "clockwork", "beast"], goal: "fast", n: 90,
      text: "Five of the worst things we keep in the cellars. Ninety seconds." },
    reward: { marks: 400, flags: { MERIT: 30, REP_SQUAD: 6 } },
    tiers: "the squad board's last tier",
  },
]);

export const RANK_FLAG = "KNIGHT_RANK";
export const rankOf = (flags) => Math.max(0, Math.min(KNIGHT_RANKS.length - 1, Number(flags?.get?.(RANK_FLAG)) || 0));
export const rankName = (flags) => KNIGHT_RANKS[rankOf(flags)].name;

/** The rank the story expects by episode `n` (§17's Level/Rank brackets): the highest whose exam has opened before it. */
export const rankBracket = (n) => KNIGHT_RANKS.reduce((best, r, i) => (r.ep != null && r.ep < n ? i : best), 0);

/** What each trial goal counts, for the HUD and the Proctor. */
export const TRIAL_GOALS = Object.freeze({
  evade: (n) => `Perfect dodges or parries: {got}/${n}`,
  break: (n) => `Guards broken: {got}/${n}`,
  clean: (n) => `Blows taken: {got} (no more than ${n})`,
  fast: (n) => `Time: {got}s (inside ${n})`,
});

// ---- The Exam Grounds: the Proctor, and the four interviews (each: three questions, two sound answers to pass) ----
const interview = (id, rank, open, qs, pass) => `
title: ${id}
---
<<set $EXAM_SCORE to 0>>
${open}
${qs.map(([who, q, answers]) => `${who}: ${q}\n${answers.map(([a, ok, reply]) => `-> ${a}\n${ok ? "    <<set $EXAM_SCORE to $EXAM_SCORE + 1>>\n" : ""}    ${reply}`).join("\n")}`).join("\n")}
<<if $EXAM_SCORE >= 2>>
    Proctor: That'll do. ${pass}
    <<rank ring>>
<<else>>
    Proctor: Not today. Not a bad knight; just not a ${rank} yet. Think about why, and come back.
<<endif>>
===
`;

export const RANK_SCRIPT = `
title: W_Proctor
---
<<rank check>>
<<if $EXAM_READY > 0>>
    Proctor: The ring's yours. Step in when you're ready; I'll be counting.
    -> I'm ready.
        Proctor: Then stop talking to me and go and stand in it.
    -> Not today.
        <<rank cancel>>
        Proctor: The ring will keep. So will I, worse luck.
    <<stop>>
<<endif>>
<<if $RANK_NEXT == 0>>
    Proctor: Sun {name}. Top of the ladder. There's nothing left I can give you but advice, and you've stopped taking that.
    <<stop>>
<<endif>>
<<if $KNIGHT_RANK == 0>>
    Proctor: The one-pager. Back on my sand. I still have the sand you got up off, you know. Three times.
<<else>>
    Proctor: {rank} {name}. Back on my sand.
<<endif>>
<<if $RANK_WHY == 1>>
    <<if $RANK_NEXT == 1>>
        Proctor: Spark's for knights who've been on a mission. A real one, with mud. Come back when you've had one.
    <<elseif $RANK_NEXT == 2>>
        Proctor: Flame? You've barely got your boots wet. Go and do something the city will talk about.
    <<elseif $RANK_NEXT == 3>>
        Proctor: Blaze is for knights who've stood somewhere hard and stayed. You'll know when you have. So will I.
    <<else>>
        Proctor: Sun. Not yet. Not while the city still has a worse day coming. Come back after it.
    <<endif>>
    <<stop>>
<<endif>>
<<if $RANK_WHY == 2>>
    Proctor: You're close. Not close enough. I'd want you nearer level {$RANK_NEED_LV} before I put you in front of a captain.
    <<stop>>
<<endif>>
Proctor: The exam's two parts. You sit in front of me and a captain and answer honestly; then you go in the ring and show us the answers were true.
-> Sit the exam.
    <<if $RANK_NEXT == 1>>
        <<jump R_Spark>>
    <<elseif $RANK_NEXT == 2>>
        <<jump R_Flame>>
    <<elseif $RANK_NEXT == 3>>
        <<jump R_Blaze>>
    <<else>>
        <<jump R_Sun>>
    <<endif>>
-> Not yet.
    Proctor: Wise. Or scared. From here they look the same.
===
` + interview("R_Spark", "Spark",
  "Ysolde: Ysolde Kestrel, Tempest Riders. I sit these because I like watching people sweat. Go on, Proctor.", [
    ["Proctor", "A village sends word: wolves on the road. Your captain's asleep. What do you do?", [
      ["Go. Leave Dagrun a note.", 1, "Ysolde: Arrive first. I like this one already."],
      ["Wake him up.", 1, "Proctor: Waking Dagrun Holt is a mission in itself. Fine."],
      ["Wait for orders.", 0, "Proctor: The wolves won't."]]],
    ["Ysolde", "Why do you want the ribbon?", [
      ["So people stop calling me the one-pager.", 0, "Ysolde: They won't. They'll call you the one-pager with a ribbon."],
      ["So the Lanterns climb the roll.", 1, "Ysolde: For your squad, not yourself. Hm. Dagrun's rubbing off."],
      ["I don't. Dagrun told me to come.", 1, "Proctor: Honest. Annoying, but honest."]]],
    ["Proctor", "A Spark sees a senior knight break the law. What does a Spark do?", [
      ["Says so, to their face.", 1, "Proctor: Brave. Write your will first."],
      ["Reports it, quietly.", 1, "Proctor: Sensible. The quiet ones live longest."],
      ["Nothing. Not my place.", 0, "Proctor: Then whose place is it?"]]],
  ], "Now the ring. Three perfect dodges or parries: the thing you learned the day you got here.")
+ interview("R_Flame", "Flame",
  "Sylvie: Sylvie Marrow, Verdant Oath. Don't mind the leaves. I came straight from the garden.", [
    ["Sylvie", "You've beaten a Choir acolyte. It's on the ground, bleeding, still dangerous. What now?", [
      ["Bind its hands, then bind its wounds.", 1, "Sylvie: In that order. Good."],
      ["Finish it.", 0, "Sylvie: Then you're quicker than I am. That isn't praise."],
      ["Leave it for the Watch.", 0, "Sylvie: And if it bleeds out before they come?"]]],
    ["Proctor", "Your squad wants to go one way. Your orders say the other.", [
      ["Follow the orders, and say why I think they're wrong after.", 1, "Proctor: Hm. Boring. Correct."],
      ["Follow my squad.", 0, "Proctor: Loyal. Loyal gets people hanged, in my experience."],
      ["Find a third way.", 1, "Proctor: There usually is one. Usually."]]],
    ["Sylvie", "What's the worst thing you've seen?", [
      ["(Tell her about the Fens.)", 1, "Sylvie: Thank you. People lie to me about that question more than any other."],
      ["I'd rather not say.", 1, "Sylvie: Fair. You'll have to, one day. To someone."],
      ["Nothing scares me.", 0, "Captain Marrow writes something down. It isn't a compliment."]]],
  ], "Now the ring. Break two guards. A wall that won't move is still a wall you can go through.")
+ interview("R_Blaze", "Blaze",
  "Corvina: Corvina Ashgrave. I asked to sit this one. I want to see what Dagrun's been feeding you.", [
    ["Corvina", "The Lanterns are last on the roll. Why should a Blaze come from the last squad?", [
      ["Because last is where you see everything.", 1, "Corvina: ...Hm."],
      ["Because we're better than the Lances.", 0, "Corvina: Brave. Wrong, but brave."],
      ["It shouldn't. Judge me, not them.", 1, "Corvina: I intend to."]]],
    ["Proctor", "A Blaze leads. One of yours freezes in a fight. What do you do?", [
      ["Stand where they can see me, and tell them what to do next.", 1, "Proctor: That's the whole job, more or less."],
      ["Send them home.", 0, "Proctor: Through a fight? Alone?"],
      ["Do their job as well as mine.", 0, "Proctor: And then you're both dead, and tired."]]],
    ["Corvina", "Nobility is duty. Do you believe that?", [
      ["Duty is duty. It doesn't need nobility.", 1, "Corvina: That's what Brannoc used to say. ...Go on."],
      ["I'm not noble.", 1, "Corvina: No. You're not. And yet here you are."],
      ["Yes, Captain.", 0, "Corvina: Don't parrot me. I get enough of that at home."]]],
  ], "Now the ring. Win, and don't let more than three blows land. A Blaze comes home in one piece.")
+ interview("R_Sun", "Sun",
  "Proctor: Nobody sits this one. Literally: the Silent Quill's captain. Don't take it personally if they don't speak.\nA figure in grey at the end of the table nods once.", [
    ["Proctor", "What is a Sun for?", [
      ["To be seen, so people know where the light is.", 1, "Proctor: Pretty. True, though."],
      ["To be the strongest.", 0, "Proctor: There's always someone stronger. Then what are you for?"],
      ["To stand where nobody else will.", 1, "Nobody taps the table, once."]]],
    ["Nobody", "(A folded note slides across the table. It says: WHAT WOULD YOU NOT DO, IF ORDERED?)", [
      ["Hurt people who can't fight back.", 1, "Nobody takes the note back and folds it into a sleeve."],
      ["Nothing. Orders are orders.", 0, "Nobody looks at you for a long time. Then at the Proctor."],
      ["Leave my squad behind.", 1, "Nobody takes the note back and folds it into a sleeve."]]],
    ["Proctor", "Last one. Thirty years I've asked it. Why do you keep getting up?", [
      ["Because the people behind me can't.", 1, "Proctor: ...Yes."],
      ["Because the story isn't finished.", 1, "Proctor: Isn't it? Hm."],
      ["I don't know.", 1, "Proctor: Best answer I've had all year."]]],
  ], "Now the ring. Five of the worst things we keep in the cellars, and ninety seconds.");
