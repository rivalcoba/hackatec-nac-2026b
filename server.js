const fs = require('node:fs');
const http = require('node:http');
const https = require('node:https');
const path = require('node:path');
const express = require('express');
const { WebSocket, WebSocketServer } = require('ws');

const port = Number(process.env.PORT ?? 3000);
const keyPath = process.env.TLS_KEY;
const certPath = process.env.TLS_CERT;
if (!!keyPath !== !!certPath) {
  throw new Error('TLS_KEY and TLS_CERT must be provided together');
}

const app = express();
app.disable('x-powered-by');
app.enable('case sensitive routing');
app.enable('strict routing');

app.use((req, res, next) => {
  if (req.method !== 'GET') return res.status(404).send('Not found');
  next();
});

function serveFile(filename, contentType) {
  return (req, res) => fs.readFile(path.join(__dirname, filename), (error, data) => {
    if (error) {
      console.error('Unable to serve file:', error);
      res.status(500).send('Unable to serve file');
      return;
    }
    res.set({ 'Content-Type': contentType, 'Cache-Control': 'no-store' });
    res.end(data);
  });
}

app.get('/', serveFile('index.html', 'text/html; charset=utf-8'));
app.get('/tracker', serveFile('tracker.html', 'text/html; charset=utf-8'));
app.get('/vr', serveFile('vr.html', 'text/html; charset=utf-8'));
app.get('/quiz', serveFile('quiz.html', 'text/html; charset=utf-8'));
app.get('/interaction.js', serveFile('interaction.js', 'text/javascript; charset=utf-8'));
app.get('/game.js', serveFile('game.js', 'text/javascript; charset=utf-8'));
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
  index: false,
  redirect: false,
  setHeaders: res => res.setHeader('Cache-Control', 'no-store')
}));
app.use((req, res) => res.status(404).send('Not found'));

const server = keyPath
  ? https.createServer({ key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }, app)
  : http.createServer(app);
const sockets = new WebSocketServer({ server, maxPayload: 1024 });
const absent = JSON.stringify({ present: false });
let tracker = null;
let latest = absent;

function broadcast(message) {
  for (const client of sockets.clients) {
    if (client !== tracker && client.readyState === WebSocket.OPEN) client.send(message);
  }
}

sockets.on('connection', (socket, req) => {
  if (req.url === '/tracking') {
    if (tracker) {
      socket.close(1008, 'A tracker is already connected');
      return;
    }
    tracker = socket;
    socket.on('message', data => {
      let state;
      try {
        state = JSON.parse(data.toString());
      } catch (error) {
        console.error('Invalid tracking message:', error.message);
        socket.close(1007, 'Invalid JSON');
        return;
      }
      if (!state || typeof state.present !== 'boolean' ||
          (state.present && (typeof state.pinched !== 'boolean' ||
            !Number.isFinite(state.x) || state.x < 0 || state.x > 1 ||
            !Number.isFinite(state.y) || state.y < 0 || state.y > 1))) {
        console.error('Invalid tracking state');
        socket.close(1008, 'Invalid tracking state');
        return;
      }
      latest = JSON.stringify(state.present
        ? { present: true, x: state.x, y: state.y, pinched: state.pinched }
        : { present: false });
      broadcast(latest);
    });
    socket.on('close', () => {
      if (tracker === socket) {
        tracker = null;
        latest = absent;
        broadcast(latest);
      }
    });
  } else if (req.url === '/viewer') {
    socket.send(latest);
  } else {
    socket.close(1008, 'Unknown endpoint');
  }
  socket.on('error', error => console.error('WebSocket error:', error.message));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on ${keyPath ? 'https' : 'http'} port ${server.address().port}`);
});
