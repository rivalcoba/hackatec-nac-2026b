(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Training = api;
})(globalThis, function () {
  const tools = [
    {
      id: "vernier",
      name: "Calibrador Vernier",
      model: "/assets/vernier-caliper.glb",
      description: "Instrumento de medición para comprobar dimensiones de piezas.",
    },
    {
      id: "allen",
      name: "Llave Allen",
      model: "/assets/allen-key.glb",
      description: "Llave para tornillos con alojamiento hexagonal interior.",
    },
    {
      id: "pipe",
      name: "Llave para tubos",
      model: "/assets/pipe-wrench.glb",
      description: "Herramienta de agarre para elementos de forma tubular.",
    },
    {
      id: "bolt",
      name: "Cortapernos",
      model: "/assets/bolt-cutter.glb",
      description: "Herramienta de corte para determinados elementos metálicos.",
    },
  ];

  const scenarios = [
    {
      question: "Durante la revisión de un motor diésel, necesitas comprobar el diámetro de una pieza desmontada. ¿Qué herramienta elegirías?",
      answer: "vernier",
      explanation: "El calibrador Vernier se utiliza para medir dimensiones de piezas.",
    },
    {
      question: "Al inspeccionar un conjunto del motor identificas un tornillo con alojamiento hexagonal interior. ¿Qué herramienta corresponde a ese tipo de tornillo?",
      answer: "allen",
      explanation: "La llave Allen está diseñada para alojamientos hexagonales interiores.",
    },
    {
      question: "En un ejercicio sobre las conexiones auxiliares de un motor diésel necesitas identificar una herramienta de agarre para un elemento tubular. ¿Cuál elegirías?",
      answer: "pipe",
      explanation: "La llave para tubos está destinada al agarre de elementos tubulares.",
    },
    {
      question: "En una maqueta de entrenamiento se pide cortar una varilla metálica ya retirada de un conjunto del motor. ¿Qué herramienta elegirías?",
      answer: "bolt",
      explanation: "El cortapernos es una herramienta de corte; su aplicación depende del material y la capacidad del equipo.",
    },
  ];

  function recommendation(score, total) {
    const percent = total ? Math.round((score / total) * 100) : 0;
    if (percent >= 75) return "Buen dominio inicial. Continúa practicando y reforzando tus conocimientos.";
    if (percent >= 50) return "Repasa los casos que fallaste y vuelve a practicar la selección de herramientas.";
    return "Repite la sección de aprendizaje antes de volver a intentar los casos.";
  }

  function createTraining() {
    let stage = "intro";
    let lesson = 0;
    let answers = [];

    return {
      state() {
        return { stage, lesson, caseIndex: answers.length, answers: [...answers] };
      },
      start() {
        stage = "learning";
        lesson = 0;
        answers = [];
      },
      nextLesson() {
        if (stage !== "learning") return;
        if (lesson < tools.length - 1) lesson += 1;
        else stage = "cases";
      },
      previousLesson() {
        if (stage === "learning" && lesson > 0) lesson -= 1;
      },
      answer(toolId) {
        if (stage !== "cases" || !tools.some((tool) => tool.id === toolId)) return false;
        const scenario = scenarios[answers.length];
        answers.push({ selected: toolId, correct: toolId === scenario.answer });
        if (answers.length === scenarios.length) stage = "results";
        return true;
      },
      reset() {
        stage = "intro";
        lesson = 0;
        answers = [];
      },
      result() {
        if (stage !== "results") return null;
        const score = answers.filter((answer) => answer.correct).length;
        return { score, total: scenarios.length, percent: Math.round(score / scenarios.length * 100), recommendation: recommendation(score, scenarios.length) };
      },
    };
  }

  function createGestureController(handlers) {
    let active = null;
    const consumed = new Set();
    return {
      update(hands) {
        const pinched = new Set(hands.filter((hand) => hand.pinching).map((hand) => hand.handedness));
        for (const handedness of consumed) {
          if (!pinched.has(handedness)) consumed.delete(handedness);
        }
        const hadActive = active !== null;
        if (active) {
          for (const handedness of pinched) consumed.add(handedness);
          const hand = hands.find((item) => item.handedness === active.handedness);
          if (!hand) {
            handlers.cancel(active.token);
            active = null;
          } else if (!hand.pinching) {
            handlers.release(active.token, hand);
            active = null;
          } else {
            handlers.move(active.token, hand);
          }
        }
        if (!hadActive && !active) {
          for (const hand of hands) {
            if (!hand.pinching || consumed.has(hand.handedness)) continue;
            const token = handlers.start(hand);
            if (token) {
              active = { handedness: hand.handedness, token };
              consumed.add(hand.handedness);
              break;
            }
          }
        }
      },
      cancel() {
        if (active) handlers.cancel(active.token);
        active = null;
      },
    };
  }

  return { tools, scenarios, recommendation, createTraining, createGestureController };
});
