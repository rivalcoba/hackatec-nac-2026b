const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const Training = require("../public/training");

test("simulated pinches advance lessons and drag a tool into the case board", async () => {
  const d3 = await import("d3");
  const script = readFileSync(path.join(__dirname, "../public/app.js"), "utf8");
  let nextHands = [];
  let detectionError;
  let scheduledFrame;
  let copiedVideo;
  let target;
  let lastPoint;
  const elements = {};
  const classes = { toggle() {}, remove() {} };
  const plain = () => ({
    dataset: {}, style: {}, classList: classes, hidden: false, textContent: "",
    appendChild() {}, addEventListener() {}, setAttribute() {}, removeAttribute() {},
  });
  const content = plain();
  let html = "";
  Object.defineProperty(content, "innerHTML", {
    get() { return html; },
    set(value) { html = value; },
  });
  const viewerStatus = plain();
  const viewerEvents = {};
  const viewer = {
    isConnected: true,
    parentElement: { querySelector: () => viewerStatus },
    addEventListener(name, callback) { viewerEvents[name] = callback; },
  };
  content.querySelectorAll = (selector) => selector === "model-viewer" && html.includes("<model-viewer") ? [viewer] : [];
  const chart = plain();
  const chartError = plain();
  content.querySelector = (selector) => {
    if (selector === "[data-drop-zone]" && html.includes("data-drop-zone")) return elements.drop;
    if (selector === ".results-chart") return chart;
    if (selector === ".chart-error") return chartError;
    return null;
  };
  content.contains = () => true;
  content.addEventListener = (name, callback) => { if (name === "click") content.onClick = callback; };
  const button = (dataset, drop = false) => ({
    ...plain(), dataset, isConnected: true,
    closest(selector) {
      if (selector === "[data-gesture]") return this;
      if (selector === "[data-tool]") return dataset.tool ? this : null;
      if (selector === "[data-drop-zone]") return drop ? this : null;
      if (selector === "[data-action], [data-drop-zone]") return dataset.action || drop ? this : null;
      return null;
    },
    hasAttribute(name) { return name === "data-drop-zone" && drop; },
    click() { content.onClick({ target: this }); },
  });
  elements.drop = button({}, true);
  const video = { ...plain(), videoWidth: 640, videoHeight: 480, play: async () => {} };
  const colors = [];
  const drawing = { clearRect() {}, beginPath() {}, arc() {}, fill() { colors.push(this.fillStyle); } };
  const overlay = { ...plain(), width: 640, height: 480, getContext: () => drawing };
  const detectionCanvas = { width: 0, height: 0, getContext: () => ({ drawImage(source) { copiedVideo = source; } }) };
  let retry;
  const retryCamera = { ...plain(), addEventListener(name, callback) { if (name === "click") retry = callback; } };
  Object.assign(elements, {
    content, camera: video, "hand-overlay": overlay,
    "retry-camera": retryCamera,
    "case-board": { getBoundingClientRect: () => ({ left: 100, top: 100, width: 800, height: 600 }) },
  });
  const document = {
    createElement() { return detectionCanvas; },
    getElementById(id) {
      if (id === "case-board" && !html.includes('id="case-board"')) return null;
      return elements[id] ||= plain();
    },
    querySelectorAll: () => [],
    elementFromPoint(x, y) { lastPoint = { x, y }; return target; },
  };
  let onTrackEnded;
  let trackStopped = false;
  const track = { addEventListener(name, callback) { if (name === "ended") onTrackEnded = callback; }, stop() { trackStopped = true; } };
  const context = vm.createContext({
    Training, document, console: { error() {} },
    d3: {
      arc: d3.arc,
      pie: d3.pie,
      select(element) {
        assert.equal(element, chart);
        const selection = {
          selectAll() { return this; },
          data(values) { chart.segments = values; chart.attributes = {}; return this; },
          join() { return this; },
          attr(name, value) { chart.attributes[name] = chart.segments.map(value); return this; },
        };
        return selection;
      },
    },
    navigator: { mediaDevices: { getUserMedia: async () => ({ getTracks: () => [track], getVideoTracks: () => [track] }) } },
    ml5: { handPose: async () => ({ async detect(source) { assert.equal(source, detectionCanvas); if (detectionError) throw detectionError; return nextHands; } }) },
    customElements: { get: () => true },
    setTimeout() {},
    requestAnimationFrame(callback) { scheduledFrame = callback; return 1; },
    cancelAnimationFrame() { scheduledFrame = null; },
    window: { innerWidth: 1000, innerHeight: 1000, scrollBy() {}, addEventListener() {} },
  });
  vm.runInContext(script, context);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(copiedVideo, video);
  assert.equal(typeof scheduledFrame, "function");
  assert.equal(elements["camera-status"].textContent, "Control por gestos activo. Acerca el cursor al borde para desplazarte.");

  async function feed(hands) {
    nextHands = hands;
    const frame = scheduledFrame;
    assert.equal(typeof frame, "function");
    frame();
    await new Promise((resolve) => setImmediate(resolve));
  }

  function hand(pinching) {
    const keypoints = Array.from({ length: 21 }, () => ({ x: 320, y: 240 }));
    keypoints[4] = { x: pinching ? 315 : 280, y: 240 };
    keypoints[8] = { x: pinching ? 325 : 360, y: 240 };
    return { handedness: "Right", keypoints };
  }
  function scaledHand(distance, palmWidth) {
    const result = hand(true);
    result.keypoints[4] = { x: 320 - distance / 2, y: 240 };
    result.keypoints[8] = { x: 320 + distance / 2, y: 240 };
    result.keypoints[5] = { x: 320 - palmWidth / 2, y: 300 };
    result.keypoints[17] = { x: 320 + palmWidth / 2, y: 300 };
    return result;
  }
  async function activate(action) {
    target = button({ action });
    await feed([hand(true)]);
    await feed([hand(false)]);
  }
  await feed([hand(false), { ...hand(false), handedness: "Left" }]);
  assert.ok(colors.includes("#00ff96"));
  assert.ok(colors.includes("#ff5050"));
  await activate("start");
  assert.match(html, /Calibrador Vernier/);
  viewerEvents.error();
  assert.match(viewerStatus.textContent, /No se pudo cargar el modelo/);
  viewerEvents.load();
  assert.equal(viewerStatus.hidden, true);
  for (let i = 0; i < 4; i += 1) await activate("next");
  assert.match(html, /CASOS PRÁCTICOS/);

  target = button({ tool: "vernier" });
  await feed([hand(true)]);
  assert.deepEqual(lastPoint, { x: 500, y: 400 });
  target = { closest: () => null };
  await feed([hand(false)]);
  assert.match(html, /1 \/ 4/);

  target = button({ tool: "vernier" });
  await feed([hand(true)]);
  await feed([]);
  assert.match(html, /1 \/ 4/);
  await feed([hand(false)]);

  target = null;
  await feed([scaledHand(55, 150)]);
  target = button({ tool: "vernier" });
  await feed([scaledHand(55, 150)]);
  assert.equal(elements["drag-ghost"].hidden, false);
  assert.match(elements["drag-ghost"].innerHTML, /<model-viewer src="[^"]*vernier[^"]*"/);
  target = elements.drop;
  await feed([scaledHand(85, 150)]);
  assert.match(html, /1 \/ 4/);
  await feed([scaledHand(110, 150)]);
  assert.match(html, /¡Respuesta correcta!/);
  assert.match(html, /Tu respuesta:<\/strong> Calibrador Vernier/);
  assert.match(html, /El calibrador Vernier se utiliza para medir/);
  assert.match(html, /Siguiente caso/);
  await feed([hand(false)]);
  assert.match(html, /¡Respuesta correcta!/);
  await activate("next-case");
  assert.match(html, /2 \/ 4/);

  button({ tool: "vernier" }).click();
  elements.drop.click();
  assert.match(html, /Respuesta incorrecta/);
  assert.match(html, /Tu respuesta:<\/strong> Calibrador Vernier/);
  assert.match(html, /Respuesta correcta:<\/strong> Llave Allen/);
  assert.match(html, /La llave Allen está diseñada/);
  button({ action: "next-case" }).click();
  assert.match(html, /3 \/ 4/);
  button({ tool: "pipe" }).click();
  elements.drop.click();
  button({ action: "next-case" }).click();
  assert.match(html, /4 \/ 4/);
  button({ tool: "bolt" }).click();
  elements.drop.click();
  assert.match(html, /¡Respuesta correcta!/);
  assert.match(html, /Ver evaluación/);
  assert.doesNotMatch(html, /Tu resultado/);
  button({ action: "next-case" }).click();
  assert.match(html, /Tu resultado/);
  assert.match(html, /3 de 4 respuestas correctas/);
  assert.deepEqual(Array.from(chart.segments, (segment) => segment.value), [3, 1]);
  assert.deepEqual(Array.from(chart.attributes.fill), ["#65e5bd", "#ffad88"]);
  assert.ok(chart.attributes.d.every((path) => path && !path.includes("NaN")));

  function finishWithAnswers(selected) {
    button({ action: "restart" }).click();
    button({ action: "start" }).click();
    for (let i = 0; i < 4; i += 1) button({ action: "next" }).click();
    for (const id of selected) {
      button({ tool: id }).click();
      elements.drop.click();
      button({ action: "next-case" }).click();
    }
  }
  finishWithAnswers(["allen", "vernier", "allen", "allen"]);
  assert.match(html, /0 de 4 respuestas correctas/);
  assert.deepEqual(Array.from(chart.segments, (segment) => segment.value), [4]);
  assert.deepEqual(Array.from(chart.attributes.fill), ["#ffad88"]);
  assert.ok(!chart.attributes.d[0].includes("NaN"));
  finishWithAnswers(["vernier", "allen", "pipe", "bolt"]);
  assert.match(html, /4 de 4 respuestas correctas/);
  assert.deepEqual(Array.from(chart.segments, (segment) => segment.value), [4]);
  assert.deepEqual(Array.from(chart.attributes.fill), ["#65e5bd"]);
  assert.ok(!chart.attributes.d[0].includes("NaN"));
  context.d3 = undefined;
  finishWithAnswers(["allen", "vernier", "allen", "allen"]);
  assert.equal(chart.hidden, true);
  assert.equal(chartError.hidden, false);
  assert.match(html, /0 de 4 respuestas correctas/);
  onTrackEnded();
  assert.equal(trackStopped, true);
  assert.match(elements["camera-status"].textContent, /cámara se desconectó/);
  assert.equal(elements["retry-camera"].hidden, false);
  await retry();
  await new Promise((resolve) => setImmediate(resolve));
  detectionError = new Error("Inference failed");
  await feed([]);
  assert.match(elements["camera-status"].textContent, /No se pudo procesar el video/);
  assert.equal(elements["retry-camera"].hidden, false);
});
