# Technical Gap Audit

## Visao geral

O projeto e forte em infraestrutura, mas ainda hibrido em areas centrais. O build passa, a arquitetura geral existe, e varias partes ja sao reais, mas ainda ha muitos fluxos que se anunciam como produto quando na pratica continuam em demo, mock ou fallback.

O maior risco nao e de compilacao. E de consistencia operacional: o usuario consegue navegar por quase tudo, mas alguns caminhos principais ainda nao representam a verdade do sistema.

## Critico

### 1. Magic Mode ainda depende de mock em pontos centrais

Arquivos:

- [src/components/magic/magic-mode.tsx](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/components/magic/magic-mode.tsx>)
- [src/components/magic/magic-job-progress.tsx](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/components/magic/magic-job-progress.tsx>)
- [src/components/magic/magic-history.tsx](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/components/magic/magic-history.tsx>)
- [src/app/api/magic/jobs/route.ts](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/api/magic/jobs/route.ts>)
- [src/app/api/magic/jobs/[id]/route.ts](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/api/magic/jobs/[id]/route.ts>)

Problema:

- usa `mock-data` como base;
- exibe fallback/mock visual;
- ainda fala em provider mockado e fallback instantaneo;
- a historia do job nao e persistencia real completa.

Risco:

- o usuario acha que gerou um fluxo real, mas o core do produto ainda nao e verdade plena.

Correção:

1. Migrar o Magic para ler projeto, cenas, audio, imagem, thumbnail e render via Supabase real.
2. Separar claramente `demo`, `beta` e `real`.
3. Bloquear sucesso quando houver fallback tecnico.

### 2. AI Video continua majoritariamente demo

Arquivo:

- [src/components/ai-video/ai-video-panels.tsx](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/components/ai-video/ai-video-panels.tsx>)

Problema:

- provider default `mock`;
- assets mockados;
- download pendente;
- editor/persistencia ainda pendentes;
- a linguagem da tela reforca estado provisório.

Correção:

1. Remover provider default `mock`.
2. Exibir status beta explicitamente.
3. Ligar com storage real e editor real apenas quando existir artefato verificavel.

### 3. Viral Clips ainda e demo de ponta a ponta

Arquivos:

- [src/app/api/viral-clips/jobs/route.ts](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/api/viral-clips/jobs/route.ts>)
- [src/app/api/viral-clips/jobs/[id]/route.ts](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/api/viral-clips/jobs/[id]/route.ts>)
- [src/app/api/viral-clips/jobs/[id]/render/route.ts](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/api/viral-clips/jobs/[id]/render/route.ts>)
- [src/components/viral/viral-clips-studio.tsx](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/components/viral/viral-clips-studio.tsx>)
- [src/components/viral/viral-clips-library.tsx](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/components/viral/viral-clips-library.tsx>)

Problema:

- depende de `mock-data`;
- gera `mock-render.mp4`;
- thumbnails e transcricoes sao demonstrativas;
- biblioteca ainda e parcialmente simulada.

Correção:

1. Trocar fonte de verdade para `source_videos`, `video_transcripts`, `viral_clip_jobs`, `viral_clips`.
2. Marcar a area como beta ate ter transcricao/render real.
3. Separar claramente o que e analytics de texto e o que e render real.

### 4. Billing e liberacao de uso ainda sao hibridos

Arquivos:

- [src/lib/billing.ts](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/lib/billing.ts>)
- [src/components/billing/billing-dashboard.tsx](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/components/billing/billing-dashboard.tsx>)
- [src/components/billing/admin-master-dashboard.tsx](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/components/billing/admin-master-dashboard.tsx>)

Problema:

- `canUseFeature()` ja consulta Supabase, mas a UI ainda vende grande parte do fluxo como previa demo;
- eventos e eventos de checkout ainda sao mockados;
- `previewCheckoutEvent()` e `createMockBillingEvent()` continuam ativos;
- a experiencia comercial nao e a de um billing final.

Correção:

1. Consolidar UI para mostrar claramente o que e real e o que e previa.
2. Remover mock dos fluxos de liberacao, mantendo apenas preview visual onde necessario.
3. Separar a parte de checkout real da parte de simulacao interna.

### 5. Fallback de workspace `ws_1` ainda existe em endpoints criticos

Arquivos com ocorrencias:

- [src/app/api/ai/text/route.ts](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/api/ai/text/route.ts>)
- [src/app/api/ai/images/route.ts](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/api/ai/images/route.ts>)
- [src/app/api/ai/tts/route.ts](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/api/ai/tts/route.ts>)
- [src/app/api/factories/generate/route.ts](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/api/factories/generate/route.ts>)
- [src/app/api/templates/use/route.ts](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/api/templates/use/route.ts>)
- [src/app/api/quality/analyze/route.ts](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/api/quality/analyze/route.ts>)
- [src/app/api/onboarding/events/route.ts](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/api/onboarding/events/route.ts>)
- [src/app/api/jobs/route.ts](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/api/jobs/route.ts>)

Problema:

- `ws_1` mascara erro de contexto;
- pode fazer o sistema parecer util mesmo quando o tenant correto nao foi carregado;
- fragiliza isolamento multi-tenant.

Correção:

1. Remover `ws_1` dos fluxos criticos.
2. Retornar erro claro quando workspace nao existir.
3. Exigir contexto autenticado valido sempre.

## Alto

### 6. Rotas de plataforma precisam de refinamento de permissao

Arquivos:

- [src/app/api/platform/api-keys/route.ts](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/api/platform/api-keys/route.ts>)
- [src/app/api/platform/webhooks/route.ts](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/api/platform/webhooks/route.ts>)
- [src/app/api/platform/marketplace/route.ts](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/api/platform/marketplace/route.ts>)

Problema:

- as rotas usam `admin.manage`, mas esse permission key nao esta consolidado no catalogo visivel do app;
- parte da intencao e boa, mas a permissao pode virar bloqueio silencioso se o seed/permissoes nao estiverem alinhados.

Correção:

1. Inserir a permissao no schema/seed.
2. Definir claramente owner/admin/platform_admin.
3. Testar com usuario real e workspace real.

### 7. Webhooks usam segredo sem criptografia real

Arquivos:

- [supabase/migrations/20260610_r11_platform_ecosystem.sql](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/supabase/migrations/20260610_r11_platform_ecosystem.sql>)
- [src/lib/platform/webhooks.ts](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/lib/platform/webhooks.ts>)

Problema:

- `secret_encrypted` e armazenado como texto bruto;
- entrega e retry ainda sao simplificados;
- webhook falhado nao tem fila de retry robusta.

Correção:

1. Criptografar segredo de verdade.
2. Adicionar retry com backoff.
3. Registrar falhas com mais contexto.

### 8. Login e onboarding ainda comunicam demo demais

Arquivos:

- [src/app/auth/login/page.tsx](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/auth/login/page.tsx>)
- [src/components/onboarding/onboarding-wizard.tsx](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/components/onboarding/onboarding-wizard.tsx>)

Problema:

- o texto ainda sugere uso mock/demo;
- isso enfraquece a percepcao de produto pronto.

Correção:

1. Trocar linguagem para beta/real.
2. Manter demo apenas em areas explicitamente marcadas.

### 9. Export Center ainda mistura real e demo

Arquivo:

- [src/components/export/export-center-dashboard.tsx](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/components/export/export-center-dashboard.tsx>)

Problema:

- mostra pacotes reais quando existem, mas ainda faz fallback para lista demo;
- a interface pode sugerir que tudo esta pronto mesmo sem render/export real.

Correção:

1. Exibir badge REAL/BETA/DEMO por linha ou bloco.
2. Separar a secao real da demonstrativa.

## Medio

### 10. Quality, Strategist e Templates ainda sao basicamente demonstrativos

Arquivos:

- [src/app/api/quality/analyze/route.ts](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/api/quality/analyze/route.ts>)
- [src/app/api/studio/strategy/route.ts](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/api/studio/strategy/route.ts>)
- [src/app/api/templates/use/route.ts](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/api/templates/use/route.ts>)

Problema:

- retornam `internal_mock`, `ai_demo`, `free_simple` ou mensagens de demo;
- o usuario recebe valor de UX, mas nao ancora em verdade comercial final.

Correção:

1. Marcar como beta no app.
2. Ligar metadados e logs reais antes de evoluir.

### 11. Muitas telas de produto seguem importando `mock-data`

Arquivos representativos:

- [src/components/content/global-search.tsx](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/components/content/global-search.tsx>)
- [src/components/content/content-library.tsx](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/components/content/content-library.tsx>)
- [src/components/channels/operation-cards.tsx](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/components/channels/operation-cards.tsx>)
- [src/components/factories/content-factory-panels.tsx](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/components/factories/content-factory-panels.tsx>)
- [src/components/media/video-editor.tsx](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/components/media/video-editor.tsx>)
- [src/components/media/thumbnail-studio.tsx](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/components/media/thumbnail-studio.tsx>)

Problema:

- o produto parece grande e rico, mas parte relevante ainda e scaffold/demo;
- isso e aceitavel em beta, nao em comercializacao sem rotulagem.

Correção:

1. Marcar visualmente com REAL/BETA/DEMO.
2. Migrar primeiro os fluxos mais monetizaveis.

### 12. Provider status/test ainda deixa opcao de fallback

Arquivos:

- [src/app/api/providers/status/route.ts](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/api/providers/status/route.ts>)
- [src/app/api/providers/test/route.ts](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/api/providers/test/route.ts>)

Problema:

- o sistema ainda expõe a ideia de fallback permitido;
- isso e util para dev, mas perigoso se permanecer sem visibilidade.

Correção:

1. Manter apenas em ambiente controlado.
2. Exibir claramente quando o modo e fallback/dev.

### 13. Workspace context e carteira ainda exigem higiene

Arquivos:

- [src/app/api/workspaces/context/route.ts](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/api/workspaces/context/route.ts>)
- [src/components/workspace/workspace-provider.tsx](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/components/workspace/workspace-provider.tsx>)

Problema:

- o contexto e bom, mas ainda ha pontos de fallback e campos que precisam bater exatamente com o schema;
- qualquer desacordo entre `reserved_balance`, `monthly_allowance` e o schema vira bug silencioso.

Correção:

1. Alinhar tipos da API com o schema final.
2. Validar wallet real com dados incompletos e workspace vazio.

## Baixo

### 14. Linguagem visual ainda carrega termos de demo em varios modulos

Problema:

- nao quebra o sistema;
- mas enfraquece percepcao de produto pronto.

Correção:

1. Revisao textual global.
2. Trocar "mock", "demo", "placeholder" por status reais quando aplicavel.

### 15. Algumas areas legais e institucionais ainda parecem provisórias

Arquivos:

- [src/app/terms/page.tsx](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/terms/page.tsx>)
- [src/app/privacy/page.tsx](</C:/Users/dmooo/OneDrive/Desktop/CODEX/Video Flow/src/app/privacy/page.tsx>)

Problema:

- sao utilitarios internos, mas ainda nao parecem texto final comercial.

Correção:

1. Revisao juridica.
2. Ajuste de tom para comercializacao.

## Prioridade recomendada

1. Remover `ws_1` dos fluxos criticos.
2. Fechar Magic Mode como fonte de verdade.
3. Tirar fallback/mock do AI Video.
4. Concluir Viral Clips real.
5. Unificar billing real e UI sem demo enganosa.
6. Criptografar webhooks e adicionar retry.
7. Consolidar permissoes de plataforma.
8. Rotular todo modulo demo/beta com honestidade visual.
9. Migrar Quality/Strategist/Templates para saida real.
10. Limpar a ultima camada de `mock-data` dos fluxos monetizaveis.

## Resumo executivo

O projeto nao esta quebrado. Ele esta incompleto nos lugares certos: justamente onde a verdade comercial importa mais.

O que ja esta bom:

- arquitetura geral;
- autenticação e contexto de workspace;
- fila/jobs;
- base de Supabase;
- varios dashboards e APIs reais;
- build e typecheck passando.

O que ainda precisa de correcao:

- Magic;
- AI Video;
- Viral Clips;
- billing/UI demo;
- fallbacks de workspace;
- webhooks com segredo criptografado;
- rotulagem honesta de demo/beta.

