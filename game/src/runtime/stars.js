// The stars over someone's head, as the King sees them (Ep 49), as Cal sees them (Cal's Path), and as everyone sees them
// after the Rite of Waking (Arc 7, Star Sight; GDD §25.3): ink stars on a billboard, drawn without a font.
import { B } from "./look.js";

/**
 * A billboard plane (not yet parented) showing n stars: a number (filled gold), 0 (one hollow star: nothing left), or "?"
 * (one star and a question mark: unreadable, even to the eye that sees them). Sits 2.65 m up once parented to a rig.
 */
export function starPlane(scene, id, n) {
  const BB = B();
    // n: how many (filled gold), 0 (a hollow star: nothing left), or "?" (one star and a question mark: unreadable, even to the eye that sees them).
    const unread = n === "?", w = unread ? 2 : Math.max(1, n), tex = new BB.DynamicTexture(`stars-${id}`, { width: 96 * w, height: 96 }, scene, true), c = tex.getContext();
    c.clearRect(0, 0, 96 * w, 96);
    for (let k = 0; k < (unread ? 1 : w); k++) { // a five-pointed star, drawn (no font needed): filled gold, or only its outline
      c.beginPath();
      for (let i = 0; i < 10; i++) { const r = i % 2 ? 18 : 42, t = (i / 10) * Math.PI * 2 - Math.PI / 2; c[i ? "lineTo" : "moveTo"](48 + k * 96 + Math.cos(t) * r, 50 + Math.sin(t) * r); }
      c.closePath();
      if (n > 0 || unread) { c.fillStyle = "#ffd36a"; c.fill(); } else { c.strokeStyle = "#ffe8b0"; c.lineWidth = 5; c.stroke(); }
    }
    if (unread) { // the question mark, drawn in strokes (no font): a hook and a dot
      c.strokeStyle = "#ffd36a"; c.lineWidth = 11; c.lineCap = "round"; c.beginPath();
      c.arc(144, 34, 18, Math.PI * 1.1, Math.PI * 0.45, false); c.lineTo(144, 66); c.stroke();
      c.beginPath(); c.arc(144, 84, 6, 0, Math.PI * 2); c.fillStyle = "#ffd36a"; c.fill();
    }
    tex.hasAlpha = true; tex.update();
    const mat = new BB.StandardMaterial(`starsM-${id}`, scene);
    mat.diffuseTexture = tex; mat.emissiveTexture = tex; mat.opacityTexture = tex; mat.disableLighting = true; mat.backFaceCulling = false;
    const plane = BB.MeshBuilder.CreatePlane(`stars-${id}`, { width: 0.36 * w, height: 0.36 }, scene);
    plane.material = mat; plane.billboardMode = BB.Mesh.BILLBOARDMODE_ALL; plane.isPickable = false;
    plane.position.set(0, 2.65, 0);
    return plane;
}
