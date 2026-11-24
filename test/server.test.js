const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const fs = require('node:fs');
const path = require('node:path');
const { WebSocket } = require('ws');

test('server delivers hand state and releases viewers on disconnect', async t => {
  const server = spawn(process.execPath, ['server.js'], {
    cwd: require('node:path').join(__dirname, '..'),
    env: { ...process.env, PORT: '0', TLS_KEY: '', TLS_CERT: '' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  t.after(() => server.kill());
  const [chunk] = await once(server.stdout, 'data');
  const match = chunk.toString().match(/port (\d+)/);
  assert.ok(match, 'server did not report its port');
  const base = `http://127.0.0.1:${match[1]}`;
  for (const [route, contentType] of [
    ['/', 'text/html; charset=utf-8'],
    ['/tracker', 'text/html; charset=utf-8'],
    ['/vr?source=test', 'text/html; charset=utf-8'],
    ['/quiz', 'text/html; charset=utf-8'],
    ['/interaction.js', 'text/javascript; charset=utf-8'],
    ['/game.js', 'text/javascript; charset=utf-8']
  ]) {
    const response = await fetch(`${base}${route}`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), contentType);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.ok((await response.text()).length > 0);
  }
  const home = await (await fetch(`${base}/`)).text();
  assert.match(home, /href="\/vr"/);
  assert.match(home, /href="\/tracker"/);
  assert.match(home, /href="\/quiz"/);
  const trackerPage = await (await fetch(`${base}/tracker`)).text();
  assert.match(trackerPage, /Seguimiento de mano \| Manipulación con la mano/);
  const model = await fetch(`${base}/assets/vernier-caliper.glb`);
  assert.equal(model.status, 200);
  assert.equal(model.headers.get('content-type'), 'model/gltf-binary');
  assert.equal(model.headers.get('cache-control'), 'no-store');
  assert.deepEqual(Buffer.from(await model.arrayBuffer()), fs.readFileSync(path.join(__dirname, '../assets/vernier-caliper.glb')));
  for (const [route, method] of [
    ['/missing', 'GET'],
    ['/assets/missing.glb', 'GET'],
    ['/assets/', 'GET'],
    ['/assets/vernier-caliper.glb', 'POST'],
    ['/server.js', 'GET'],
    ['/VR', 'GET'],
    ['/vr/', 'GET'],
    ['/vr', 'HEAD'],
    ['/vr', 'POST']
  ]) {
    assert.equal((await fetch(`${base}${route}`, { method })).status, 404);
  }
  assert.equal((await fetch(`${base}/vr`, {
    headers: { 'If-None-Match': '*' }
  })).status, 200);

  const viewer = new WebSocket(base.replace('http:', 'ws:') + '/viewer');
  t.after(() => viewer.terminate());
  const initial = once(viewer, 'message');
  assert.deepEqual(JSON.parse((await initial)[0]), { present: false });
  const tracker = new WebSocket(base.replace('http:', 'ws:') + '/tracking');
  t.after(() => tracker.terminate());
  await once(tracker, 'open');
  const delivered = once(viewer, 'message');
  tracker.send(JSON.stringify({ present: true, x: 0.5, y: 0.25, pinched: true }));
  assert.deepEqual(JSON.parse((await delivered)[0]), { present: true, x: 0.5, y: 0.25, pinched: true });

  const secondTracker = new WebSocket(base.replace('http:', 'ws:') + '/tracking');
  t.after(() => secondTracker.terminate());
  const [code] = await once(secondTracker, 'close');
  assert.equal(code, 1008);

  const lost = once(viewer, 'message');
  const trackerClosed = once(tracker, 'close');
  tracker.send(JSON.stringify({ present: true, x: 2, y: 0.25, pinched: true }));
  assert.deepEqual(JSON.parse((await lost)[0]), { present: false });
  assert.equal((await trackerClosed)[0], 1008);
});
