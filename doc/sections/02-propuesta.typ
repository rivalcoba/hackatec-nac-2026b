= Descripción de la propuesta

*HapticBus Trainer* es una propuesta de capacitación para el personal especializado en el mantenimiento de autobuses Volvo. Integra un guante háptico con una plataforma digital de aprendizaje gamificado que busca fortalecer las habilidades necesarias para identificar fallas y reconocer componentes.

La propuesta busca reducir la brecha entre los conocimientos del personal de nuevo ingreso y las competencias esperadas por Volvo. Para ello, el sistema presentará  diferentes modos de usos:

1. Una vez registrado, el técnico realizará una evaluación de conocimientos previos. Después, tendrá acceso a una página de inicio donde podrá tomar cursos personalizados de acuerdo con sus conocimientos @test-window.

#figure(
  image("../assets/test-window.png",width: 145mm),
  caption: [Ventana de la aplicación *HapticBus Trainer* que muestra el tablero de control del usuario]
)<test-window>

2. La plataforma también contará con un apartado de aprendizaje mediante modelos 3D (@learn-window), en el que los técnicos podrán explorar las partes de un camión o de un motor a través de una interfaz digital y un guante háptico. Para visualizar y manipular las piezas, el usuario realizará gestos con las manos frente a una cámara web. Así podrá desarmar virtualmente el autobús o el motor y adquirir conocimientos sólidos sobre la composición de sus piezas.
#figure(
  image("../assets/learn-window.png",width: 145mm),
  caption: [Ventana de la aplicación *HapticBus Trainer* que muestra el modelo 3D de un camión]
)<learn-window>

3. La plataforma contará con un apartado de prácticas que presentará preguntas sobre fallas o incidencias (@lab-window). Mediante gestos frente a una cámara web, el usuario seleccionará una herramienta y la colocará en el espacio correspondiente para que el sistema evalúe su respuesta. Al seleccionar la herramienta, el guante háptico emitirá una señal que simulará la sensación de tocar el objeto digital.

#figure(
  image("../assets/lab-window.png", width: 145mm),
  caption: [Ventana de la aplicación *HapticBus Trainer* que muestra el laboratorio de prácticas]
)<lab-window>

4. Asimismo, el sistema incorporará un modelo de seguimiento del conocimiento (*Knowledge Tracing* @bravo2023) que estimará en tiempo real el grado de dominio de cada técnico sobre un concepto o habilidad, a partir de su historial de respuestas y actividades en la plataforma. Esta estimación ayudará a identificar áreas de oportunidad y a orientar la retroalimentación durante el aprendizaje.

El objetivo es complementar la capacitación tradicional con una experiencia práctica, interactiva y sensorial que facilite la identificación de fallas, el reconocimiento de componentes y el aprendizaje de procedimientos de mantenimiento.
