= Especificación técnica de la propuesta

== Características ténicas esperadas

Se desarrolló un prototipo funcional que integra una plataforma de capacitación tolerante a la alta latencia y un guante sensorial que proporciona retroalimentación mediante vibraciones. Esta estimulación háptica facilita el aprendizaje práctico de los técnicos.
El sistema comprende los siguientes componentes electrónicos:

1. *Guante sensorial:* fabricado con material flexible, ligero y practico para facilitar su uso durante las prácticas de capacitación.

2. *Microcontrolador:* encargado de recibir y procesar las señales enviadas desde la plataforma. 

3. *Motores de vibración:* integrados en el guante para generar una señal táctil cuando el técnico seleccione la respuesta correcta.

4. *Conectividad Bluetooth:* permitirá la comunicación inalámbrica entre el guante y la plataforma, sin necesidad de internet.

5. *Aplicación digital:* compatible con computadoras, tablets o dispositivos móviles, con una interfaz sencilla e intuitiva.

6. *Funcionamiento con conexiónes lentas:* almacenará localmente los casos prácticos, preguntas, respuestas y procedimientos técnicos.

7. *Simulación de fallas:* presentará escenarios prácticos y en 3D relacionados con motores Volvo 

8. *Evaluación del desempeño:* registrará aciertos, errores y avances de cada técnico para identificar sus áreas de oportunidad.

10. *Seguridad y normatividad:* considerará criterios de seguridad eléctrica, protección de datos y compatibilidad electromagnética


== Diagramas de diseño

La @haptic-glove muestra el diagrama electrónico del guante háptico el cual utiliza una etapa de pontecia para controlar los motores de vibración del guante, asegurando una respuesta háptica adecuada durante las prácticas de capacitación.

#figure(
	image(
		"../assets/haptic-glove.png",
		format: "png",
		width: 65%,
	),
	caption: [Esquema electronica del guante háptico.],
) <haptic-glove>