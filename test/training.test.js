const assert = require("node:assert/strict");
const test = require("node:test");
const { tools, scenarios, createTraining, createGestureController, recommendation } = require("../public/training");

test("training introduces each tool before the cases and evaluates all answers", () => {
  const game = createTraining();
  assert.equal(game.answer("allen"), false);
  game.start();
  for (let index = 0; index < tools.length; index += 1) {
    assert.equal(game.state().stage, "learning");
    assert.equal(game.state().lesson, index);
    game.nextLesson();
  }
  assert.equal(game.state().stage, "cases");
  assert.equal(game.answer("invalid"), false);
  assert.equal(game.state().caseIndex, 0);
  for (const scenario of scenarios) assert.equal(game.answer(scenario.answer), true);
  assert.equal(game.state().stage, "results");
  assert.equal(game.answer("allen"), false);
  assert.equal(game.result().score, 4);
  assert.equal(game.result().percent, 100);
  game.reset();
  assert.equal(game.state().stage, "intro");
  assert.deepEqual(game.state().answers, []);
  assert.equal(game.result(), null);
});

test("recommendation thresholds include the intended boundaries", () => {
  assert.match(recommendation(3, 4), /Buen dominio/);
  assert.match(recommendation(2, 4), /Repasa/);
  assert.match(recommendation(1, 4), /Repite/);
});

test("gesture drag belongs to its initiating hand and releases only once", () => {
  const events = [];
  const gesture = createGestureController({
    start(hand) { events.push(`start ${hand.handedness}`); return "tool"; },
    move(token, hand) { events.push(`move ${hand.handedness}`); },
    release(token, hand) { events.push(`release ${hand.handedness}`); },
    cancel() { events.push("cancel"); },
  });
  const hand = (handedness, pinching) => ({ handedness, pinching });
  gesture.update([hand("Right", true)]);
  gesture.update([hand("Left", true), hand("Right", true)]);
  gesture.update([hand("Left", true), hand("Right", false)]);
  gesture.update([hand("Left", true), hand("Right", false)]);
  assert.deepEqual(events, ["start Right", "move Right", "release Right"]);
  gesture.update([hand("Left", false)]);
  gesture.update([hand("Left", true)]);
  gesture.update([]);
  assert.deepEqual(events.slice(-2), ["start Left", "cancel"]);
});

test("a pinch started outside a target can activate it without repeating the action", () => {
  const events = [];
  let target = false;
  const gesture = createGestureController({
    start() { events.push("start"); return target ? "button" : null; },
    move() {},
    release() { events.push("release"); },
    cancel() {},
  });
  const hand = (pinching) => ({ handedness: "Right", pinching });
  gesture.update([hand(true)]);
  target = true;
  gesture.update([hand(true)]);
  gesture.update([hand(true)]);
  gesture.update([hand(false)]);
  gesture.update([hand(false)]);
  assert.deepEqual(events, ["start", "start", "release"]);
});
