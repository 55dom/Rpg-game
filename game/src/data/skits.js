// Camp skits (GDD §10 "Party banter"): short scenes between two of the squad, text with a voice placeholder (a soft
// tick per line), that play in a corner while you walk. Each triggers once, from where you are (`zone`), the story's
// flags (`when`) and who's about (the flags say who's joined, who's away, who's gone). Seen ones are SKIT_<ID> flags.
// Cheap to write, and they carry the characters between the episodes.
//
// (Deliberately nothing here about doors, lanterns going out, or anyone who isn't in the room: the mystery's clues are
// counted, §15.5, and banter doesn't get to add to them.)

export const SKITS = Object.freeze([
  { id: "LAST_RANK", title: "Last Isn't a Rank", zone: "lighthouse", when: "$HASK_DEFEATED and not $EP22_DONE", cast: ["juno", "bas"], lines: [
    ["Juno", "Dagrun's been asleep on that bench since breakfast."], ["Bas", "He's thinking."], ["Juno", "He's snoring."],
    ["Bas", "He thinks loudly."], ["Juno", "The Merit roll's read out tomorrow and our captain is drooling on a fish crate."],
    ["Bas", "We're last, Juno. There's no hurry to hear it."] ] },
  { id: "HOME", title: "Home, Briefly", zone: "thornwick", when: "$HASK_DEFEATED", cast: ["juno", "bas"], lines: [
    ["Juno", "So this is where {name} grew up. It's very... brown."], ["Bas", "It's a farming village. Brown is the point."],
    ["Juno", "Every single person waved at us."], ["Bas", "That's what happens when you're from somewhere."],
    ["Juno", "...Huh."] ] },
  { id: "BOG", title: "The Bog Remembers", zone: "fens", when: "$HASK_DEFEATED", cast: ["bas", "lio"], lines: [
    ["Bas", "Three villages out here nobody can name. You'd think somebody would notice a whole village going."],
    ["Lio", "You'd think."], ["Bas", "You've got your archive face on."], ["Lio", "I don't have an archive face."],
    ["Bas", "You've had it on since the hymn on the well."], ["Lio", "...Let's just get {name} home before dark."] ] },
  { id: "LEFTOVERS", title: "Festival Leftovers", zone: "aurelin", when: "$EP14_DONE", cast: ["tamsin", "juno"], lines: [
    ["Tamsin", "There's still bunting on the fountain! From the festival! It's been weeks!"], ["Juno", "It's been tied on with fishing line. Badly."],
    ["Tamsin", "You can tell that from here?"], ["Juno", "I can tell that from the Lighthouse."],
    ["Tamsin", "Will you fix it?"], ["Juno", "...Obviously I'm going to fix it."] ] },
  { id: "BARNABY", title: "Barnaby's Rule", zone: "cafe", when: "$EP14_DONE", cast: ["juno", "tamsin"], lines: [
    ["Tamsin", "Why is there a sign that says NO SINGING AT THE COUNTER?"], ["Juno", "Guess."],
    ["Tamsin", "That's not fair, it was one time."], ["Juno", "It was every time."],
    ["Tamsin", "The acoustics in here are incredible, Juno."] ] },
  { id: "RATS", title: "Rats Again", zone: "undercroft", when: "$GULLMAW_DEFEATED", cast: ["tamsin", "bas"], lines: [
    ["Tamsin", "If a rat touches my boot I'm going to sing at it."], ["Bas", "That'll scare it."],
    ["Tamsin", "...Was that a joke? Bas, was that a joke about my singing?"], ["Bas", "No."],
    ["Tamsin", "It was a joke! {name}, Bas made a joke!"] ] },
  { id: "BROOM", title: "Brother Moss's Broom", zone: "tower", when: "$GALEN_DEFEATED", cast: ["lio", "bas"], lines: [
    ["Bas", "Every time we come up here he's sweeping the same step."], ["Lio", "It's a very clean step."],
    ["Bas", "There's never any dust on it. I looked."], ["Lio", "Maybe that's why it's clean."],
    ["Bas", "That's not how sweeping works, Lio."] ] },
  { id: "IRON", title: "The Iron Front", zone: "ironhold", when: "$HAS_SUMMONS and not $EP22_DONE", cast: ["brannoc", "bas"], lines: [
    ["Brannoc", "You've grown, Okafor. Wider. Is that the Lanterns' cooking?"], ["Bas", "Dagrun's stew, sir."],
    ["Brannoc", "Hah! Then you've earned every pound of it."], ["Bas", "Sir. The wall doesn't move."],
    ["Brannoc", "No, lad. But it's good to see it grow."] ] },
  { id: "WALL", title: "The Wall Doesn't Move", zone: "lighthouse", when: "$EP22_DONE", cast: ["bas", "juno"], lines: [
    ["Juno", "You've been at that wall all morning."], ["Bas", "There's a crack in it."],
    ["Juno", "There's been a crack in it since before I joined."], ["Bas", "I know."],
    ["Juno", "...Come and eat something. Brannoc would have made you eat something."], ["Bas", "He would. He'd have made me eat two."] ] },
  { id: "TIRED_BOOK", title: "Your Book Looks Tired", zone: "lighthouse", when: "$CORRUPTION >= 25", cast: ["juno", "lio"], lines: [
    ["Juno", "Is it me, or has {name}'s grimoire gone a funny colour at the edges?"], ["Lio", "It's not you."],
    ["Juno", "You say that like you've seen it before."], ["Lio", "I've seen pages go like that. It doesn't stop by itself."],
    ["Juno", "Then we'll make it stop. Thornwick's got a shrine, hasn't it?"] ] },
]);
