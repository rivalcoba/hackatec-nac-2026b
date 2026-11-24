(function (root) {
  const { createPointer } = typeof module !== 'undefined' ? require('./interaction') : root;

  const TOOLS = [
    { id: 'allen-key', label: 'la llave Allen', name: 'Llave Allen' },
    { id: 'bolt-cutter', label: 'el cortapernos', name: 'Cortapernos' },
    { id: 'pipe-wrench', label: 'la llave de tubo', name: 'Llave de tubo' },
    { id: 'vernier-caliper', label: 'el calibrador Vernier', name: 'Calibrador Vernier' }
  ];
  const SLOT_X = [-1.1, 0, 1.1];
  const REST_Y = 1;
  const LIFT_Y = 1.9;
  const GRAB_RADIUS = 0.45;
  const FEEDBACK_MS = 2500;
  const RESULTS_MS = 10000;

  const seconds = ms => `${(ms / 1000).toFixed(1)} s`;

  function createGame({ tools = TOOLS, random = Math.random, rounds = 3, choices = 3 } = {}) {
    const pointer = createPointer();
    let phase;
    let roundIndex;
    let targets;
    let items;
    let held;
    let results;
    let roundStart;
    let phaseEnd;
    let cursor = null;

    function shuffle(list) {
      const copy = [...list];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }

    function startRound(index, now) {
      const target = targets[index];
      const others = shuffle(tools.filter(tool => tool !== target)).slice(0, choices - 1);
      items = shuffle([target, ...others]).map((tool, slot) => ({ tool, slot, x: SLOT_X[slot], y: REST_Y }));
      roundIndex = index;
      roundStart = now;
      held = null;
      phase = 'playing';
    }

    function start(now) {
      const order = shuffle(tools);
      targets = Array.from({ length: rounds }, (_, i) => order[i % order.length]);
      results = [];
      startRound(0, now);
    }

    function choose(item, now) {
      const target = targets[roundIndex];
      results.push({
        target,
        picked: item.tool,
        correct: item.tool === target,
        ms: now - roundStart
      });
      held = null;
      phase = 'feedback';
      phaseEnd = now + FEEDBACK_MS;
    }

    function tick(now) {
      if (phase === 'feedback' && now >= phaseEnd) {
        if (results.length < rounds) {
          startRound(roundIndex + 1, now);
        } else {
          held = null;
          phase = 'results';
          phaseEnd = now + RESULTS_MS;
        }
      } else if (phase === 'results' && now >= phaseEnd) {
        start(now);
      }
      return snapshot(now);
    }

    function summary() {
      const correct = results.filter(result => result.correct).length;
      const ratio = correct / rounds;
      const rating = ratio === 1
        ? '¡Excelente! Conoces muy bien las herramientas.'
        : ratio >= 0.6
          ? 'Bien, pero conviene repasar algunas herramientas.'
          : 'Necesitas repasar las herramientas.';
      return {
        correct,
        total: rounds,
        averageMs: results.reduce((sum, result) => sum + result.ms, 0) / rounds,
        rating,
        details: results.map(result => ({
          target: result.target.id,
          picked: result.picked.id,
          correct: result.correct,
          ms: result.ms
        }))
      };
    }

    function text(now) {
      const total = `Ronda ${roundIndex + 1} de ${rounds}`;
      if (phase === 'playing') {
        return { title: total, message: `Toma ${targets[roundIndex].label} y súbela`, tone: 'neutral' };
      }
      if (phase === 'feedback') {
        const last = results[results.length - 1];
        return last.correct
          ? { title: total, message: '¡Correcto!', tone: 'good' }
          : { title: total, message: `Incorrecto: era ${last.target.label}`, tone: 'bad' };
      }
      const { correct, averageMs, rating } = summary();
      const lines = results.map((result, i) => result.correct
        ? `${i + 1}. ${result.target.name}: correcto (${seconds(result.ms)})`
        : `${i + 1}. ${result.target.name}: elegiste ${result.picked.name} (${seconds(result.ms)})`);
      return {
        title: 'Resultados',
        message: [
          `Aciertos: ${correct} de ${rounds}   Tiempo promedio: ${seconds(averageMs)}`,
          ...lines,
          rating,
          `Nueva partida en ${Math.ceil(Math.max(0, phaseEnd - now) / 1000)} s`
        ].join('\n'),
        tone: correct === rounds ? 'good' : 'neutral'
      };
    }

    function snapshot(now) {
      const feedback = phase === 'feedback' ? results[results.length - 1] : null;
      return {
        phase,
        round: roundIndex + 1,
        rounds,
        liftY: LIFT_Y,
        cursor: cursor && { ...cursor },
        items: phase === 'results' ? [] : items.map(item => ({ id: item.tool.id, slot: item.slot, x: item.x, y: item.y })),
        held: held ? held.item.tool.id : null,
        highlight: feedback ? feedback.target.id : null,
        summary: phase === 'results' ? summary() : null,
        remainingMs: phase === 'results' ? Math.max(0, phaseEnd - now) : 0,
        ...text(now)
      };
    }

    function update(input, now) {
      tick(now);
      const pointed = pointer.update(input);
      cursor = pointed.cursor;
      if (phase !== 'playing') {
        held = null;
        return snapshot(now);
      }
      if (!cursor) {
        release();
      } else {
        if (pointed.pressed) grab();
        else if (!pointed.pinched) release();
        if (held) {
          held.item.x = cursor.x + held.dx;
          held.item.y = cursor.y + held.dy;
          if (held.item.y >= LIFT_Y) choose(held.item, now);
        }
      }
      return snapshot(now);
    }

    function grab() {
      let best = null;
      let bestDistance = GRAB_RADIUS;
      for (const item of items) {
        const distance = Math.hypot(cursor.x - item.x, cursor.y - item.y);
        if (distance < bestDistance) {
          best = item;
          bestDistance = distance;
        }
      }
      if (best) held = { item: best, dx: best.x - cursor.x, dy: best.y - cursor.y };
    }

    function release() {
      if (!held) return;
      held.item.x = SLOT_X[held.item.slot];
      held.item.y = REST_Y;
      held = null;
    }

    start(0);
    return { start, tick, update };
  }

  const api = { createGame, TOOLS, LIFT_Y, FEEDBACK_MS, RESULTS_MS };
  if (typeof module !== 'undefined') module.exports = api;
  else root.createGame = createGame;
})(globalThis);
