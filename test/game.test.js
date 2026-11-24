const test = require('node:test');
const assert = require('node:assert/strict');
const { createGame, TOOLS, LIFT_Y, FEEDBACK_MS, RESULTS_MS } = require('../game');

const absent = { present: false };
// Scene coordinates map to camera input: x = (sx / 3.2) + 0.5, y = (2.5 - sy) / 2
const at = (x, y, pinched) => ({ present: true, x: x / 3.2 + 0.5, y: (2.5 - y) / 2, pinched });

const targetOf = state => TOOLS.find(tool => state.message.includes(tool.label));

function sequence(values) {
  let i = 0;
  return () => values[i++ % values.length];
}

// Moves the hand to an item, pinches, and lifts it above the line.
function pick(game, state, id, now) {
  const item = state.items.find(candidate => candidate.id === id);
  let current = state;
  for (let i = 0; i < 20; i++) current = game.update(at(item.x, item.y, false), now);
  current = game.update(at(item.x, item.y, true), now);
  for (let i = 0; i < 30 && current.phase === 'playing'; i++) current = game.update(at(item.x, LIFT_Y + 0.2, true), now);
  return current;
}

test('each round shows three distinct tools including the requested one at the top prompt', () => {
  const game = createGame();
  game.start(0);
  const state = game.tick(0);
  assert.equal(state.items.length, 3);
  assert.equal(new Set(state.items.map(item => item.id)).size, 3);
  assert.match(state.message, /^Toma .+ y súbela$/);
  assert.equal(state.title, 'Ronda 1 de 3');
});

test('picking the requested tool by lifting it scores a hit, and a wrong one a miss', () => {
  const game = createGame();
  game.start(0);
  let state = game.tick(0);
  const target = targetOf(state);
  state = pick(game, state, target.id, 4000);
  assert.equal(state.phase, 'feedback');
  assert.equal(state.message, '¡Correcto!');
  assert.equal(state.highlight, target.id);

  state = game.tick(4000 + FEEDBACK_MS);
  assert.equal(state.phase, 'playing');
  assert.equal(state.title, 'Ronda 2 de 3');
  const second = targetOf(state);
  const wrong = state.items.find(item => item.id !== second.id);
  state = pick(game, state, wrong.id, 9000);
  assert.equal(state.phase, 'feedback');
  assert.match(state.message, /^Incorrecto: era /);
  assert.equal(state.highlight, second.id);
});

test('after three rounds the results are shown and the game restarts', () => {
  const game = createGame({ random: sequence([0.1, 0.5, 0.9, 0.3]) });
  game.start(0);
  let now = 0;
  let state = game.tick(now);
  for (let round = 0; round < 3; round++) {
    const target = targetOf(state);
    const choice = round === 1 ? state.items.find(item => item.id !== target.id).id : target.id;
    now += 2000;
    state = pick(game, state, choice, now);
    now += FEEDBACK_MS;
    state = game.tick(now);
  }
  assert.equal(state.phase, 'results');
  assert.equal(state.title, 'Resultados');
  assert.equal(state.items.length, 0);
  assert.equal(state.summary.correct, 2);
  assert.equal(state.summary.total, 3);
  assert.equal(state.summary.averageMs, 2000);
  assert.equal(state.summary.details.length, 3);
  assert.equal(state.summary.details[1].correct, false);
  assert.match(state.message, /Aciertos: 2 de 3/);

  state = game.update(at(0, 1, true), now + RESULTS_MS - 1);
  assert.equal(state.phase, 'results');
  state = game.tick(now + RESULTS_MS);
  assert.equal(state.phase, 'playing');
  assert.equal(state.title, 'Ronda 1 de 3');
  assert.equal(state.items.length, 3);
});

test('targets do not repeat within a game', () => {
  const game = createGame();
  game.start(0);
  const seen = [];
  let now = 0;
  let state = game.tick(now);
  for (let round = 0; round < 3; round++) {
    const target = targetOf(state);
    seen.push(target.id);
    now += 1000;
    state = pick(game, state, target.id, now);
    now += FEEDBACK_MS;
    state = game.tick(now);
  }
  assert.equal(new Set(seen).size, 3);
});

test('releasing below the line returns the tool to its slot without choosing', () => {
  const game = createGame();
  game.start(0);
  let state = game.tick(0);
  const item = state.items[0];
  for (let i = 0; i < 20; i++) game.update(at(item.x, item.y, false), 100);
  game.update(at(item.x, item.y, true), 100);
  state = game.update(at(item.x, item.y + 0.5, true), 100);
  assert.equal(state.held, item.id);
  assert.ok(state.items[0].y > item.y);
  state = game.update(at(item.x, item.y + 0.5, false), 100);
  assert.equal(state.phase, 'playing');
  assert.equal(state.held, null);
  assert.equal(state.items[0].y, item.y);
});

test('losing the hand while holding returns the tool and chooses nothing', () => {
  const game = createGame();
  game.start(0);
  let state = game.tick(0);
  const item = state.items[1];
  for (let i = 0; i < 20; i++) game.update(at(item.x, item.y, false), 100);
  game.update(at(item.x, item.y, true), 100);
  game.update(at(item.x, item.y + 0.5, true), 100);
  state = game.update(absent, 100);
  assert.equal(state.phase, 'playing');
  assert.equal(state.held, null);
  assert.equal(state.cursor, null);
  assert.equal(state.items[1].y, item.y);
});
