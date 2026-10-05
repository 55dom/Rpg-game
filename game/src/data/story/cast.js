// Who can speak in dialogue: display name, name-plate color, and the stage actor they belong to.
// "Rook" is the player: the display name is whatever the player chose.

export const CAST = Object.freeze({
  Rook: { name: null, color: "#ffd98a", actor: "player" },
  Severin: { name: "Severin", color: "#f1e2a8", actor: "severin" },
  Moss: { name: "Brother Moss", color: "#d9c79a", actor: "moss" },
  Herald: { name: "Tower Herald", color: "#b9a6ff", actor: "herald" },
  Acolyte: { name: "Choir Acolyte", color: "#ff8a7a", actor: "acolyte" },
  Proctor: { name: "Exam Proctor", color: "#b9a6ff", actor: "proctor" },
  Dagrun: { name: "Captain Dagrun", color: "#e6b54e", actor: "dagrun" },
  Cal: { name: "Cal", color: "#f3e3b0", actor: "cal" },
  Corvina: { name: "Captain Corvina", color: "#e9f2ff", actor: "corvina" },
  Brannoc: { name: "Captain Brannoc", color: "#c9d2dc", actor: "brannoc" },
  Ysolde: { name: "Captain Ysolde", color: "#9fe6c8", actor: "ysolde" },
  Juno: { name: "Juno", color: "#ff8fa0", actor: "juno" },
  Bas: { name: "Bas", color: "#e8b46a", actor: "bas" },
  Lio: { name: "Lio", color: "#a9b8d8", actor: "lio" },
  Tamsin: { name: "Tamsin", color: "#f0c26a", actor: "tamsin" },
  Crowd: { name: "Candidates", color: "#aab4cc", actor: null },
});

export const speakerName = (id, playerName) => (id === "Rook" ? playerName : CAST[id]?.name ?? id);
