const test = require('node:test');
const assert = require('node:assert/strict');
const { createInteraction, handState } = require('../interaction');

test('hand state normalizes and clamps midpoint coordinates and detects a pinch', () => {
  const keypoints = [];
  keypoints[4] = { x: 310, y: 230 };
  keypoints[8] = { x: 330, y: 250 };
  assert.deepEqual(handState({ keypoints }, 640, 480), {
    present: true, x: 0.5, y: 0.5, pinched: true
  });
  keypoints[4] = { x: -50, y: 600 };
  keypoints[8] = { x: -10, y: 600 };
  assert.deepEqual(handState({ keypoints }, 640, 480), {
    present: true, x: 0, y: 1, pinched: false
  });
});

test('normalized camera coordinates map to the scene plane', () => {
  const interaction = createInteraction();
  const topLeft = interaction.update({ present: true, x: 0, y: 0, pinched: false });
  assert.deepEqual(topLeft.cursor, { x: -1.6, y: 2.5 });
  interaction.update({ present: false });
  const bottomRight = interaction.update({ present: true, x: 1, y: 1, pinched: false });
  assert.deepEqual(bottomRight.cursor, { x: 1.6, y: 0.5 });
});

test('a pinch near the sphere grabs, moves and releases it', () => {
  const interaction = createInteraction();
  assert.equal(interaction.update({ present: true, x: 0.5, y: 0.5, pinched: true }).held, true);
  const moved = interaction.update({ present: true, x: 0.75, y: 0.5, pinched: true });
  assert.ok(moved.object.x > 0);
  const released = interaction.update({ present: true, x: 0.75, y: 0.5, pinched: false });
  assert.equal(released.held, false);
  assert.deepEqual(released.object, moved.object);
});

test('a pinch away from the sphere cannot grab until it is released and pinched again', () => {
  const interaction = createInteraction();
  assert.equal(interaction.update({ present: true, x: 0, y: 0.5, pinched: true }).held, false);
  for (let i = 0; i < 20; i++) {
    assert.equal(interaction.update({ present: true, x: 0.5, y: 0.5, pinched: true }).held, false);
  }
  interaction.update({ present: true, x: 0.5, y: 0.5, pinched: false });
  assert.equal(interaction.update({ present: true, x: 0.5, y: 0.5, pinched: true }).held, true);
});

test('losing the hand releases the sphere without moving it', () => {
  const interaction = createInteraction();
  interaction.update({ present: true, x: 0.5, y: 0.5, pinched: true });
  const moved = interaction.update({ present: true, x: 0.7, y: 0.5, pinched: true });
  const lost = interaction.update({ present: false });
  assert.equal(lost.held, false);
  assert.equal(lost.cursor, null);
  assert.deepEqual(lost.object, moved.object);
});
