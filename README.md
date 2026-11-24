# Entrenamiento de herramientas

Prototipo de aprendizaje para identificar cuatro herramientas y elegirlas en casos didácticos relacionados con motores diésel. El contenido es orientativo, no constituye una certificación ni un procedimiento oficial y requiere revisión técnica antes de usarse en capacitación real.

## Inicio

```sh
npm install
npm start
```

Abre `http://localhost:3000`. Para desarrollo con reinicio automático usa `npm run dev`. El puerto se puede cambiar mediante la variable `PORT`.

La aplicación solicita acceso a la cámara al abrirse. Para los gestos se necesita un navegador compatible y un contexto seguro (localhost o HTTPS). También requiere conexión a internet para cargar ml5 y sus modelos. Si no se puede utilizar la cámara, se puede completar el entrenamiento con clic o teclado.

## Controles y evaluación

El cursor sigue la pinza de la mano: junta y separa el pulgar y el índice sobre un botón para activarlo. En los casos, coloca la pinza sobre una herramienta (puedes cerrarla antes de llegar), arrástrala a la zona de respuesta y suéltala. Acerca el cursor al borde superior o inferior para desplazarte. Con clic o teclado, selecciona una herramienta y confirma en la zona de respuesta.

Hay un intento para cada uno de los cuatro casos. Después de cada respuesta se muestra si fue correcta y una explicación; puedes continuar con el siguiente caso mediante gestos, clic o teclado. La evaluación final muestra los aciertos y una recomendación orientativa; los resultados solo se mantienen durante la sesión actual.

Ejecuta las pruebas con `npm test`.
