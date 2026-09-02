-- Resultados completos por participante, incluindo codigos tecnicos.
-- Resultado: uma linha por participante e uma coluna por campo coletado.
-- As respostas originais nao sao alteradas nem apagadas.

BEGIN;

CREATE OR REPLACE FUNCTION public.atualizar_resultados_completos_app()
RETURNS VOID
LANGUAGE plpgsql
AS $function$
DECLARE
  colunas TEXT;
BEGIN
  SELECT STRING_AGG(
    CASE
      WHEN campo ~ '_choice(_[0-9]+)?$' THEN
        FORMAT(
          ', CASE LOWER(TRIM(dados.data->>%L))
               WHEN ''angus'' THEN ''red-1''
               WHEN ''bem-estar animal'' THEN ''red-2''
               WHEN ''animal welfare'' THEN ''red-2''
               WHEN ''tradicional'' THEN ''green-1''
               WHEN ''comum'' THEN ''green-1''
               WHEN ''common'' THEN ''green-1''
               WHEN ''cultivada'' THEN ''green-2''
               WHEN ''cultivated'' THEN ''green-2''
               WHEN ''orgânica'' THEN ''green-3''
               WHEN ''organica'' THEN ''green-3''
               WHEN ''organic'' THEN ''green-3''
               ELSE dados.data->>%L
             END AS %I',
          campo,
          campo,
          coluna
        )
      WHEN numerico THEN
        FORMAT(', NULLIF(dados.data->>%L, '''')::NUMERIC AS %I', campo, coluna)
      ELSE
        FORMAT(', dados.data->>%L AS %I', campo, coluna)
    END,
    E'\n'
    ORDER BY ordem, campo
  )
  INTO colunas
  FROM (
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
        jsonb_typeof(linha.data -> chaves.chave) IN ('number', 'null')
        OR (
          jsonb_typeof(linha.data -> chaves.chave) = 'string'
          AND COALESCE(linha.data ->> chaves.chave, '') = ''
        )
      )
      AND BOOL_OR(jsonb_typeof(linha.data -> chaves.chave) = 'number') AS numerico
    FROM public."StudyDataRow" AS linha
    CROSS JOIN LATERAL jsonb_object_keys(linha.data) AS chaves(chave)
    WHERE linha.kind::TEXT = 'FULL_SURVEY'
      AND linha.dataset = 'participantRows'
      AND chaves.chave NOT IN ('participant_id', 'location')
      -- Nomes visuais dos cortes e selos nao entram na tabela baseada em IDs.
      AND chaves.chave !~ '(_title$|_subtitle$)'
    GROUP BY chaves.chave
  ) AS campos;

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
  'Resultados completos: uma linha por participante, com nomes, codigos e tempos tecnicos.';

COMMIT;

-- Troque PUCPR por UFBA ou NMSU quando precisar de outro local.
SELECT *
FROM public.resultados_completos_app
WHERE local_estudo = 'PUCPR'
ORDER BY participante;
