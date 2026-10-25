// The masked knight (GDD §15.3 Disguise Bible, §15.7 Encounter I onward). The Crown names him the Sable
// Knight on its bounty posters in Episode 26; until then nobody has a name for him, and subtitles call
// him "???". His look and body live here, on their own, sharing nothing with anyone (§15.10–15.11).
//
// Silhouette: a smooth black full mask with narrow vertical slits and no face behind it, ever; a heavy
// cloak to the ankles with a collar that rises past the jaw; one heavy pauldron, on the left shoulder only;
// a long black glaive with a cold edge. Padding makes him broader than he is.

export const MASKED_POSES = Object.freeze({
  rest: [0.45, 0.15, 0], // the glaive held low and still
});

export const MASKED_LOOK = Object.freeze({
  poses: MASKED_POSES, scale: 1.06, skirt: 0.9, coat: "#17171d", trim: "#2c2c36", hairColor: "#0e0e12", skin: "#0e0e12",
  head: "fullmask", maskColor: "#1e1e26", slitColor: "#000000",
  weapon: "glaive", haftColor: "#121216", bladeColor: "#1a1a22", edgeColor: "#9cb8ff",
  shoulders: 1.35, trail: "#9cb8ff",
});

export const MASKED_SHEET = Object.freeze({
  build: "athletic", gait: "soldier", idle: "still",
  outfit: { top: "#17171d", hem: "knee", sleeves: "long", legs: "#121218", boots: "tall", bootColor: "#0e0e12", belt: "#2c2c36",
    gloves: "#0e0e12", bracers: "#2c2c36", breastplate: "#20202a", pauldron: "#2a2a34", cloak: "#111116", cloakLength: "ankle", cloakCollar: true, grime: 0 },
});
