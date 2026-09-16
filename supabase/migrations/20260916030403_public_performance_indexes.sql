-- Migración de índices de rendimiento para rutas públicas (/liga/[slug])

-- 1. Índice para búsqueda de ligas públicas por slug
CREATE INDEX IF NOT EXISTS idx_leagues_slug ON public.leagues (slug);

-- 2. Índice para eventos de partidos por match_id (evita Seq Scan en getSeasonStats y detalle de partido)
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON public.match_events (match_id);

-- 3. Índice compuesto para consultas de partidos filtrados por liga, temporada, estado y ordenados por fecha
CREATE INDEX IF NOT EXISTS idx_matches_league_season_status_scheduled ON public.matches (league_id, season_id, status, scheduled_at);
