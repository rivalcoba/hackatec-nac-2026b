const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const html = readFileSync(path.join(__dirname, "../public/index.html"), "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function createSketch() {
  const circles = [];
  let color;
  const context = vm.createContext({
    width: 640,
    height: 480,
    image() {},
    fill(...args) { color = args; },
    circle(x, y, size) { circles.push({ x, y, size, color }); },
    noStroke() {},
    stroke() {},
    strokeWeight() {},
    push() {},
    pop() {},
    dist(x1, y1, x2, y2) { return Math.hypot(x1 - x2, y1 - y2); },
  });
  vm.runInContext(script, context);

  return {
    circles,
    draw(hands) {
      circles.length = 0;
      context.testHands = hands;
      vm.runInContext("hands = testHands; draw()", context);
    },
    ball() {
      return vm.runInContext("({ x: ball.x, y: ball.y, heldBy: ball.heldBy })", context);
    },
  };
}

function hand(handedness, x, y, pinching = true) {
  const keypoints = Array.from({ length: 21 }, () => ({ x, y }));
  keypoints[4] = { x: x - (pinching ? 5 : 30), y };
  keypoints[8] = { x: x + (pinching ? 5 : 30), y };
  return { handedness, keypoints };
}

test("places the canvas in the camera panel and updates the system status", () => {
  const status = { dataset: {}, textContent: "" };
  let canvasParent;
  let detectionCallback;
  const context = vm.createContext({
    VIDEO: "video",
    createCanvas() { return { parent(id) { canvasParent = id; } }; },
    createCapture() { return { size() {}, hide() {} }; },
    document: { getElementById() { return status; } },
    ml5: { handPose() { return { detectStart(video, callback) { detectionCallback = callback; } }; } },
  });
  vm.runInContext(script, context);
  vm.runInContext("preload(); setup()", context);
  detectionCallback([]);

  assert.equal(canvasParent, "canvas-container");
  assert.equal(status.textContent, "Sistema activo");
  assert.equal(status.dataset.state, "online");
});

test("draws both hands using their handedness, not their order", () => {
  const sketch = createSketch();
  sketch.draw([hand("Left", 100, 100), hand("Right", 200, 200)]);

  assert.deepEqual(sketch.circles[0].color, [255, 80, 80]);
  assert.deepEqual(sketch.circles[21].color, [0, 255, 150]);
});

test("only the holding hand moves the ball and it releases when lost", () => {
  const sketch = createSketch();
  sketch.draw([hand("Right", 320, 240), hand("Left", 100, 100)]);
  assert.equal(sketch.ball().heldBy, "Right");

  sketch.draw([hand("Left", 100, 100, false), hand("Right", 400, 240)]);
  assert.equal(sketch.ball().heldBy, "Right");
  assert.equal(sketch.ball().x, 400);

  sketch.draw([hand("Left", 100, 100)]);
  assert.equal(sketch.ball().heldBy, null);
  assert.equal(sketch.ball().x, 400);

  sketch.draw([hand("Left", 400, 240)]);
  assert.equal(sketch.ball().heldBy, "Left");
  sketch.draw([hand("Left", 400, 240, false)]);
  assert.equal(sketch.ball().heldBy, null);
});
