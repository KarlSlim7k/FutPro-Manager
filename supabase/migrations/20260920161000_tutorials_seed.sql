-- ============================================================
-- Seed inicial: 12 Tutoriales por Rol de FutPro Manager
-- Basados en docs/user-guide/*.md y rutas reales de app/
-- ============================================================

do $$
declare
  v_id uuid;
begin

  -- ------------------------------------------------------------
  -- 1. league_admin: liga-crear-temporada
  -- ------------------------------------------------------------
  insert into public.tutorials (slug, title, summary, target_roles, tags, estimated_minutes, sort_order, is_published, related_route, faq)
  values (
    'liga-crear-temporada',
    'Crear temporada y fixture de la liga',
    'Configura una nueva temporada oficial y organiza las jornadas de juego de tu liga.',
    array['league_admin'],
    array['liga', 'temporadas', 'partidos'],
    6,
    10,
    true,
    '/dashboard/leagues/[slug]/seasons',
    '[
      {"q": "¿Puedo tener más de una temporada activa a la vez?", "a": "Sí, el sistema permite múltiples temporadas, pero la tabla de posiciones y estadísticas se calculan de manera independiente por cada temporada."},
      {"q": "¿Qué ocurre si cambio las fechas de inicio o término?", "a": "Las fechas delimitan el periodo oficial de la temporada. Los partidos conservan su programación individual y no se cancelan al cambiar fechas."},
      {"q": "¿Quién puede crear temporadas?", "a": "Solo los usuarios con rol league_admin en la liga o super_admin de la plataforma."}
    ]'::jsonb
  )
  on conflict (slug) do update set
    title = excluded.title,
    summary = excluded.summary,
    target_roles = excluded.target_roles,
    tags = excluded.tags,
    estimated_minutes = excluded.estimated_minutes,
    sort_order = excluded.sort_order,
    is_published = excluded.is_published,
    related_route = excluded.related_route,
    faq = excluded.faq
  returning id into v_id;

  delete from public.tutorial_steps where tutorial_id = v_id;

  insert into public.tutorial_steps (tutorial_id, step_order, title, body_md) values
  (
    v_id,
    0,
    'Accede al módulo de Temporadas',
    'En el panel de tu liga (`/dashboard/leagues/[slug]`), pulsa en el menú lateral o superior en **Temporadas** (`/dashboard/leagues/[slug]/seasons`). Verás el listado de torneos registrados con su estatus actual.'
  ),
  (
    v_id,
    1,
    'Crea la nueva temporada',
    'Pulsa el botón **Nueva temporada**. Captura el nombre oficial (por ejemplo: "Torneo Apertura 2026"), define la fecha de inicio y la fecha de finalización del certamen. Confirma la creación.'
  ),
  (
    v_id,
    2,
    'Configura los equipos participantes',
    'Dirígete a la sección de equipos inscritos dentro de la temporada. Asegúrate de que los clubes ya estén registrados en la liga (`/dashboard/leagues/[slug]/teams`) para poder asociarlos a esta edición.'
  ),
  (
    v_id,
    3,
    'Programa las jornadas y partidos',
    'Entra a **Partidos** (`/dashboard/leagues/[slug]/matches`) y genera los encuentros: selecciona equipo local, equipo visitante, fecha, hora, sede y asigna la temporada creada.'
  ),
  (
    v_id,
    4,
    'Activa la temporada',
    'Una vez que el calendario inicial esté listo, cambia el estatus de la temporada a `active`. La temporada quedará disponible para captura de resultados y visible en el portal público.'
  );


  -- ------------------------------------------------------------
  -- 2. league_admin: liga-asignar-arbitro
  -- ------------------------------------------------------------
  insert into public.tutorials (slug, title, summary, target_roles, tags, estimated_minutes, sort_order, is_published, related_route, faq)
  values (
    'liga-asignar-arbitro',
    'Asignar cuerpo arbitral a un partido',
    'Designa árbitro central, asistentes y cuarto oficial con validación de disponibilidad.',
    array['league_admin'],
    array['partidos', 'arbitraje', 'liga'],
    4,
    20,
    true,
    '/dashboard/leagues/[slug]/matches/[matchId]',
    '[
      {"q": "¿A quiénes puedo asignar como árbitros?", "a": "Solo a usuarios registrados como miembros de la liga con rol referee o league_admin."},
      {"q": "¿Qué significa la alerta de disponibilidad?", "a": "Si el árbitro reportó en su calendario que no está disponible para esa fecha u horario, el sistema muestra una advertencia preventiva para evitar cruces."},
      {"q": "¿El árbitro recibe una notificación?", "a": "Sí. Al guardar la designación se dispara un aviso automático a la campana del panel del árbitro con enlace directo al encuentro."}
    ]'::jsonb
  )
  on conflict (slug) do update set
    title = excluded.title,
    summary = excluded.summary,
    target_roles = excluded.target_roles,
    tags = excluded.tags,
    estimated_minutes = excluded.estimated_minutes,
    sort_order = excluded.sort_order,
    is_published = excluded.is_published,
    related_route = excluded.related_route,
    faq = excluded.faq
  returning id into v_id;

  delete from public.tutorial_steps where tutorial_id = v_id;

  insert into public.tutorial_steps (tutorial_id, step_order, title, body_md) values
  (
    v_id,
    0,
    'Entra al detalle del partido',
    'Ve a **Partidos** (`/dashboard/leagues/[slug]/matches`) y pulsa sobre el partido que deseas coordinar para abrir su vista de detalle (`/dashboard/leagues/[slug]/matches/[matchId]`).'
  ),
  (
    v_id,
    1,
    'Ubica el bloque de Designación Arbitral',
    'En el panel derecho o sección inferior del detalle encontrarás el formulario de asignación de oficiales (`RefereeAssignmentForm`).'
  ),
  (
    v_id,
    2,
    'Selecciona los integrantes de la terna',
    'Despliega los selectores para designar: **Árbitro central**, **Primer asistente**, **Segundo asistente** y **Cuarto oficial**. Puedes designar únicamente central o la terna completa según la categoría.'
  ),
  (
    v_id,
    3,
    'Revisa alertas de disponibilidad y guarda',
    'Si algún árbitro tiene fecha marcada como no disponible, revisa las notas de advertencia. Pulsa **Guardar designación**. La asignación queda auditada y notificada.'
  );


  -- ------------------------------------------------------------
  -- 3. league_admin: liga-recalcular-standings
  -- ------------------------------------------------------------
  insert into public.tutorials (slug, title, summary, target_roles, tags, estimated_minutes, sort_order, is_published, related_route, faq)
  values (
    'liga-recalcular-standings',
    'Recalcular tabla de posiciones',
    'Aplica recálculo manual de puntos y estadísticas tras ajustes administrativos.',
    array['league_admin'],
    array['standings', 'liga', 'resultados'],
    3,
    30,
    true,
    '/dashboard/leagues/[slug]/standings',
    '[
      {"q": "¿Cuándo se calcula automáticamente la tabla?", "a": "Cada vez que un árbitro o administrador marca un partido con estado completed, la tabla se recalcula en segundo plano."},
      {"q": "¿Cuándo debo usar el recálculo manual?", "a": "Úsalo si hiciste ajustes retroactivos de marcadores, resolución de protestas disciplinarias o importación masiva de partidos."},
      {"q": "¿Dónde veo si el recálculo funcionó?", "a": "En la misma pantalla verás el historial con los últimos 10 recálculos, fecha, usuario responsable y filas procesadas."}
    ]'::jsonb
  )
  on conflict (slug) do update set
    title = excluded.title,
    summary = excluded.summary,
    target_roles = excluded.target_roles,
    tags = excluded.tags,
    estimated_minutes = excluded.estimated_minutes,
    sort_order = excluded.sort_order,
    is_published = excluded.is_published,
    related_route = excluded.related_route,
    faq = excluded.faq
  returning id into v_id;

  delete from public.tutorial_steps where tutorial_id = v_id;

  insert into public.tutorial_steps (tutorial_id, step_order, title, body_md) values
  (
    v_id,
    0,
    'Ve a la vista de Posiciones',
    'Ingresa a **Posiciones** en el menú de la liga (`/dashboard/leagues/[slug]/standings`) o desde la temporada activa.'
  ),
  (
    v_id,
    1,
    'Verifica la temporada seleccionada',
    'Usa el selector superior para verificar que estás consultando la temporada que requiere actualización de estadísticas.'
  ),
  (
    v_id,
    2,
    'Ejecuta el recálculo',
    'Pulsa el botón **Recalcular tabla**. El sistema procesará todos los partidos finalizados sumando puntos, goles a favor, en contra y diferencia.'
  ),
  (
    v_id,
    3,
    'Confirma los resultados y el historial',
    'Verifica que las posiciones reflejen el nuevo balance. Revisa abajo el registro del historial de recálculos que avala la operación.'
  );


  -- ------------------------------------------------------------
  -- 4. team_admin: equipo-gestionar-roster
  -- ------------------------------------------------------------
  insert into public.tutorials (slug, title, summary, target_roles, tags, estimated_minutes, sort_order, is_published, related_route, faq)
  values (
    'equipo-gestionar-roster',
    'Inscribir y gestionar plantilla de jugadores',
    'Inscribe jugadores a la temporada activa, asigna dorsales y administra su estatus.',
    array['team_admin'],
    array['equipos', 'plantilla'],
    5,
    40,
    true,
    '/dashboard/leagues/[slug]/teams/[teamSlug]/roster',
    '[
      {"q": "¿Puedo repetir número de dorsal en el mismo equipo?", "a": "No. El dorsal debe ser único por jugador dentro de la misma temporada."},
      {"q": "¿Qué significa el estatus suspended?", "a": "Indica sanción disciplinaria; el jugador permanece en el club pero no puede ser convocado a partidos."},
      {"q": "¿Cómo doy de baja a un jugador?", "a": "Desde la misma tabla de plantilla puedes cambiar su estatus a inactive o released."}
    ]'::jsonb
  )
  on conflict (slug) do update set
    title = excluded.title,
    summary = excluded.summary,
    target_roles = excluded.target_roles,
    tags = excluded.tags,
    estimated_minutes = excluded.estimated_minutes,
    sort_order = excluded.sort_order,
    is_published = excluded.is_published,
    related_route = excluded.related_route,
    faq = excluded.faq
  returning id into v_id;

  delete from public.tutorial_steps where tutorial_id = v_id;

  insert into public.tutorial_steps (tutorial_id, step_order, title, body_md) values
  (
    v_id,
    0,
    'Ingresa al módulo Plantilla de tu club',
    'En el panel de tu equipo entra a **Plantilla** (`/dashboard/leagues/[slug]/teams/[teamSlug]/roster`). Selecciona la temporada en curso.'
  ),
  (
    v_id,
    1,
    'Inscribe un nuevo jugador',
    'Pulsa **Inscribir jugador**. Busca por nombre en el padrón de jugadores registrados de la liga o agrega uno nuevo si cuentas con permisos.'
  ),
  (
    v_id,
    2,
    'Asigna número de dorsal y posición',
    'Define el número de camiseta oficial (1 al 99) y la posición principal en el campo. Verifica que el dorsal no esté ya asignado.'
  ),
  (
    v_id,
    3,
    'Establece el estatus inicial',
    'Marca el estatus como `active` para que el jugador sea elegible inmediatamente en convocatorias.'
  ),
  (
    v_id,
    4,
    'Guarda el registro',
    'Pulsa **Inscribir**. El jugador aparecerá en la nómina oficial del club y quedará visible en el portal público de la liga.'
  );


  -- ------------------------------------------------------------
  -- 5. team_admin: equipo-gestionar-staff
  -- ------------------------------------------------------------
  insert into public.tutorials (slug, title, summary, target_roles, tags, estimated_minutes, sort_order, is_published, related_route, faq)
  values (
    'equipo-gestionar-staff',
    'Administrar cuerpo técnico del club',
    'Agrega, cambia roles o remueve integrantes del staff técnico de tu equipo.',
    array['team_admin'],
    array['equipos', 'general'],
    4,
    50,
    true,
    '/dashboard/leagues/[slug]/teams/[teamSlug]/staff',
    '[
      {"q": "¿Puedo quedarme sin administradores de equipo?", "a": "No. Por seguridad, el sistema bloquea remover al último team_admin del club."},
      {"q": "¿Qué diferencia hay entre team_admin y coach?", "a": "El team_admin gestiona datos institucionales, escudo y staff; el coach se enfoca en convocatorias, alineaciones y eventos deportivos."},
      {"q": "¿Cómo agrego a alguien que no está en la lista?", "a": "El usuario debe registrarse previamente en la plataforma y unirse como miembro de la liga."}
    ]'::jsonb
  )
  on conflict (slug) do update set
    title = excluded.title,
    summary = excluded.summary,
    target_roles = excluded.target_roles,
    tags = excluded.tags,
    estimated_minutes = excluded.estimated_minutes,
    sort_order = excluded.sort_order,
    is_published = excluded.is_published,
    related_route = excluded.related_route,
    faq = excluded.faq
  returning id into v_id;

  delete from public.tutorial_steps where tutorial_id = v_id;

  insert into public.tutorial_steps (tutorial_id, step_order, title, body_md) values
  (
    v_id,
    0,
    'Ve a la página de Staff',
    'Desde el panel de tu equipo selecciona la opción **Staff** (`/dashboard/leagues/[slug]/teams/[teamSlug]/staff`).'
  ),
  (
    v_id,
    1,
    'Agrega un nuevo integrante',
    'Pulsa el botón **Agregar miembro**. Selecciona al usuario de la lista de miembros de la liga disponibles.'
  ),
  (
    v_id,
    2,
    'Asigna el rol correspondiente',
    'Selecciona el rol: `coach` (cuerpo técnico / entrenador) o `team_admin` (co-administrador del equipo).'
  ),
  (
    v_id,
    3,
    'Confirma la incorporación',
    'Pulsa **Guardar**. El nuevo miembro tendrá acceso inmediato a las secciones autorizadas de tu equipo en su propio panel.'
  );


  -- ------------------------------------------------------------
  -- 6. coach: coach-registrar-evento
  -- ------------------------------------------------------------
  insert into public.tutorials (slug, title, summary, target_roles, tags, estimated_minutes, sort_order, is_published, related_route, faq)
  values (
    'coach-registrar-evento',
    'Registrar gol o tarjeta en partido',
    'Captura incidencias deportivas de tu equipo en tiempo real durante el encuentro.',
    array['coach'],
    array['partidos', 'resultados'],
    4,
    60,
    true,
    '/dashboard/leagues/[slug]/matches/[matchId]/events',
    '[
      {"q": "¿Puedo registrar eventos para el equipo rival?", "a": "No. Como coach o staff de equipo solo tienes permisos para reportar incidencias de tus propios jugadores."},
      {"q": "¿Qué tipos de eventos están disponibles?", "a": "Gol, autogol, tarjeta amarilla, tarjeta roja, sustitución y penal."},
      {"q": "¿Puedo eliminar un evento si me equivoqué?", "a": "Sí. Puedes eliminar incidencias erróneas desde la lista de eventos del partido con confirmación."}
    ]'::jsonb
  )
  on conflict (slug) do update set
    title = excluded.title,
    summary = excluded.summary,
    target_roles = excluded.target_roles,
    tags = excluded.tags,
    estimated_minutes = excluded.estimated_minutes,
    sort_order = excluded.sort_order,
    is_published = excluded.is_published,
    related_route = excluded.related_route,
    faq = excluded.faq
  returning id into v_id;

  delete from public.tutorial_steps where tutorial_id = v_id;

  insert into public.tutorial_steps (tutorial_id, step_order, title, body_md) values
  (
    v_id,
    0,
    'Abre el partido en curso',
    'Ve a **Partidos** (`/dashboard/leagues/[slug]/matches`), ubica el encuentro de tu equipo y entra a **Eventos** (`/dashboard/leagues/[slug]/matches/[matchId]/events`).'
  ),
  (
    v_id,
    1,
    'Selecciona el tipo de incidencia',
    'Pulsa el botón de la acción correspondiente: Gol ⚽, Tarjeta Amarilla 🟨, Tarjeta Roja 🟥, Sustitución 🔄 o Penal 🎯.'
  ),
  (
    v_id,
    2,
    'Elige el minuto y jugador',
    'Indica el minuto reglamentario del partido y selecciona al jugador activo en cancha de tu plantilla.'
  ),
  (
    v_id,
    3,
    'Guarda el evento',
    'Pulsa **Registrar evento**. La incidencia aparecerá de inmediato en la línea de tiempo del partido y en el portal público.'
  );


  -- ------------------------------------------------------------
  -- 7. coach: coach-convocar-plantilla
  -- ------------------------------------------------------------
  insert into public.tutorials (slug, title, summary, target_roles, tags, estimated_minutes, sort_order, is_published, related_route, faq)
  values (
    'coach-convocar-plantilla',
    'Armar convocatoria de partido (Callups)',
    'Selecciona los jugadores habilitados que disputarán la jornada deportiva.',
    array['coach'],
    array['plantilla', 'partidos'],
    4,
    70,
    true,
    '/dashboard/leagues/[slug]/teams/[teamSlug]/callups',
    '[
      {"q": "¿Aparecen los jugadores suspendidos en la convocatoria?", "a": "Los jugadores suspendidos por acumulación o tarjeta roja se muestran marcados como no elegibles para evitar alineaciones indebidas."},
      {"q": "¿Hasta cuándo puedo enviar la convocatoria?", "a": "Antes del inicio del partido, para que el árbitro pueda verificarla en su cédula oficial."},
      {"q": "¿El árbitro ve esta lista en la cédula?", "a": "Sí. Las convocatorias confirmadas alimentan automáticamente la sección de alineaciones de la cédula arbitral."}
    ]'::jsonb
  )
  on conflict (slug) do update set
    title = excluded.title,
    summary = excluded.summary,
    target_roles = excluded.target_roles,
    tags = excluded.tags,
    estimated_minutes = excluded.estimated_minutes,
    sort_order = excluded.sort_order,
    is_published = excluded.is_published,
    related_route = excluded.related_route,
    faq = excluded.faq
  returning id into v_id;

  delete from public.tutorial_steps where tutorial_id = v_id;

  insert into public.tutorial_steps (tutorial_id, step_order, title, body_md) values
  (
    v_id,
    0,
    'Ingresa al gestor de Convocatorias',
    'En el menú de tu equipo accede a **Convocatorias** (`/dashboard/leagues/[slug]/teams/[teamSlug]/callups`).'
  ),
  (
    v_id,
    1,
    'Selecciona el partido programado',
    'Elige el partido de la jornada en el menú desplegable superior.'
  ),
  (
    v_id,
    2,
    'Marca a los jugadores convocados',
    'Selecciona la casilla de cada jugador que asistirá al encuentro. Asigna la condición de titular o suplente.'
  ),
  (
    v_id,
    3,
    'Guarda la convocatoria',
    'Pulsa **Confirmar convocatoria**. La lista quedará sincronizada para la revisión arbitral previa al silbatazo inicial.'
  );


  -- ------------------------------------------------------------
  -- 8. referee: arbitro-capturar-resultado
  -- ------------------------------------------------------------
  insert into public.tutorials (slug, title, summary, target_roles, tags, estimated_minutes, sort_order, is_published, related_route, faq)
  values (
    'arbitro-capturar-resultado',
    'Capturar marcador final de un partido',
    'Registra los goles y finaliza el encuentro oficializando el resultado deportivo.',
    array['referee'],
    array['arbitraje', 'partidos', 'resultados'],
    4,
    80,
    true,
    '/dashboard/leagues/[slug]/matches/[matchId]/result',
    '[
      {"q": "¿Puedo corregir el marcador si me equivoqué?", "a": "Sí. Puedes reingresar a Resultado y ajustar los goles. Toda modificación queda auditada con tu usuario y fecha."},
      {"q": "¿Puedo cambiar la hora o fecha del partido?", "a": "No. Por diseño, los árbitros solo pueden modificar marcador y estado deportivo, nunca la programación del fixture."},
      {"q": "¿Al guardar como finalizado se actualiza la tabla?", "a": "Sí, el estado completed dispara el recálculo automático de la tabla de posiciones."}
    ]'::jsonb
  )
  on conflict (slug) do update set
    title = excluded.title,
    summary = excluded.summary,
    target_roles = excluded.target_roles,
    tags = excluded.tags,
    estimated_minutes = excluded.estimated_minutes,
    sort_order = excluded.sort_order,
    is_published = excluded.is_published,
    related_route = excluded.related_route,
    faq = excluded.faq
  returning id into v_id;

  delete from public.tutorial_steps where tutorial_id = v_id;

  insert into public.tutorial_steps (tutorial_id, step_order, title, body_md) values
  (
    v_id,
    0,
    'Ubica el partido en Mis Partidos',
    'En tu panel de control entra a **Mis partidos** (`/dashboard/matches?myMatches=1`) o al calendario de la liga.'
  ),
  (
    v_id,
    1,
    'Abre el formulario de Resultado',
    'Pulsa en el botón **Resultado** (`/dashboard/leagues/[slug]/matches/[matchId]/result`).'
  ),
  (
    v_id,
    2,
    'Captura los goles con steppers táctiles',
    'Usa los botones grandes `+` y `-` para sumar los goles del equipo local y del equipo visitante sin usar el teclado.'
  ),
  (
    v_id,
    3,
    'Define el estado del partido',
    'Selecciona `live` si el partido está en juego, o `completed` si el árbitro pitó el final del tiempo reglamentario.'
  ),
  (
    v_id,
    4,
    'Guarda el marcador oficial',
    'Pulsa **Guardar resultado**. El marcador oficial queda registrado, la tabla se recalcula y el acta queda cerrada.'
  );


  -- ------------------------------------------------------------
  -- 9. referee: arbitro-emitir-cedula
  -- ------------------------------------------------------------
  insert into public.tutorials (slug, title, summary, target_roles, tags, estimated_minutes, sort_order, is_published, related_route, faq)
  values (
    'arbitro-emitir-cedula',
    'Emitir cédula arbitral oficial',
    'Revisa alineaciones, incidencias disciplinarias y genera el acta formal del juego.',
    array['referee'],
    array['arbitraje', 'cedula', 'partidos'],
    5,
    90,
    true,
    '/dashboard/leagues/[slug]/matches/[matchId]/cedula',
    '[
      {"q": "¿Puedo imprimir la cédula directamente?", "a": "Sí. La vista cuenta con estilos optimizados para impresión en papel estándar o descarga en PDF."},
      {"q": "¿Cómo firman los capitanes o delegados?", "a": "Al pie del documento digital o impreso existen líneas de firma dedicadas para el cuerpo arbitral y los capitanes."},
      {"q": "¿Qué pasa si falta capturar un gol o tarjeta antes de emitir la cédula?", "a": "Ve primero a la pestaña de Eventos, registra la incidencia pendiente y regresa a Cédula; los datos se actualizarán automáticamente."}
    ]'::jsonb
  )
  on conflict (slug) do update set
    title = excluded.title,
    summary = excluded.summary,
    target_roles = excluded.target_roles,
    tags = excluded.tags,
    estimated_minutes = excluded.estimated_minutes,
    sort_order = excluded.sort_order,
    is_published = excluded.is_published,
    related_route = excluded.related_route,
    faq = excluded.faq
  returning id into v_id;

  delete from public.tutorial_steps where tutorial_id = v_id;

  insert into public.tutorial_steps (tutorial_id, step_order, title, body_md) values
  (
    v_id,
    0,
    'Accede a la Cédula del encuentro',
    'Desde el detalle del partido o tu lista de asignaciones pulsa en **Cédula** (`/dashboard/leagues/[slug]/matches/[matchId]/cedula`).'
  ),
  (
    v_id,
    1,
    'Revisa el resumen y datos del cotejo',
    'Verifica la fecha, hora, sede, terna arbitral y el marcador final asentado.'
  ),
  (
    v_id,
    2,
    'Navega por las pestañas táctiles en celular',
    'Si estás en tu teléfono, utiliza las pestañas `Resumen`, `Alineaciones`, `Eventos` y `Firmas` para revisar cada apartado con claridad.'
  ),
  (
    v_id,
    3,
    'Valida alineaciones y disciplinario',
    'Comprueba los dorsales de los jugadores participantes y el reporte cronológico de tarjetas amarillas y rojas.'
  ),
  (
    v_id,
    4,
    'Genera el documento final',
    'Usa el botón de imprimir o compartir para oficializar el acta ante la mesa directiva de la liga.'
  );


  -- ------------------------------------------------------------
  -- 10. referee: arbitro-modo-cancha
  -- ------------------------------------------------------------
  insert into public.tutorials (slug, title, summary, target_roles, tags, estimated_minutes, sort_order, is_published, related_route, faq)
  values (
    'arbitro-modo-cancha',
    'Operar en Modo Cancha desde el celular',
    'Aprovecha la interfaz móvil y botones táctiles amplios durante el partido.',
    array['referee'],
    array['arbitraje', 'partidos'],
    4,
    100,
    true,
    '/dashboard/matches',
    '[
      {"q": "¿Puedo instalar la app en mi teléfono?", "a": "Sí. Ábrela en Safari (iOS) o Chrome (Android) y selecciona Añadir a pantalla de inicio para usarla como PWA en pantalla completa."},
      {"q": "¿Qué pasa si pierdo conexión momentáneamente en la cancha?", "a": "La app mantiene la navegación básica en memoria; al recuperar señal guarda los cambios pendientes en el servidor."},
      {"q": "¿Dónde veo mis partidos del día?", "a": "En /dashboard/matches con la pestaña Mis partidos activada verás solo tus asignaciones ordenadas por horario."}
    ]'::jsonb
  )
  on conflict (slug) do update set
    title = excluded.title,
    summary = excluded.summary,
    target_roles = excluded.target_roles,
    tags = excluded.tags,
    estimated_minutes = excluded.estimated_minutes,
    sort_order = excluded.sort_order,
    is_published = excluded.is_published,
    related_route = excluded.related_route,
    faq = excluded.faq
  returning id into v_id;

  delete from public.tutorial_steps where tutorial_id = v_id;

  insert into public.tutorial_steps (tutorial_id, step_order, title, body_md) values
  (
    v_id,
    0,
    'Abre el panel en tu navegador móvil',
    'Inicia sesión en FutPro Manager desde tu teléfono y entra a **Partidos** (`/dashboard/matches`).'
  ),
  (
    v_id,
    1,
    'Filtra por tus designaciones',
    'Activa la pestaña **Mis partidos**. Verás de inmediato tus juegos asignados con badge de rol "(Tú)".'
  ),
  (
    v_id,
    2,
    'Usa los steppers táctiles de gol',
    'Entra a **Resultado**. Con toques directos en los botones amplios incrementa o decrementa los goles sin abrir el teclado.'
  ),
  (
    v_id,
    3,
    'Registra eventos con botones de un toque',
    'Entra a **Eventos** para reportar amonestaciones y sustituciones con selector rápido de jugadores de ambos equipos.'
  );


  -- ------------------------------------------------------------
  -- 11. super_admin: plataforma-broadcast
  -- ------------------------------------------------------------
  insert into public.tutorials (slug, title, summary, target_roles, tags, estimated_minutes, sort_order, is_published, related_route, faq)
  values (
    'plataforma-broadcast',
    'Emitir avisos masivos (Broadcast)',
    'Envía notificaciones a todos los usuarios o segmentadas por rol en la plataforma.',
    array['super_admin'],
    array['notificaciones', 'general'],
    4,
    110,
    true,
    '/dashboard/notifications/broadcast',
    '[
      {"q": "¿Quién recibe un aviso broadcast?", "a": "Todos los usuarios activos en la plataforma o el grupo de usuarios filtrados por el rol seleccionado."},
      {"q": "¿Los administradores de liga pueden enviar avisos masivos globales?", "a": "No. Los avisos globales son exclusivos del super_admin para mantener la bandeja libre de spam."},
      {"q": "¿Queda auditada la emisión masiva?", "a": "Sí. Cada envío registra un evento de auditoría con el actor, destinatarios y contenido."}
    ]'::jsonb
  )
  on conflict (slug) do update set
    title = excluded.title,
    summary = excluded.summary,
    target_roles = excluded.target_roles,
    tags = excluded.tags,
    estimated_minutes = excluded.estimated_minutes,
    sort_order = excluded.sort_order,
    is_published = excluded.is_published,
    related_route = excluded.related_route,
    faq = excluded.faq
  returning id into v_id;

  delete from public.tutorial_steps where tutorial_id = v_id;

  insert into public.tutorial_steps (tutorial_id, step_order, title, body_md) values
  (
    v_id,
    0,
    'Accede al módulo de Avisos Globales',
    'En el menú de super administrador ingresa a **Avisos** (`/dashboard/notifications/broadcast`).'
  ),
  (
    v_id,
    1,
    'Define la audiencia objetivo',
    'Selecciona si el mensaje es para **Todos los usuarios** o segmentado por rol específico (`referee`, `league_admin`, `team_admin`, etc.).'
  ),
  (
    v_id,
    2,
    'Redacta el título y contenido del comunicado',
    'Escribe un encabezado claro y el cuerpo del mensaje explicando la actualización, aviso de mantenimiento o instrucción.'
  ),
  (
    v_id,
    3,
    'Envía el broadcast',
    'Pulsa **Emitir aviso**. El sistema creará las notificaciones in-app para cada usuario de la audiencia seleccionada.'
  );


  -- ------------------------------------------------------------
  -- 12. viewer: explorar-liga-publica
  -- ------------------------------------------------------------
  insert into public.tutorials (slug, title, summary, target_roles, tags, estimated_minutes, sort_order, is_published, related_route, faq)
  values (
    'explorar-liga-publica',
    'Explorar el portal público de una liga',
    'Consulta tabla de posiciones, calendario, estadísticas y fichas de equipos.',
    array['viewer'],
    array['publico', 'general', 'standings'],
    3,
    120,
    true,
    '/liga/[slug]',
    '[
      {"q": "¿Necesito cuenta para ver los partidos públicos?", "a": "No. Cualquier aficionado o familiar puede ingresar al portal público /liga/[slug] sin iniciar sesión."},
      {"q": "¿Con qué frecuencia se actualiza la tabla de posiciones?", "a": "En tiempo real en cuanto el árbitro finaliza el partido oficial."},
      {"q": "¿Puedo compartir las estadísticas en redes sociales?", "a": "Sí. Cada partido y liga cuenta con tarjeta de vista previa automática (OpenGraph) para compartir en WhatsApp y redes sociales."}
    ]'::jsonb
  )
  on conflict (slug) do update set
    title = excluded.title,
    summary = excluded.summary,
    target_roles = excluded.target_roles,
    tags = excluded.tags,
    estimated_minutes = excluded.estimated_minutes,
    sort_order = excluded.sort_order,
    is_published = excluded.is_published,
    related_route = excluded.related_route,
    faq = excluded.faq
  returning id into v_id;

  delete from public.tutorial_steps where tutorial_id = v_id;

  insert into public.tutorial_steps (tutorial_id, step_order, title, body_md) values
  (
    v_id,
    0,
    'Ingresa al portal de la liga',
    'Navega a la dirección pública `/liga/[slug]` de tu competencia de preferencia o usa el buscador de ligas en `/explorar`.'
  ),
  (
    v_id,
    1,
    'Revisa la Tabla de Posiciones',
    'En la sección **Tabla** consulta puntos, diferencia de goles, partidos disputados y la racha de forma reciente (G/E/P).'
  ),
  (
    v_id,
    2,
    'Consulta el Calendario y Partidos en Vivo',
    'Entra a **Partidos** para revisar los horarios programados, marcadores pasados y juegos con la insignia pulsante EN VIVO.'
  ),
  (
    v_id,
    3,
    'Explora las Estadísticas de la temporada',
    'Visita **Estadísticas** para conocer la tabla de goleo individual, asistencias, vallas invictas de porteros y fair play disciplinario.'
  );

end $$;
