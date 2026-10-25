import { test } from "node:test";
import assert from "node:assert/strict";
import { WorldClock, DAY_SECONDS } from "../src/sim/weather.js";

test("a full day passes in DAY_SECONDS; daylight is 1 at noon, 0 at midnight, and eases through dawn and dusk", () => {
  const c = new WorldClock({ hour: 0 });
  assert.equal(c.daylight, 0); assert.ok(c.night);
  c.hour = 12; assert.equal(c.daylight, 1); assert.ok(!c.night);
  c.hour = 6; assert.ok(c.daylight > 0 && c.daylight < 1);
  c.hour = 19; assert.ok(c.daylight > 0 && c.daylight < 1);
  const d = new WorldClock({ hour: 3, rng: () => 0.99 });
  for (let i = 0; i < DAY_SECONDS; i++) d.update(1);
  assert.ok(Math.abs(d.hour - 3) < 1e-6);
});

test("weather follows the region's climate: the dry sea almost never rains, the Undercroft is indoors", () => {
  let r = 0.3; const seq = () => r;
  const c = new WorldClock({ rng: seq });
  c.setClimate("fens"); c._change(); assert.equal(c.sky, "rain"); // 0.3 < the fens' 0.4 chance
  c.setClimate("lighthouse"); assert.notEqual(c.sky, "rain");      // arriving at the dry sea clears the rain
  c.setClimate("undercroft"); c.sky = "rain";
  for (let i = 0; i < 60; i++) c.update(1);
  assert.ok(!c.raining, "no rain underground");
});

test("rain and night empty the streets; the clock saves and loads", () => {
  const c = new WorldClock({ hour: 12 });
  const day = c.density;
  c.wet = 1; assert.ok(c.density < day);
  c.wet = 0; c.hour = 1; assert.ok(c.density < day);
  c.sky = "rain"; c.hour = 21.5;
  const d = new WorldClock(); d.load(JSON.parse(JSON.stringify(c)));
  assert.equal(d.sky, "rain"); assert.equal(d.hour, 21.5); assert.ok(d.raining);
  assert.equal(d.label, "21:30");
});
