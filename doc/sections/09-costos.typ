#import "../styles.typ": muted, navy, pale-blue, paper

= Proyección de Costos
Para determinar los costos de nuestro proyecto realizamos una estimación financiera dividida en tres categorías: materiales, desarrollo de la plataforma digital y mano de obra. En los materiales utilizamos precios cotizados de los componentes electrónicos necesarios para fabricar el guante sensorial, obteniendo un costo de \$926.84 pesos con IVA incluido.

Para la plataforma digital estimamos los gastos de diseño, programación, integración, almacenamiento y pruebas, con un total de \$3,900 pesos.

Finalmente, calculamos la mano de obra considerando las horas necesarias para ensamblar (considerando el salario mínimo por hora), programar y probar el dispositivo, obteniendo \$1,457.06 pesos adicionales. De esta manera, estimamos una inversión de \$6,283.90 pesos para desarrollar nuestro primer prototipo.”

== Costos de Materiales del Guante Sensorial

La siguiente tabla presenta los materiales y componentes considerados para la fabricación del guante sensorial, junto con sus cantidades, precios unitarios e IVA. El costo estimado de los materiales es de \$926.84 pesos, con IVA incluido.
La #link(<cost-table>)[Tabla 1] concentra los montos:

#block[
  #set text(size: 8pt)
  #set table(inset: 1.5mm)
  #table(
    columns: (0.45fr, 2fr, 1.1fr, 0.75fr, 1.1fr, 0.95fr, 0.75fr, 1fr),
    align: (center, left, left, center, right, right, right, right),
    fill: (x, y) => if y == 0 { navy } else if y == 9 { pale-blue } else if calc.odd(y) { paper } else { none },
    table.header(
      text(fill: white, weight: "bold")[N°],
      text(fill: white, weight: "bold")[Concepto],
      text(fill: white, weight: "bold")[Tipo unidad],
      text(fill: white, weight: "bold")[Cantidad],
      text(fill: white, weight: "bold")[Precio por unidad],
      text(fill: white, weight: "bold")[Subtotal],
      text(fill: white, weight: "bold")[IVA],
      text(fill: white, weight: "bold")[Total],
    ),
    [1], [Proto board], [pieza], [1], [\$83.00], [\$83.00], [\$13.28], [\$96.28],
    [2], [IRFZ44N], [pieza], [5], [\$36.60], [\$183.00], [\$29.28], [\$212.28],
    [3], [Motores de vibración tipo moneda], [pieza], [5], [\$21.00], [\$105.00], [\$16.80], [\$121.80],
    [4], [Arduino uno R3], [pieza], [1], [\$163.00], [\$163.00], [\$26.08], [\$189.08],
    [5], [Sensores de distancia], [pieza], [2], [\$60.00], [\$120.00], [\$19.20], [\$139.20],
    [6], [Cables jumpers (Pq)], [paquete], [3], [\$35.00], [\$105.00], [\$16.80], [\$121.80],
    [7], [Cinchos], [pieza], [20], [\$1.00], [\$20.00], [\$3.20], [\$23.20],
    [8], [Guantes (opcional)], [paquete], [1], [\$20.00], [\$20.00], [\$3.20], [\$23.20],
    [], [], [], [], [], [], text(weight: "bold")[Total], text(weight: "bold")[\$926.84],
  )
  #label("cost-table")
]

#v(2mm)
#align(center)[#text(size: 8.5pt, fill: muted)[Tabla 1. Costos del guante háptico]]

== Costos de realización de la Plataforma

La siguiente tabla presenta el costo estimado de las actividades necesarias para desarrollar la plataforma digital, incluyendo el diseño, la programación, la integración, el almacenamiento y las pruebas.

#block[
  #set text(size: 8pt)
  #set table(inset: 1.5mm)
  #table(
    columns: (0.45fr, 1.7fr, 4fr, 1.2fr),
    align: (center, left, left, right),
    fill: (x, y) => if y == 0 { navy } else if y == 7 { pale-blue } else if calc.odd(y) { paper } else { none },
    table.header(
      text(fill: white, weight: "bold")[N°],
      text(fill: white, weight: "bold")[Actividad],
      text(fill: white, weight: "bold")[Tarea específica],
      text(fill: white, weight: "bold")[Costo estimado],
    ),
    [1], [Diseño de interfaz], [Diseño de las pantallas, botones, colores y distribución de información.], [\$500.00],
    [2], [Desarrollo de pantallas y módulos], [Elaboración de las secciones de capacitación y ejercicios.], [\$800.00],
    [3], [Programación de funciones], [Programación de las funciones para mostrar instrucciones y actividades.], [\$1,200.00],
    [4], [Integración con el guante], [Conexión entre los datos del guante y la plataforma.], [\$500.00],
    [5], [Base de datos], [Espacio para guardar resultados y avances de los técnicos.], [\$600.00],
    [6], [Pruebas y correcciones], [Revisión de errores y funcionamiento de la plataforma.], [\$300.00],
    text(weight: "bold")[7], text(weight: "bold")[TOTAL], [], text(weight: "bold")[\$3,900.00],
  )
  #label("platform-cost-table")
]

#v(2mm)
#align(center)[#text(size: 8.5pt, fill: muted)[Tabla 2. Costos de realización de la plataforma]]

== Costos de mano de obra

Para el cálculo de la mano de obra, se considera un salario mínimo de \$39.38 por hora.

#block[
  #set text(size: 8pt)
  #set table(inset: 1.5mm)
  #table(
    columns: (0.45fr, 2.8fr, 2fr, 1.2fr),
    align: (center, left, center, right),
    fill: (x, y) => if y == 0 { navy } else if y == 7 { pale-blue } else if calc.odd(y) { paper } else { none },
    table.header(
      text(fill: white, weight: "bold")[N°],
      text(fill: white, weight: "bold")[Actividad],
      text(fill: white, weight: "bold")[Horas trabajadas (salario mínimo por hora)],
      text(fill: white, weight: "bold")[Total],
    ),
    [1], [Ensamblaje del guante], [5], [\$196.90],
    [2], [Programación del Arduino], [5], [\$196.90],
    [3], [Instalación de sensores], [3], [\$118.14],
    [4], [Diseño y programación de plataforma], [15], [\$590.70],
    [5], [Integración del guante], [5], [\$196.90],
    [6], [Pruebas de funcionamiento], [4], [\$157.52],
    [], text(weight: "bold")[TOTAL], [], text(weight: "bold")[\$1,457.06],
  )
  #label("labor-cost-table")
]

#v(2mm)
#align(center)[#text(size: 8.5pt, fill: muted)[Tabla 3. Costos de mano de obra]]

== Resumen de Costos

La siguiente tabla resume los costos estimados para desarrollar el primer prototipo de HapticBus Trainer. Incluye los materiales del guante sensorial, la realización de la plataforma digital y la mano de obra, con una inversión total estimada de \$6,283.90 pesos.

#block[
  #set text(size: 8pt)
  #set table(inset: 1.5mm)
  #table(
    columns: (4fr, 1.5fr),
    align: (left, right),
    fill: (x, y) => if y == 0 { navy } else if y == 4 { pale-blue } else if calc.odd(y) { paper } else { none },
    table.header(
      text(fill: white, weight: "bold")[Concepto],
      text(fill: white, weight: "bold")[Costos],
    ),
    [Materiales del guante], [\$926.84],
    [Realización de plataforma digital], [\$3,900.00],
    [Mano de obra del guante y actividades no incluidas en la plataforma], [\$1,457.06],
    text(weight: "bold")[TOTAL], text(weight: "bold")[\$6,283.90],
  )
  #label("cost-summary-table")
]

#v(2mm)
#align(center)[#text(size: 8.5pt, fill: muted)[Tabla 4. Resumen de costos]]