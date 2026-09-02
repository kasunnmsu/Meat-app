-- Uma unica tabela analitica para o app.
-- Resultado: uma linha por participante e uma coluna por campo do questionario.
-- As respostas originais nao sao alteradas nem apagadas.

BEGIN;

CREATE OR REPLACE FUNCTION public.atualizar_resultados_app()
RETURNS VOID
LANGUAGE plpgsql
AS $function$
DECLARE
  colunas TEXT;
BEGIN
  SELECT STRING_AGG(
    CASE
      WHEN numerico THEN
        FORMAT(', NULLIF(dados.data->>%L, '''')::NUMERIC AS %I', campo, campo)
      ELSE
        FORMAT(', dados.data->>%L AS %I', campo, campo)
    END,
    E'\n'
    ORDER BY ordem, campo
  )
  INTO colunas
  FROM (
    SELECT
      chaves.chave AS campo,
      MIN(CASE
        WHEN chaves.chave IN (
          'gender',
          'age_group',
          'income_group',
          'education_level',
          'data_schema_version'
        ) THEN 1
        WHEN chaves.chave LIKE 'session_%' THEN 2
        WHEN chaves.chave LIKE 's1_%' THEN 10
        WHEN chaves.chave LIKE 's2_%' THEN 20
        WHEN chaves.chave LIKE 's3_%' THEN 30
        WHEN chaves.chave LIKE 'full_survey_%' THEN 40
        ELSE 50
      END) AS ordem,
      BOOL_AND(
        jsonb_typeof(r.data -> chaves.chave) IN ('number', 'null')
        OR (
          jsonb_typeof(r.data -> chaves.chave) = 'string'
          AND COALESCE(r.data ->> chaves.chave, '') = ''
        )
      )
      AND BOOL_OR(jsonb_typeof(r.data -> chaves.chave) = 'number') AS numerico
    FROM public."StudyDataRow" AS r
    CROSS JOIN LATERAL jsonb_object_keys(r.data) AS chaves(chave)
    WHERE r.kind::TEXT = 'FULL_SURVEY'
      AND r.dataset = 'participantRows'
      AND chaves.chave NOT IN ('participant_id', 'location')
      -- Datas absolutas e numeros tecnicos ficam no banco, nao na tabela analitica.
      AND chaves.chave !~ '(^timestamp$|_at$|_timestamp$|_ms$|_seconds$)'
      -- IDs, imagens e rotulos tecnicos sao substituidos pelos campos de escolha legiveis.
      AND chaves.chave !~ '(_option_id$|_cut_id$|_seal_id$|_title$|_subtitle$|_image_url$|_color$)'
      AND chaves.chave !~ '(initial_selected_option_id$|final_confirmed_option_id$|changed_preference_before_confirming$)'
      AND chaves.chave !~ '^s3_top_seal_[0-9]+$'
    GROUP BY chaves.chave
  ) AS campos;

  IF colunas IS NULL OR colunas = '' THEN
    RAISE EXCEPTION 'Nenhuma pesquisa completa foi encontrada em StudyDataRow.';
  END IF;

  -- A view pode ser recriada com novas colunas quando o questionario mudar.
  EXECUTE 'DROP VIEW IF EXISTS public.resultados_app';

  EXECUTE FORMAT(
    $view$
      CREATE VIEW public.resultados_app AS
      WITH dados AS (
        SELECT DISTINCT ON (r."participantId", r.location)
          r."participantId",
          r.location,
          r.data
        FROM public."StudyDataRow" AS r
        WHERE r.kind::TEXT = 'FULL_SURVEY'
          AND r.dataset = 'participantRows'
        ORDER BY
          r."participantId",
          r.location,
          r."savedAt" DESC,
          r.id DESC
      )
      SELECT
        dados."participantId" AS participante,
        dados.location::TEXT AS local_estudo
      %s
      FROM dados
    $view$,
    colunas
  );
END
$function$;

COMMENT ON FUNCTION public.atualizar_resultados_app() IS
  'Recria resultados_app com uma coluna para cada campo analitico encontrado nas pesquisas completas.';

SELECT public.atualizar_resultados_app();

COMMENT ON VIEW public.resultados_app IS
  'Tabela analitica do app: uma linha por participante, escolhas e tempos legiveis em colunas.';

COMMIT;

-- Verificacao: deve retornar a quantidade de participantes e de colunas.
SELECT
  (SELECT COUNT(*) FROM public.resultados_app) AS participantes,
  (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'resultados_app'
  ) AS colunas;
