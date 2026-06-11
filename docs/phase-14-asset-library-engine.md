# Fase 14 - Asset Library Engine

Data: 2026-06-08

## Objetivo

Criar uma biblioteca profissional de assets para abastecer Magic Mode, Editor, Thumbnail, Videos IA, Cortes Virais e Biblioteca de Canais.

## Banco de dados

Novas tabelas em `supabase/schema.sql`:

- `asset_sources`
- `assets`
- `asset_collections`
- `asset_collection_items`
- `asset_usage`
- `asset_search_cache`

Todas receberam indices, RLS, policies e realtime.

## Permissoes

- `upload_asset`
- `delete_asset`
- `edit_asset`
- `favorite_asset`
- `create_collection`
- `import_external_asset`

## Rotas

- `/app/assets`
- `/app/assets/upload`
- `/app/assets/favorites`
- `/app/assets/analytics`

## APIs

- `GET /api/assets/search`
- `POST /api/assets/search` para Auto Match Visual
- `POST /api/assets/import`
- `POST /api/assets/upload`

As APIs usam backend server-side. Chaves externas devem ficar em variaveis de ambiente:

- `PEXELS_API_KEY`
- `PIXABAY_API_KEY`
- `UNSPLASH_ACCESS_KEY`

Sem chave configurada, o sistema retorna resultados demonstrativos com `providerMode: demo`.

## Recursos

- Biblioteca central de imagens, videos, audios, musicas, thumbnails e uploads.
- Busca inteligente por texto, tipo, origem, favoritos e orientacao.
- Arquitetura de sources: Upload, Pexels, Pixabay, Unsplash, IA Interna e Biblioteca Propria.
- Importacao com deteccao de duplicados por URL, hash e nome.
- Colecoes tematicas.
- Favoritos.
- Recentes e usados por `asset_usage`.
- Quality score interno.
- Storage analytics.
- Auto Match Visual por relevancia de texto da cena.
- Stock Video Mode no Magic Mode.
- Quick Insert no editor com botao Biblioteca.

## Integrações

Magic Mode:

- IA
- Biblioteca
- Pexels
- Pixabay
- Unsplash
- Upload
- Misto
- Stock Video Mode

Editor:

- Botao Biblioteca abre picker rapido.
- Insercao atualiza a cena localmente e registra mensagem de uso em modo demonstracao.

## Pendencias para producao

- Ativar chamadas reais aos providers com rate limits.
- Implementar Supabase Storage real para upload.
- Gerar thumbnails automaticas por worker.
- Persistir imports/cache/usage no Supabase em vez de mocks.
- Auditoria real em `audit_logs`.
- Termos/licencas por asset importado.
- Hash real de arquivos enviados.
