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
    columns: (2fr, 2.7fr, 1fr),
    align: (left, left, right),
    fill: (x, y) => if y == 0 { navy } else if y == 6 or y == 8 { pale-blue } else if calc.odd(y) { paper } else { none },
    table.header(
      text(fill: white, weight: "bold")[Bloque],
      text(fill: white, weight: "bold")[Alcance],
      text(fill: white, weight: "bold")[Monto (MXN)],
    ),
    [Inversión inicial], [Trámites, cochera, herramientas, piloto, inventario y empaque], [\$125,000],
    [Operación: 6 meses], [Odoo, Meta, infraestructura, servicios y soporte], [\$140,900],
    [Base], [Inversión inicial + operación], [\$265,900],
    [Contingencia], [10% para riesgos y pruebas], [\$26,590],
    text(weight: "bold")[Arranque lean], [Pago de fundadores diferido], text(weight: "bold")[\$292,490],
    [Escenario sostenible], [Lean + dos puestos y provisión patronal], [\$441,895],
  )
  #label("cost-table")
]

#v(2mm)
#align(center)[#text(size: 8.5pt, fill: muted)[Tabla 1. Resumen de costos del arranque lean.]]

== Control y decisión

Odoo integrará CRM, inventario, facturación y soporte; Meta captará prospectos. La pauta se liberará semanalmente y se medirán prospectos, conversión y margen. La producción crecerá solo con demanda validada. Precio mínimo: `costo directo / (1 − margen bruto objetivo)`.