-- Resultados completos por participante, incluindo codigos tecnicos.
-- Resultado: uma linha por participante e uma coluna por campo coletado.
-- As respostas originais nao sao alteradas nem apagadas.
--
-- Para evitar informacao repetida, a view:
--   * mostra os selos sempre pelo ID (red-1, red-2, green-1, green-2, green-3),
--     inclusive dentro de listas como "A > B > C" e "A, B";
--   * mantem os tempos apenas em milissegundos (_ms);
--   * omite colunas que repetem outra coluna ou que sao fixas pelo desenho do estudo.

BEGIN;

-- Converte o nome de um selo, em portugues ou ingles, para o ID do selo.
-- Nomes desconhecidos sao mantidos como estao para nao perder informacao.
CREATE OR REPLACE FUNCTION public.selo_para_id(nome TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $function$
  SELECT CASE LOWER(TRIM(nome))
    WHEN 'angus' THEN 'red-1'
    WHEN 'bem-estar animal' THEN 'red-2'
    WHEN 'animal welfare' THEN 'red-2'
    WHEN 'tradicional' THEN 'green-1'
    WHEN 'traditional' THEN 'green-1'
    WHEN 'comum' THEN 'green-1'
    WHEN 'common' THEN 'green-1'
    WHEN 'beef' THEN 'green-1'
    WHEN 'cultivada' THEN 'green-2'
    WHEN 'cultivated' THEN 'green-2'
    WHEN 'cultured' THEN 'green-2'
    WHEN 'cultivated meat certification' THEN 'green-2'
    WHEN 'orgânica' THEN 'green-3'
    WHEN 'organica' THEN 'green-3'
    WHEN 'organic' THEN 'green-3'
    ELSE TRIM(nome)
  END
$function$;

-- Converte cada selo de uma lista ("A > B > C" ou "A, B") mantendo a ordem.
CREATE OR REPLACE FUNCTION public.lista_selos_para_ids(lista TEXT, separador TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $function$
  SELECT CASE
    WHEN lista IS NULL OR TRIM(lista) = '' THEN lista
    ELSE (
      SELECT STRING_AGG(public.selo_para_id(itens.item), separador ORDER BY itens.posicao)
      FROM UNNEST(STRING_TO_ARRAY(lista, separador)) WITH ORDINALITY AS itens(item, posicao)
    )
  END
$function$;

CREATE OR REPLACE FUNCTION public.atualizar_resultados_completos_app()
RETURNS VOID
LANGUAGE plpgsql
AS $function$
DECLARE
  colunas TEXT;
BEGIN
  WITH linhas AS (
    SELECT linha.data
    FROM public."StudyDataRow" AS linha
    WHERE linha.kind::TEXT = 'FULL_SURVEY'
      AND linha.dataset = 'participantRows'
  ),
  todas_chaves AS (
    SELECT DISTINCT chaves.chave
    FROM linhas
    CROSS JOIN LATERAL jsonb_object_keys(linhas.data) AS chaves(chave)
  ),
  campos AS (
    SELECT
      chaves.chave AS campo,
      CASE
        WHEN LENGTH(chaves.chave) > 63
          THEN LEFT(chaves.chave, 54) || '_' || LEFT(MD5(chaves.chave), 8)
        ELSE chaves.chave
      END AS coluna,
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
        jsonb_typeof(linhas.data -> chaves.chave) IN ('number', 'null')
        OR (
          jsonb_typeof(linhas.data -> chaves.chave) = 'string'
          AND COALESCE(linhas.data ->> chaves.chave, '') = ''
        )
      )
      AND BOOL_OR(jsonb_typeof(linhas.data -> chaves.chave) = 'number') AS numerico
    FROM linhas
    CROSS JOIN LATERAL jsonb_object_keys(linhas.data) AS chaves(chave)
    WHERE chaves.chave NOT IN ('participant_id', 'location')
      -- Nomes visuais dos cortes e selos nao entram na tabela baseada em IDs.
      AND chaves.chave !~ '(_title$|_subtitle$)'

      -- Repeticoes: a coluna mantida esta indicada em cada linha.
      AND chaves.chave !~ '_rank_[0-9]+_choice$'            -- = *_rank_N_seal_id
      AND chaves.chave !~ '^s3_top_choice_[0-9]+$'          -- = s3_top_seal_N
      AND chaves.chave !~ '_final_confirmed_option_id$'     -- = *_option_id
      AND chaves.chave !~ '_cut_id$'                        -- = *_seal_id (1 para 1)
      AND chaves.chave !~ '_price_brl$'                     -- = *_price (+ *_price_currency)
      AND chaves.chave !~ '^s[123]_timestamp$'              -- = sN_session_N_completed_at / full_survey_completed_at
      AND chaves.chave !~ '^s3_screen_[0-9]+_choices_completed_at$' -- = s3_screen_N_preselection_started_at
      AND chaves.chave !~ '^s[123]_data_schema_version$'    -- = data_schema_version
      AND chaves.chave NOT IN (
        's2_seal_reading_started_at',                       -- = s2_session_2_started_at
        's1_first_moment_completed_at',                     -- = s1_preselection_started_at
        's1_collection_started_at',                         -- = full_survey_started_at
        'session_2_seals_read_count'                        -- = s2_seals_read_count
      )

      -- Valores fixos pelo desenho do estudo.
      AND chaves.chave !~ '^session_[123]_completed$'       -- a view so tem pesquisas completas
      AND chaves.chave !~ '^s[123]_(method|session_number)$'
      AND chaves.chave !~ '^s3_screen_[0-9]+_rank_[0-9]+_price_(currency|unit)$' -- = s3_base_price_currency / s3_base_price_unit

      -- Tempos somente em milissegundos: remove "X_seconds" e o tempo
      -- formatado "X" (mm:ss.mmm) quando existe a coluna "X_ms".
      AND NOT (
        chaves.chave ~ '_seconds$'
        AND EXISTS (
          SELECT 1
          FROM todas_chaves
          WHERE todas_chaves.chave = REGEXP_REPLACE(chaves.chave, '_seconds$', '_ms')
        )
      )
      AND NOT EXISTS (
        SELECT 1
        FROM todas_chaves
        WHERE todas_chaves.chave = chaves.chave || '_ms'
      )
    GROUP BY chaves.chave
  )
  SELECT STRING_AGG(
    CASE
      -- Escolha de um unico selo.
      WHEN campo ~ '_choice(_[0-9]+)?$' THEN
        FORMAT(', public.selo_para_id(dados.data->>%L) AS %I', campo, coluna)
      -- Ordens e rankings no formato "A > B > C".
      WHEN campo ~ '(_initial_display_order|_first_open_order|_final_confirmed_rank|_preselection_initial_rank|_preselection_final_rank|_ranking_revision_[0-9]+_initial_rank|_ranking_revision_[0-9]+_final_rank)$' THEN
        FORMAT(', public.lista_selos_para_ids(dados.data->>%L, '' > '') AS %I', campo, coluna)
      -- Produtos recusados no formato "A, B".
      WHEN campo ~ '_rejected_products$' THEN
        FORMAT(', public.lista_selos_para_ids(dados.data->>%L, '', '') AS %I', campo, coluna)
      WHEN numerico THEN
        FORMAT(', NULLIF(dados.data->>%L, '''')::NUMERIC AS %I', campo, coluna)
      ELSE
        FORMAT(', dados.data->>%L AS %I', campo, coluna)
    END,
    E'\n'
    ORDER BY ordem, campo
  )
  INTO colunas
  FROM campos;

  IF colunas IS NULL OR colunas = '' THEN
    RAISE EXCEPTION 'Nenhuma pesquisa completa foi encontrada em StudyDataRow.';
  END IF;

  EXECUTE 'DROP VIEW IF EXISTS public.resultados_completos_app';

  EXECUTE FORMAT(
    $view$
      CREATE VIEW public.resultados_completos_app AS
      WITH dados AS (
        SELECT DISTINCT ON (linha."participantId", linha.location)
          linha."participantId",
          linha.location,
          linha."savedAt",
          linha.data
        FROM public."StudyDataRow" AS linha
        WHERE linha.kind::TEXT = 'FULL_SURVEY'
          AND linha.dataset = 'participantRows'
        ORDER BY
          linha."participantId",
          linha.location,
          linha."savedAt" DESC,
          linha.id DESC
      )
      SELECT
        dados."participantId" AS participante,
        dados.location::TEXT AS local_estudo,
        dados."savedAt" AS registro_salvo_em
      %s
      FROM dados
    $view$,
    colunas
  );
END
$function$;

SELECT public.atualizar_resultados_completos_app();

COMMENT ON VIEW public.resultados_completos_app IS
  'Resultados completos: uma linha por participante, selos por ID, tempos em ms, sem colunas repetidas.';

COMMIT;

-- Troque PUCPR por UFBA ou NMSU quando precisar de outro local.
SELECT *
FROM public.resultados_completos_app
WHERE local_estudo = 'PUCPR'
ORDER BY participante;
