const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createInteraction } = require('../interaction');

test('viewer renders tracking messages and releases a stale hand', () => {
  const html = fs.readFileSync(path.join(__dirname, '../vr.html'), 'utf8');
  assert.match(html, /gltf-model="\/assets\/vernier-caliper\.glb"/);
  const script = html.match(/<script>\s*([\s\S]*?)\s*<\/script>/)[1];
  const elements = Object.fromEntries(['object', 'model', 'held-indicator', 'cursor', 'status', 'model-error'].map(id => [
    id, {
      attributes: {}, listeners: {},
      setAttribute(name, value) { this.attributes[name] = value; },
      addEventListener(name, callback) { this.listeners[name] = callback; }
    }
  ]));
  let now = 100;
  let checkTimeout;
  let socket;
  class FakeWebSocket {
    constructor(url) { this.url = url; this.listeners = {}; socket = this; }
    addEventListener(name, callback) { this.listeners[name] = callback; }
  }
  vm.runInNewContext(script, {
    createInteraction,
    document: { getElementById: id => elements[id] },
    location: { protocol: 'https:', host: 'example.test' },
    WebSocket: FakeWebSocket,
    console: { error() {} },
    Date: { now: () => now },
    setInterval: callback => { checkTimeout = callback; },
    setTimeout: () => {}
  });
  assert.equal(socket.url, 'wss://example.test/viewer');
  socket.listeners.message({ data: JSON.stringify({ present: true, x: 0.5, y: 0.5, pinched: true }) });
  assert.equal(elements['held-indicator'].attributes.visible, true);
  assert.equal(elements.cursor.attributes.visible, true);
  socket.listeners.message({ data: JSON.stringify({ present: true, x: 0.75, y: 0.5, pinched: true }) });
  assert.ok(elements.object.attributes.position.x > 0);
  now += 1600;
  checkTimeout();
  assert.equal(elements['held-indicator'].attributes.visible, false);
  assert.equal(elements.cursor.attributes.visible, false);
  assert.equal(elements.status.textContent, 'Sin señal de seguimiento');
  elements.model.listeners['model-error']({ detail: {} });
  assert.equal(elements['model-error'].hidden, false);
  assert.equal(elements['model-error'].textContent, 'No se pudo cargar el modelo 3D.');
});
