// Who can speak in dialogue: display name, name-plate color, and the stage actor they belong to.
// "Rook" is the player: the display name is whatever the player chose.
// `label(flags)`: a name that follows the story (the masked knight is "???" until he's named).
// `voice: "mask"`: his lines are heard through the mask (runtime/audio.js maskVoice).

import { maskedLabel } from "../masked.js";

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
  Mirren: { name: "Mirren", color: "#ffb38a", actor: "mirren" },
  Keeper: { name: "Hall Keeper", color: "#ffd98a", actor: "keeper" },
  Warden: { name: "Iron Warden", color: "#c9d2dc", actor: "warden" },
  Scout: { name: "Warden Scout", color: "#c9d2dc", actor: "scout" },
  Varka: { name: "General Varka Ironsong", color: "#9ad8ff", actor: "varka" },
  Wraithe: { name: "Wraithe", color: "#e8e4f4", actor: "wraithe" }, // never speaks: the Choir's silent school
  Masked: { name: "Masked Knight", color: "#9cb8ff", actor: "masked", label: maskedLabel, voice: "mask" },
  Hale: { name: "Quartermaster Hale", color: "#c9d2dc", actor: "hale" },
  Elodie: { name: "Elodie", color: "#fff1b8", actor: "elodie" },
  Aldric: { name: "High Chancellor Aldric", color: "#9ab0e8", actor: "aldric" },
  Hesper: { name: "Hesper Voss", color: "#c9a4ff", actor: "hesper" },
  Archivist: { name: "Crown Archivist", color: "#d8dce8", actor: "archivist" },
  Vendor: { name: "Lowmarket Vendor", color: "#ffb38a", actor: "vendor" },
  Guard: { name: "Gate Guard", color: "#c9d2dc", actor: "guard" },
  Guard2: { name: "Hall Guard", color: "#c9d2dc", actor: "guard2" },
  Gossip: { name: "Townsperson", color: "#d8c8e8", actor: "gossip" },
  Kid: { name: "Kid", color: "#9fe6c8", actor: "kid" },
  Crier: { name: "Town Crier", color: "#b9a6ff", actor: "crier" },
  Cook: { name: "Fish Cook", color: "#ffcf7a", actor: "cook" },
  Wren: { name: "Mother Wren", color: "#f0c8a0", actor: "wren" },
  Farmer: { name: "Farmer Odo", color: "#c9d27a", actor: "farmer" },
  Smith: { name: "Thornwick Smith", color: "#e09a6a", actor: "smith" },
  Ness: { name: "Old Ness", color: "#9fc0b0", actor: "ness" },
  // The Gilded Spoon café.
  Pip: { name: "Pip", color: "#f08aa8", actor: "pip" },
  Mari: { name: "Mari", color: "#e88a9a", actor: "mari" },
  Bettany: { name: "Bettany", color: "#8ac0e8", actor: "bettany" },
  Hazel: { name: "Hazel", color: "#c0a8e0", actor: "hazel" },
  Odette: { name: "Madame Odette", color: "#d8dce8", actor: "odette" },
  Barnaby: { name: "Barnaby", color: "#ffcf7a", actor: "barnaby" },
  Tobin: { name: "Tobin", color: "#d8b07a", actor: "tobin" },
  Fenwick: { name: "Old Fenwick", color: "#b8d0a0", actor: "fenwick" },
  Nib: { name: "Nib", color: "#f0c26a", actor: "nib" },
  Traveler: { name: "Hooded Traveler", color: "#a8a8b8", actor: "traveler" },
  Hetty: { name: "Hetty", color: "#e8b48a", actor: "hetty" },
  Crowd: { name: "Candidates", color: "#aab4cc", actor: null },
  // The law (data/law.js). "Watch" is whichever guard has stopped you (no actor of its own: the shot stays on him).
  Watch: { name: "City Watch", color: "#c9d2dc", actor: null },
  Sergeant: { name: "Sergeant Holt", color: "#9ab0e8", actor: "sergeant" },
  Drunk: { name: "Cell Two", color: "#c9b48a", actor: "drunk" },
  Patrol: { name: "City Watch", color: "#c9d2dc", actor: null }, // any of them: the shot stays on whoever you're talking to
  Recruit: { name: "New Recruit", color: "#c9d2dc", actor: null },
  Admirer: { name: "Admirer", color: "#f0a8c0", actor: null },
  Watchman: { name: "Thornwick Watchman", color: "#c9d2dc", actor: null },
  // Luke, who joined the Watch, and Elsie, the sister you pulled out of the Fens.
  Luke: { name: "Luke", color: "#ffd98a", actor: "luke" },
  Elsie: { name: "Elsie", color: "#c9e8a0", actor: "elsie" },
});

export const speakerName = (id, playerName, flags = null) => (id === "Rook" ? playerName : CAST[id]?.label ? CAST[id].label(flags) : CAST[id]?.name ?? id);
