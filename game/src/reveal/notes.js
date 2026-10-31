// The Field Notes (GDD §15.9, §25.3 "a word for it"; Ep 50's last scene): the notebooks he left on the bare bed in his
// old room, addressed to Rook. In the Journal: a page a Lantern, his note under each sketch, the little stars he drew by
// every name (nobody knows what they're for), and in every margin a line in the script on his mask. Nobody here can
// read it but Lio, a little; over Arc 6 he reads more, and a margin shows what it says once its flag is set.
// This folder is the one allowed to name him (§15.11); the Journal itself (main.js) only shows what this returns.

import { truthy } from "../core/flags.js";

export const FIELD_NOTES = Object.freeze({
  show: "FIELD_NOTES",
  title: "FIELD NOTES · FOR ROOK",
  pages: Object.freeze([
    { who: "Juno", stars: 2, note: "Ties a knot when she's scared. Don't tell her you know.",
      margin: { flag: "MARGIN_JUNO", text: "She'll cut it off when she finds out. Let her. She ties a better one after." } },
    { who: "Bas", stars: 2, note: "Counts his steps in a fight. Let him.",
      margin: { flag: "MARGIN_BAS", text: "Never let him carry it alone. He'll try." } },
    { who: "Tamsin", stars: 1, note: "Means it, every time. Don't waste that.",
      margin: { flag: "MARGIN_TAMSIN", text: "She asked me if I liked it here. I said yes. I should find out whether that was a lie." } },
    { who: "Lio", stars: 2, note: "Reads everything. Give him the hard ones.",
      margin: { flag: "MARGIN_LIO", text: "Hello, Lio. Slower on the third line." } },
    { who: "Dagrun", stars: 3, note: "Leaves the light on. Make sure he sleeps.",
      margin: { flag: "MARGIN_DAGRUN", text: "He took me in when nobody would. Of all of them, he's the one I can't look at." } },
    { who: "Rook", stars: 0, note: "", sketch: "No note. Just a drawing of the brass key.",
      margin: { flag: "MARGIN_ROOK", text: "Keep the key." } },
  ]),
});

/**
 * A line of his script, drawn: a few ink strokes a glyph, the same every time for the same seed (inline SVG, so it
 * draws on any phone, with no font to go missing).
 */
export function scriptStrokes(seed, glyphs = 9) {
  let s = (seed * 7919 + 13) % 2147483647 || 1;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const w = glyphs * 15 + 6, paths = [];
  for (let g = 0; g < glyphs; g++) {
    const x0 = 4 + g * 15, n = 2 + Math.floor(r() * 3);
    for (let k = 0; k < n; k++) {
      const ax = x0 + r() * 10, ay = 3 + r() * 12, bx = x0 + r() * 10, by = 3 + r() * 12, cx = (ax + bx) / 2 + (r() - 0.5) * 8, cy = (ay + by) / 2 + (r() - 0.5) * 8;
      paths.push(`M${ax.toFixed(1)} ${ay.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`);
    }
    if (r() < 0.35) paths.push(`M${(x0 + 5).toFixed(1)} 17.5h0.6`); // a dot under it
  }
  return `<svg class="script" viewBox="0 0 ${w} 20" width="${w}" height="20" aria-label="a line in a script nobody here can read" role="img"><path d="${paths.join("")}"/></svg>`;
}

/** What the Journal shows of the Field Notes with these flags: nothing until they've been found. */
export function fieldNotes(flags) {
  const show = truthy(flags.get(FIELD_NOTES.show));
  const pages = FIELD_NOTES.pages.map((p, i) => {
    const read = truthy(flags.get(p.margin.flag));
    return { who: p.who, stars: "★".repeat(p.stars), note: p.note, sketch: p.sketch ?? "", read, margin: read ? p.margin.text : "", script: scriptStrokes(i + 3, 7 + (p.margin.text.length % 5)) };
  });
  const reading = truthy(flags.get("LIO_SCRIPT"));
  const hint = pages.some((p) => !p.read) ? (reading ? "Lio is working through the margins, a line at a time." : "Nobody can read the margins.") : "Lio has read every margin.";
  return { show, title: FIELD_NOTES.title, pages, hint, stars: "Every name but yours has little stars drawn beside it. Nobody knows what they're for." };
}
