# Fase 21 - Smoke Test Real com 30 Videos

## Objetivo

Criar um laboratorio de teste operacional para simular 3 canais e 30 videos, registrando status, custos, qualidade, falhas e gargalos sem mascarar mocks.

## Canais testados

- Historias Biblicas
- Estoicismo com Anime
- Curiosidades Historicas

Cada canal possui 10 videos:

- 7 verticais 9:16
- 3 horizontais 16:9

## Rota

- `/app/test-lab`

## Modelo de dados

Tipos adicionados:

- `SmokeTestVideoResult`
- `SmokeTestIssue`
- `SmokeModuleValidation`

Mocks adicionados:

- `smokeTestVideoResults`
- `smokeTestIssues`
- `smokeModuleValidations`

## Resultado verdadeiro do teste

O sistema ainda nao deve ser tratado como producao real completa porque:

- render MP4 real nao foi comprovado
- ZIP exportado ainda e mockado
- providers reais seguem ausentes
- consumo de creditos ainda e estimado
- filas e workers continuam simulados

## Proxima correcao recomendada

Conectar render/export reais e criar verificador de existencia de arquivo antes de marcar video como pronto para publicacao manual.
