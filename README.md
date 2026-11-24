# Manipulación de una esfera con la mano

La PC detecta la mano con la webcam, p5.js y ml5.js. Un servidor Node.js con Express sirve las páginas y retransmite la posición y el gesto por WebSocket a una escena A-Frame en el teléfono. No se envía video. Arduino no forma parte de este prototipo.

## Inicio

1. Instala Node.js (versión 18 o posterior) y ejecuta `npm install` y `npm start`.
2. Abre `http://localhost:3000/` para elegir una experiencia. En la PC, selecciona **Seguimiento en PC** y permite el uso de la cámara; la vista muestra el círculo y el estado de conexión.
3. Conecta el Android a la misma red. Averigua la IP local de la PC, por ejemplo con `hostname -I` en Linux, y abre `http://IP_DE_LA_PC:3000/vr` en Chrome. Si no conecta, revisa el firewall y que la red no aísle los dispositivos.
4. Coloca la mano delante de la webcam. En la escena, mueve el indicador verde sobre la esfera y junta el pulgar y el índice para tomarla. Mantenlos juntos para moverla y sepáralos para soltarla. Si pierdes la mano o la conexión, la esfera permanece en su última posición.

La esfera se mueve en un plano fijo; la webcam no proporciona profundidad real ni una correspondencia espacial automática entre la mano y el visor. Ajusta la posición de la mano mirando el indicador. Solo se permite una página de seguimiento conectada a la vez; cierra otras pestañas de seguimiento si la PC no conecta. Se necesita internet para cargar las bibliotecas desde sus CDN.

## HTTPS y Cardboard

Para una prueba de VR en el teléfono, usa HTTPS con un certificado válido y confiable para su dirección. La cámara en la PC funciona en `localhost` por HTTP, pero una dirección IP LAN por HTTP no es un contexto seguro; las funciones de VR y sensores también pueden requerir HTTPS. Tanto PC como teléfono deben poder confiar en el certificado.

El servidor admite TLS con dos variables de entorno:

```sh
TLS_KEY=/ruta/clave.pem TLS_CERT=/ruta/certificado.pem npm start
```

Abre `https://localhost:3000/` en la PC y `https://IP_DE_LA_PC:3000/vr` en el teléfono. En la página de inicio, selecciona **Seguimiento en PC** en la computadora. El certificado debe incluir `localhost` y la IP de la PC en sus nombres alternativos. Una CA local de desarrollo, como [mkcert](https://github.com/FiloSottile/mkcert), puede generar el certificado; instala y confía su certificado raíz en ambos dispositivos siguiendo las instrucciones de la herramienta y del teléfono. No compartas la clave privada de la CA. Si se usa un nombre DNS con certificado confiable, abre ese nombre en lugar de la IP y asegúrate de que resuelva a la PC.

Usa el botón VR de A-Frame y comprueba la vista estereoscópica y la orientación con tu teléfono dentro del Cardboard. El botón no garantiza que una combinación de Android y Chrome permita VR inmersiva; si no es compatible, utiliza la vista 3D normal y evalúa otra solución de visualización. La experiencia no proporciona seguimiento posicional de la cabeza.

El servidor está pensado para una red local confiable: no tiene autenticación. No lo expongas a internet ni lo uses en una red no confiable.

## Pruebas

Ejecuta `npm test` para verificar la interacción y la retransmisión. La cámara, la latencia, el visor y los sensores del teléfono requieren una prueba manual con los dispositivos.
