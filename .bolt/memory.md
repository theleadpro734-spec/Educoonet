# Project memory

## Product intent & audience

- Plataforma de postulaciones educativas para que postulantes puedan:
  - Consultar cupos disponibles al momento de postular.
  - Elegir el nivel que desean estudiar.
  - Editar o retirar una postulación de cupo pendiente.
- Las instituciones necesitan gestionar el ciclo de vida de sus postulaciones, incluyendo ocultar o eliminar postulaciones aceptadas y rechazadas.
- El sistema debe reflejar la disponibilidad real de cupos durante el proceso de postulación.

## Brand personality & voice

- Interfaz clara, confiable y orientada a completar trámites.
- Lenguaje directo y comprensible para postulantes e instituciones.
- Mantener el idioma y contexto principal en español.
- Las acciones administrativas deben comunicar claramente sus consecuencias.

## Visual design & UX direction

- El flujo de postulación debe mostrar disponibilidad y nivel antes de confirmar.
- Presentar cupos y niveles de forma fácilmente escaneable, sin obligar al usuario a inferir si quedan vacantes.
- Las instituciones deberían contar con listados separados o filtros para postulaciones activas, aceptadas, rechazadas y archivadas/eliminadas.
- Las acciones de archivar, borrar, aceptar y rechazar deben estar claramente asociadas a cada postulación; las acciones destructivas requieren confirmación.
- Diferenciar estados mediante texto y señales visuales accesibles, no solo mediante color.
- Mantener una experiencia responsive y usable en pantallas pequeñas.
- Preferir componentes consistentes para tarjetas/listados, filtros, estados vacíos, mensajes de error y diálogos de confirmación.
- Mostrar retroalimentación cuando una postulación reserva o libera un cupo, incluyendo errores por disponibilidad desactualizada.

## Decisions, constraints & rationale

- Proyecto basado en Vite + React.
- La base de datos ya registra el cupo seleccionado por postulación.
- La visibilidad de cupos para postulantes está restringida a instituciones publicadas.
- Las postulaciones pendientes pueden editarse o retirarse, según el estado reportado.
- Se solicita que las instituciones puedan quitar de sus listados las postulaciones rechazadas y aceptadas, mediante borrado o archivado, de forma equivalente para ambos estados.
- La disponibilidad debe disminuir al crear una postulación y aumentar cuando esa postulación sea rechazada; esto requiere una transición de estados consistente para evitar liberar o descontar dos veces el mismo cupo.
- La pantalla de postulación y el flujo de disponibilidad aún requieren revisión; no asumir que funcionan correctamente.
- El proyecto todavía no fue compilado ni probado de extremo a extremo tras los cambios reportados.
- Persisten hallazgos de seguridad relacionados con funciones de administración.
- Antes de ampliar funcionalidades, verificar compilación, permisos institucionales, disponibilidad por nivel/cupo y operaciones de edición, retiro, rechazo y archivado.

## Open questions & assumptions

- Confirmar si “borrar” debe ser eliminación permanente o archivado lógico; preferir archivado si se necesita auditoría o recuperación.
- Definir si las postulaciones aceptadas también liberan cupo al archivarse o eliminarse; archivar no debería alterar la disponibilidad por sí solo.
- Confirmar qué estados pueden modificar las instituciones y quién puede archivar o eliminar cada postulación.
- Confirmar qué ocurre con una postulación rechazada después de que el cupo fue reservado: debe liberarlo exactamente una vez.
- Verificar qué ocurre si el cupo se agota entre la visualización y la confirmación, y cómo se manejan operaciones concurrentes.
- Confirmar cómo se representa exactamente un cupo: por institución, nivel, curso u otra combinación.
- Confirmar si una edición de una postulación cambia el cupo reservado y cómo se compensa el cupo anterior.
- Revisar permisos para asegurar que una institución solo pueda gestionar postulaciones asociadas a ella y que un postulante solo pueda modificar o retirar las propias.
- Ejecutar compilación y pruebas del flujo completo antes de considerar terminado el cambio.