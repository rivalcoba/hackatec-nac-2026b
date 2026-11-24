(function () {
  const { tools, scenarios, createTraining, createGestureController } = Training;
  const game = createTraining();
  const content = document.getElementById("content");
  const feedback = document.getElementById("feedback");
  const video = document.getElementById("camera");
  const overlay = document.getElementById("hand-overlay");
  const cameraSlot = document.getElementById("camera-slot");
  const cameraFrame = document.getElementById("camera-frame");
  const cameraMoved = document.getElementById("camera-moved");
  const cameraEmpty = document.getElementById("camera-empty");
  const cameraStatus = document.getElementById("camera-status");
  const retryCamera = document.getElementById("retry-camera");
  const cursor = document.getElementById("gesture-cursor");
  const dragGhost = document.getElementById("drag-ghost");
  let draggedCard = null;
  const detectionCanvas = document.createElement("canvas");
  const detectionContext = detectionCanvas.getContext("2d");
  let selectedTool = null;
  let activeHand = null;
  let cameraStarted = false;
  let stream = null;
  let detector = null;
  let detectionFrame = null;
  let cameraAttempt = 0;
  const pinchingHands = new Set();

  const toolById = (id) => tools.find((tool) => tool.id === id);

  function model(tool, interactive = false) {
    return `<span class="model-wrap ${interactive ? "lesson-model" : ""}">
      <model-viewer src="${tool.model}" alt="Modelo 3D de ${tool.name}" ${interactive ? "camera-controls auto-rotate" : 'aria-hidden="true" tabindex="-1"'}></model-viewer>
      <span class="viewer-status">Cargando modelo 3D...</span>
    </span>`;
  }

  function watchModels() {
    for (const viewer of content.querySelectorAll("model-viewer")) {
      const status = viewer.parentElement.querySelector(".viewer-status");
      viewer.addEventListener("load", () => { status.hidden = true; }, { once: true });
      viewer.addEventListener("error", () => {
        status.hidden = false;
        status.textContent = "No se pudo cargar el modelo 3D.";
      });
      setTimeout(() => {
        if (viewer.isConnected && !customElements.get("model-viewer")) {
          status.textContent = "No se pudo cargar el visor 3D.";
        }
      }, 12000);
    }
  }

  function render() {
    gestures.cancel();
    selectedTool = null;
    feedback.textContent = "";
    cameraSlot.appendChild(cameraFrame);
    const state = game.state();
    cameraMoved.hidden = state.stage !== "cases";
    for (const item of document.querySelectorAll("[data-stage]")) {
      const active = item.dataset.stage === state.stage || (state.stage === "feedback" && item.dataset.stage === "cases");
      item.classList.toggle("active", active);
      if (active) item.setAttribute("aria-current", "step");
      else item.removeAttribute("aria-current");
    }

    if (state.stage === "intro") {
      content.innerHTML = `<div class="intro">
        <p class="eyebrow">BIENVENIDO AL LABORATORIO</p>
        <h2>Conoce las herramientas.<br>Pon a prueba tu criterio.</h2>
        <p>Un recorrido interactivo para identificar herramientas y relacionarlas con situaciones de mantenimiento de motores diésel.</p>
        <ul class="intro-list">
          <li><b>01</b> Conoce cuatro herramientas en 3D.</li>
          <li><b>02</b> Resuelve cuatro casos prácticos.</li>
          <li><b>03</b> Recibe tu resultado y una recomendación.</li>
        </ul>
        <button class="button" type="button" data-action="start" data-gesture>Comenzar entrenamiento →</button>
      </div>`;
    } else if (state.stage === "learning") {
      const tool = tools[state.lesson];
      content.innerHTML = `<div class="section-head"><div><p class="eyebrow">01 / CONOCE TUS HERRAMIENTAS</p><h2>Antes de empezar</h2><p>Explora cada herramienta y familiarízate con su nombre.</p></div><span class="counter">${state.lesson + 1} / ${tools.length}</span></div>
        <div class="lesson-layout">${model(tool, true)}
          <div class="lesson-copy"><p class="eyebrow">HERRAMIENTA ${String(state.lesson + 1).padStart(2, "0")}</p><h3>${tool.name}</h3><p>${tool.description}</p><p class="hint">Puedes girar el modelo con el ratón o con controles táctiles.</p></div>
        </div>
        <div class="actions">${state.lesson > 0 ? '<button class="button secondary" type="button" data-action="previous" data-gesture>← Anterior</button>' : ""}
        <button class="button" type="button" data-action="next" data-gesture>${state.lesson === tools.length - 1 ? "Comenzar casos →" : "Siguiente herramienta →"}</button></div>`;
    } else if (state.stage === "cases") {
      const scenario = scenarios[state.caseIndex];
      content.innerHTML = `<div class="section-head"><div><p class="eyebrow">02 / CASOS PRÁCTICOS</p><h2>Elige la herramienta</h2><p>${scenario.question}</p></div><span class="counter">${state.caseIndex + 1} / ${scenarios.length}</span></div>
        <p class="hint">Arrastra una herramienta y suéltala arriba; o selecciónala con clic o teclado y confirma.</p>
        <div class="case-board" id="case-board">
          <div class="case-camera-slot" id="case-camera-slot"></div>
          <div class="case-overlay">
            <button class="drop-zone" type="button" data-drop-zone data-gesture><strong>↑ Suelta aquí tu respuesta</strong><span>O selecciona una herramienta y confirma aquí</span></button>
            <div class="tool-grid">${tools.map((tool) => `<button class="tool-card" type="button" data-tool="${tool.id}" data-gesture aria-pressed="false">${model(tool)}<strong>${tool.name}</strong></button>`).join("")}</div>
          </div>
        </div>`;
      document.getElementById("case-camera-slot").appendChild(cameraFrame);
    } else if (state.stage === "feedback") {
      const answer = state.answers[state.answers.length - 1];
      const scenario = scenarios[state.answers.length - 1];
      content.innerHTML = `<div class="answer-feedback">
        <p class="eyebrow">02 / CASO ${state.answers.length} DE ${scenarios.length}</p>
        <div class="answer-result ${answer.correct ? "correct" : "incorrect"}" role="status" tabindex="-1">
          <span class="answer-icon" aria-hidden="true">${answer.correct ? "✓" : "×"}</span>
          <div><h2>${answer.correct ? "¡Respuesta correcta!" : "Respuesta incorrecta"}</h2>
          <p>${answer.correct ? "Identificaste la herramienta adecuada." : "Repasemos la herramienta adecuada para este caso."}</p></div>
        </div>
        <div class="answer-detail">
          <p><strong>Tu respuesta:</strong> ${toolById(answer.selected).name}</p>
          <p><strong>Respuesta correcta:</strong> ${toolById(scenario.answer).name}</p>
          <p>${scenario.explanation}</p>
        </div>
        <button class="button" type="button" data-action="next-case" data-gesture>${state.answers.length === scenarios.length ? "Ver evaluación →" : "Siguiente caso →"}</button>
      </div>`;
    } else {
      const result = game.result();
      content.innerHTML = `<div class="result">
        <p class="eyebrow">03 / EVALUACIÓN COMPLETADA</p><h2>Tu resultado</h2>
        <div class="result-score"><strong>${result.percent}%</strong><span>${result.score} de ${result.total} respuestas correctas</span></div>
        <p>${result.recommendation}</p>
        <ul class="review">${state.answers.map((answer, index) => {
          const scenario = scenarios[index];
          return `<li><strong>Caso ${index + 1} · ${answer.correct ? "Correcto" : "Por repasar"}</strong><p>Tu respuesta: ${toolById(answer.selected).name}. Respuesta esperada: ${toolById(scenario.answer).name}.</p><p>${scenario.explanation}</p></li>`;
        }).join("")}</ul>
        <button class="button" type="button" data-action="restart" data-gesture>Reiniciar entrenamiento ↻</button>
      </div>`;
    }
    watchModels();
    if (state.stage === "feedback") content.querySelector(".answer-result")?.focus({ preventScroll: true });
  }

  function selectTool(id) {
    selectedTool = id;
    feedback.textContent = "";
    for (const button of content.querySelectorAll("[data-tool]")) {
      const selected = button.dataset.tool === id;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    }
  }

  function submitTool(id) {
    if (!id) {
      feedback.textContent = "Selecciona primero una herramienta.";
      return;
    }
    if (game.answer(id)) render();
  }

  content.addEventListener("click", (event) => {
    const tool = event.target.closest("[data-tool]");
    if (tool) {
      selectTool(tool.dataset.tool);
      return;
    }
    const button = event.target.closest("[data-action], [data-drop-zone]");
    if (!button) return;
    if (button.hasAttribute("data-drop-zone")) return submitTool(selectedTool);
    switch (button.dataset.action) {
      case "start":
        game.start();
        render();
        initializeCamera();
        break;
      case "previous":
        game.previousLesson();
        render();
        break;
      case "next":
        game.nextLesson();
        render();
        break;
      case "next-case":
        game.nextCase();
        render();
        break;
      case "restart":
        game.reset();
        render();
        break;
    }
  });

  function screenPoint(hand) {
    const board = document.getElementById("case-board");
    if (board) {
      const rect = board.getBoundingClientRect();
      return { x: rect.left + hand.x * rect.width, y: rect.top + hand.y * rect.height };
    }
    return { x: hand.x * window.innerWidth, y: hand.y * window.innerHeight };
  }

  function targetAt(hand) {
    const point = screenPoint(hand);
    return document.elementFromPoint(point.x, point.y);
  }

  function positionDrag(hand) {
    const point = screenPoint(hand);
    dragGhost.style.left = `${point.x}px`;
    dragGhost.style.top = `${point.y}px`;
    const zone = content.querySelector("[data-drop-zone]");
    if (zone) zone.classList.toggle("over", !!targetAt(hand)?.closest("[data-drop-zone]"));
  }

  function clearDrag() {
    activeHand = null;
    dragGhost.hidden = true;
    dragGhost.innerHTML = "";
    draggedCard?.classList.toggle("dragging", false);
    draggedCard = null;
    content.querySelector("[data-drop-zone]")?.classList.remove("over");
  }

  const gestures = createGestureController({
    start(hand) {
      const element = targetAt(hand)?.closest("[data-gesture]");
      if (!element || !content.contains(element)) return null;
      activeHand = hand.handedness;
      if (element.dataset.tool) {
        const tool = toolById(element.dataset.tool);
        dragGhost.innerHTML = `<model-viewer src="${tool.model}" alt="" auto-rotate aria-hidden="true" tabindex="-1"></model-viewer><span>${tool.name}</span>`;
        dragGhost.hidden = false;
        draggedCard = element;
        element.classList.toggle("dragging", true);
        positionDrag(hand);
        return { type: "tool", id: element.dataset.tool };
      }
      return { type: "button", element };
    },
    move(token, hand) {
      if (token.type === "tool") positionDrag(hand);
    },
    release(token, hand) {
      const target = targetAt(hand);
      clearDrag();
      if (token.type === "tool") {
        if (target?.closest("[data-drop-zone]")) submitTool(token.id);
        else feedback.textContent = "Suelta la herramienta dentro de la zona de respuesta.";
      } else if (target?.closest("[data-gesture]") === token.element && token.element.isConnected) {
        token.element.click();
      }
    },
    cancel() { clearDrag(); },
  });

  function drawHands(hands) {
    if (!video.videoWidth || !video.videoHeight) return;
    if (overlay.width !== video.videoWidth || overlay.height !== video.videoHeight) {
      overlay.width = video.videoWidth;
      overlay.height = video.videoHeight;
    }
    const context = overlay.getContext("2d");
    context.clearRect(0, 0, overlay.width, overlay.height);
    for (const hand of hands) {
      context.fillStyle = hand.handedness === "Right" ? "#00ff96" : hand.handedness === "Left" ? "#ff5050" : "#ffffff";
      for (const point of hand.keypoints) {
        context.beginPath();
        context.arc(point.x, point.y, 5, 0, Math.PI * 2);
        context.fill();
      }
    }
  }

  function onHands(hands) {
    drawHands(hands);
    if (!video.videoWidth || !video.videoHeight) return;
    const points = hands.filter((hand) => (hand.handedness === "Left" || hand.handedness === "Right") && hand.keypoints[4] && hand.keypoints[8]).map((hand) => {
      const thumb = hand.keypoints[4];
      const index = hand.keypoints[8];
      const indexBase = hand.keypoints[5];
      const pinkyBase = hand.keypoints[17];
      const palmWidth = indexBase && pinkyBase ? Math.hypot(indexBase.x - pinkyBase.x, indexBase.y - pinkyBase.y) : 0;
      const closeThreshold = palmWidth > 0 ? palmWidth * 0.45 : video.videoWidth / 16;
      const threshold = pinchingHands.has(hand.handedness) ? closeThreshold * 1.4 : closeThreshold;
      const pinching = Math.hypot(thumb.x - index.x, thumb.y - index.y) < threshold;
      if (pinching) pinchingHands.add(hand.handedness);
      else pinchingHands.delete(hand.handedness);
      return {
        handedness: hand.handedness,
        x: Math.max(0, Math.min(0.999, (thumb.x + index.x) / 2 / video.videoWidth)),
        y: Math.max(0, Math.min(0.999, (thumb.y + index.y) / 2 / video.videoHeight)),
        pinching,
      };
    });
    for (const handedness of pinchingHands) {
      if (!points.some((point) => point.handedness === handedness)) pinchingHands.delete(handedness);
    }
    gestures.update(points);
    const hand = points.find((point) => point.handedness === activeHand) || points[0];
    if (!hand) {
      cursor.hidden = true;
      return;
    }
    const point = screenPoint(hand);
    cursor.hidden = false;
    cursor.style.left = `${point.x}px`;
    cursor.style.top = `${point.y}px`;
    cursor.classList.toggle("left", hand.handedness === "Left");
    cursor.classList.toggle("pinching", hand.pinching);
    if (hand.y < 0.06) window.scrollBy(0, -12);
    else if (hand.y > 0.94) window.scrollBy(0, 12);
  }

  function stopCamera() {
    cameraAttempt += 1;
    if (detectionFrame !== null) cancelAnimationFrame(detectionFrame);
    detectionFrame = null;
    detector = null;
    if (stream) stream.getTracks().forEach((track) => track.stop());
    stream = null;
    video.srcObject = null;
    cameraStarted = false;
    pinchingHands.clear();
    gestures.cancel();
    cursor.hidden = true;
    overlay.getContext("2d").clearRect(0, 0, overlay.width, overlay.height);
  }

  function cameraFailed(message, error) {
    stopCamera();
    cameraEmpty.hidden = false;
    cameraEmpty.textContent = "Cámara o detector no disponibles";
    cameraStatus.textContent = `${message} Puedes continuar con clic o teclado.`;
    retryCamera.hidden = false;
    console.error("No se pudo iniciar o mantener el control por gestos:", error);
  }

  async function detectHands(attempt) {
    try {
      if (attempt !== cameraAttempt) return;
      if (!video.videoWidth || !video.videoHeight) throw new Error("El video no tiene dimensiones disponibles.");
      if (detectionCanvas.width !== video.videoWidth || detectionCanvas.height !== video.videoHeight) {
        detectionCanvas.width = video.videoWidth;
        detectionCanvas.height = video.videoHeight;
      }
      detectionContext.drawImage(video, 0, 0, detectionCanvas.width, detectionCanvas.height);
      const hands = await detector.detect(detectionCanvas);
      if (attempt !== cameraAttempt) return;
      onHands(hands);
      if (cameraStatus.textContent !== "Control por gestos activo. Acerca el cursor al borde para desplazarte.") {
        cameraStatus.textContent = "Control por gestos activo. Acerca el cursor al borde para desplazarte.";
      }
      detectionFrame = requestAnimationFrame(() => {
        detectionFrame = null;
        detectHands(attempt);
      });
    } catch (error) {
      if (attempt === cameraAttempt) cameraFailed("No se pudo procesar el video.", error);
    }
  }

  async function initializeCamera() {
    if (cameraStarted) return;
    cameraStarted = true;
    const attempt = ++cameraAttempt;
    retryCamera.hidden = true;
    cameraStatus.textContent = "Solicitando acceso a la cámara...";
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("La cámara requiere un navegador compatible y una conexión segura.");
      if (typeof ml5 === "undefined") throw new Error("No se pudo cargar el detector de manos.");
      const newStream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
      if (attempt !== cameraAttempt) {
        newStream.getTracks().forEach((track) => track.stop());
        return;
      }
      stream = newStream;
      for (const track of stream.getVideoTracks()) {
        track.addEventListener("ended", () => {
          if (stream === newStream) cameraFailed("La cámara se desconectó.", new Error("La cámara se desconectó."));
        }, { once: true });
      }
      video.srcObject = stream;
      await video.play();
      if (attempt !== cameraAttempt) return;
      cameraEmpty.hidden = true;
      cameraStatus.textContent = "Cargando detector de manos...";
      const newDetector = await ml5.handPose({ flipped: true, maxHands: 2 });
      if (attempt !== cameraAttempt) return;
      detector = newDetector;
      detectHands(attempt);
    } catch (error) {
      if (attempt !== cameraAttempt) return;
      const message = error.name === "NotAllowedError" ? "Permiso de cámara denegado." :
        error.name === "NotFoundError" ? "No se encontró una cámara." :
        "No se pudo iniciar la cámara o el detector de manos.";
      cameraFailed(message, error);
    }
  }

  retryCamera.addEventListener("click", initializeCamera);
  window.addEventListener("pagehide", stopCamera);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) initializeCamera();
  });
  render();
  initializeCamera();
})();
