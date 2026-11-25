= Especificación técnica de la propuesta

== Características técnicas esperadas

Se desarrolló un prototipo funcional que integra una plataforma de capacitación tolerante a la alta latencia y un guante sensorial que proporciona retroalimentación mediante vibraciones. Esta estimulación háptica facilita el aprendizaje práctico de los técnicos.
El sistema comprende los siguientes componentes electrónicos:

+ *Guante sensorial:* fabricado con material flexible, ligero y practico para facilitar su uso durante las prácticas de capacitación.

+ *Microcontrolador:* encargado de recibir y procesar las señales enviadas desde la plataforma. 

+ *Motores de vibración:* integrados en el guante para generar una señal táctil cuando el técnico seleccione la respuesta correcta.

+ *Conectividad Bluetooth:* permitirá la comunicación inalámbrica entre el guante y la plataforma, sin necesidad de internet.

+ *Aplicación digital:* compatible con computadoras, tablets o dispositivos móviles, con una interfaz sencilla e intuitiva.

+ *Funcionamiento con conexiónes lentas:* almacenará localmente los casos prácticos, preguntas, respuestas y procedimientos técnicos.

+ *Simulación de fallas:* presentará escenarios prácticos y en 3D relacionados con motores Volvo 

+ *Evaluación del desempeño:* registrará aciertos, errores y avances de cada técnico para identificar sus áreas de oportunidad.

+ *Seguridad y normatividad:* considerará criterios de seguridad eléctrica, protección de datos y compatibilidad electromagnética


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