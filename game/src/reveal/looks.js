// The reveal's looks (GDD §15.8; this folder is the sanctioned exception to §15.11). Registered into runtime/rig.js
// LOOKS from the looks they grow out of, so nothing here is drawn twice.
//
//   maskCracked   Ep 48, after the Underline: the mask cracked down the middle (not broken), and blood from under it.
//   unmasked      the face in the smoke: Calder Wynn, older, a new scar across the left brow, a faint ring of starlight in
//                 his left eye that Cal never had, in the knight's black, the glaive, and the frayed red cord at his wrist.
//   ashSoldier    Backlash (Ep 49): Ash Line Eleven, one soldier among thousands; only the camera says which one is "you".

export function revealLooks(LOOKS) {
  const knight = LOOKS.masked, cal = LOOKS.cal;
  return {
    maskCracked: { ...knight, maskCrack: "#e8e6f0", maskBlood: "#7a0c0c" },
    unmasked: { ...knight, head: "face", hair: "loose", hairColor: cal.hairColor, skin: cal.skin, jaw: cal.jaw, eyeColor: cal.eyeColor,
      scar: "#b47a6a", eyeRing: "#e8dca0", wristCord: "#5e1715", listenTilt: cal.listenTilt, riftwalk: true, trail: "#9cb8ff" },
    ashSoldier: { ...LOOKS.lineSoldier },
  };
}
