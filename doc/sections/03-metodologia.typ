= Metodología de desarrollo

La metodología de desarrollo (@fig-metodologia-pianitech) se organiza en siete etapas secuenciales, desde la identificación de las necesidades de capacitación hasta la mejora continua de la solución. Este enfoque permite estructurar el diseño, la implementación y la evaluación del prototipo de manera progresiva: 

1. *Identificación de necesidades:* reconocer las dificultades que presentan los técnicos al identificar fallas y reconocer componentes de los motores Volvo.

2. *Diseño de casos prácticos:* elaborar una plataforma (escenarios) simulados con fallas de motor con diferentes opciones de componentes incorrectas y una correcta.

3. *Desarrollo de la plataforma:* crear una plataforma sencilla, sin conexión a internet, que almacene casos, procedimientos y evaluaciones de manera personalizada. 

4. *Integración sensorial:* conectar el guante con la plataforma para generar una vibración cuando el técnico seleccione la respuesta correcta.

5. *Implementación de gamificación:* incorporar puntos, niveles, desafíos, practicas e interacciones 3D para motivar el aprendizaje.

6. *Evaluación y retroalimentación:* medir los aciertos, errores y avances de cada técnico, proporcionando explicaciones que permitan reforzar sus conocimientos.

7. *Mejora continua:* actualizar los casos prácticos y procedimientos de acuerdo con los resultados obtenidos de cada técnico.

#import "@preview/fletcher:0.6.0" as fletcher: diagram, node, edge

#let color-principal = rgb("#4C6FAF")
#let color-borde = rgb("#D5DAE1")
#let color-texto = rgb("#22324D")
#let color-muted = rgb("#5B6678")
#let color-badge = rgb("#E8F0FE")
#let color-verde = rgb("#E6F4EA")
#let color-verde-texto = rgb("#1E6B3A")

#let etapas = (
  ([Identificación de necesidades], [Reconocer dificultades de los técnicos.]),
  ([Diseño de casos prácticos], [Crear escenarios simulados de fallas.]),
  ([Desarrollo de la plataforma], [Crear plataforma offline.]),
  ([Integración sensorial], [Conectar guante y vibración.]),
  ([Implementación de gamificación], [Puntos, niveles, desafíos y 3D.]),
  ([Evaluación y retroalimentación], [Medir aciertos, errores y avances.]),
  ([Mejora continua], [Actualizar casos y procedimientos.]),
)

#let tarjeta(n, titulo, descripcion) = {
  set par(justify: false, leading: 0.5em, spacing: 0pt)
  set align(center)
  box(
    circle(radius: 2.2mm, fill: color-badge, stroke: none)[
      #align(center + horizon)[
        #text(size: 6.5pt, weight: "bold", fill: color-principal)[#n]
      ]
    ],
  )
  v(1.5mm)
  block(
    width: 100%,
    height: 11mm,
    align(horizon + center)[
      #text(size: 5.6pt, weight: "bold", fill: color-texto, hyphenate: false)[#titulo]
    ],
  )
  line(length: 90%, stroke: 0.4pt + color-borde)
  v(1.5mm)
  block(
    width: 100%,
    height: 11mm,
    align(horizon + center)[
      #text(size: 5.8pt, fill: color-muted, hyphenate: false)[#descripcion]
    ],
  )
}

#let pildora(texto) = box(
  fill: color-verde,
  radius: 8pt,
  inset: (x: 2.5mm, y: 1.2mm),
  text(size: 6.5pt, weight: "bold", fill: color-verde-texto)[#texto],
)

#figure(
  supplement: [Figura],
  diagram(
    spacing: (1.8mm, 5mm),
    node-fill: white,
    node-stroke: 0.6pt + color-borde,
    node-corner-radius: 3pt,
    node-inset: 1.5mm,

    ..etapas
      .enumerate()
      .map(((i, (titulo, desc))) => node(
        (i, 0),
        tarjeta(i + 1, titulo, desc),
        width: 21mm,
        height: 33mm,
      )),

    node((0, 1), pildora[INICIO], fill: none, stroke: none, inset: 0pt),
    node((6, 1), pildora[FIN], fill: none, stroke: none, inset: 0pt),
    edge(
      (0, 1), (6, 1), "-|>",
      stroke: 0.6pt + color-muted,
      crossing-thickness: 0pt,
    ),
  ),
  caption: [
    Metodología incremental para el desarrollo y la validación de *HapticBus Trainer*.
  ],
) <fig-metodologia-pianitech>