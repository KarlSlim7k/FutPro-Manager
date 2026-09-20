# Guía de Contenido — Tutoriales por Rol

> Para redactores y agentes IA que generan seed. El contenido malo es peor que no tener tutorial.

## 1. Anatomía de un tutorial

- **Título** (≤60 car.): verbo + objeto + rol implícito. Ej. "Capturar resultado de un partido".
- **Summary** (1-2 líneas): qué logrará + dónde. Ej. "Registra marcador y estado desde Detalle → Resultado en <2 min."
- **Pasos** (4-8): cada paso = 1 acción verificable. Formato: título (≤50 car.) + body_md (50-120 palabras) + opcional 1 media.
- **FAQ** (3-5): preguntas reales de soporte, respuesta con ruta exacta. Formato `[{q, a}]`.
- **Tags**: `partidos`, `plantilla`, `arbitraje`, `liga`, `cuenta`… (allowlist, minúsculas, sin espacios).
- **related_route**: ruta real existente con placeholders `[slug]` (verificar con `app/**/page.tsx`).

## 2. Reglas de redacción (es-MX, imperativo)

1. Empieza cada paso con verbo: "Ve a…", "Pulsa…", "Confirma…".
2. Incluye ruta clicable exacta: "Partidos → Detalle → Resultado" + path técnico en `related_route`.
3. Menciona qué ve cada rol si difiere ("Como coach no verás Editar equipo").
4. 1 idea por paso; si hay "si… entonces…" → divídelo en 2 pasos.
5. Prohibido inventar botones/rutas. Si no existe en `app/`, no lo cites.
6. Markdown permitido: `**negrita**`, listas, `código/ruta`, enlaces internos. Prohibido: HTML crudo, iframes, scripts.

## 3. Media (gif/video)

| Caso | Formato | Spec |
|---|---|---|
| Loop ≤15s (clic, formulario corto) | `webp` o `gif` | ≤8MB, 720p max, sin audio |
| Demo >15s (flujo completo) | `mp4` H.264 | ≤8MB, 720p, `preload="metadata"`, con controles |
| Captura estática | `webp` | 1280px max |

- Nombre: `tutorials/<slug>/paso-<N>.webp|mp4`.
- Siempre `alt`: "Paso 3: formulario de resultado con marcador 2-1".
- Grabar en móvil (Modo Cancha) para tutoriales `referee`; desktop para `league_admin`/`super_admin`.
- Sin datos reales de usuarios (usar seed TercerTiempo).

## 4. Ejemplo de paso válido

```md
## Paso 3 — Registra el marcador
Ve a **Partidos → Detalle → Resultado** (`/dashboard/leagues/[slug]/matches/[matchId]/result`).
Captura **Goles local / Goles visita** y cambia **Estado → completed**. Pulsa **Guardar**.
Verás el marcador actualizado en el detalle y la tabla se recalcula sola.
```

FAQ válida: `{"q": "Guardé mal el marcador, ¿puedo corregirlo?", "a": "Sí. Vuelve a Detalle → Resultado y edítalo. Queda auditado como match.result_updated."}`
