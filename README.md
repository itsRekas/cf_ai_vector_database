# cf_ai_vector_database

Lightweight vector database built on Cloudflare Workers + KV with Cloudflare AI embeddings.

This repository demonstrates a simple vector store that:
- stores text + embedding pairs in a KV namespace,
- computes embeddings using a Cloudflare AI binding,
- exposes HTTP endpoints to insert, query (nearest neighbours), and delete entries,
- ships a small UI in `public/index.html` to exercise the API.

This project uses Vitest for unit tests and includes several example tests that mock the Worker bindings so you can run tests without contacting Cloudflare services.

## Contents

- `src/` — Worker source code and library logic
  - `src/index.ts` — HTTP handler (routes `/insert`, `/query`, `/delete`)
  - `src/lib/components.ts` — helpers: embedding generation, cosine similarity, KV listing
  - `src/lib/insert.ts` — insert helper (creates embedding and stores in KV)
  - `src/lib/query.ts` — query helper (returns top-k nearest by cosine similarity)
  - `src/lib/delete.ts` — delete helper
- `public/index.html` — simple client UI for insert/query/delete (improved styling + adjustable `k` parameter)
- `test/` — Vitest specs for unit tests (components, insert, query, delete, worker)
- `wrangler.jsonc` — Cloudflare Worker configuration (bindings)

## Quickstart (deployed)

Try the live deployment at:

```
https://cf_ai_vector_database.cf-ai-vector-db.workers.dev/
```

Open the URL in your browser to use the UI (Insert / Query / Delete). The Query form includes a configurable `k` (top-k) and a Search button.

API examples against the deployed worker

Insert example

```bash
curl -X POST https://cf_ai_vector_database.cf-ai-vector-db.workers.dev/insert \
  -H 'Content-Type: application/json' \
  -d '{"id":"doc1","text":"Hello world"}'
```

Query example (top 5 by default)

```bash
curl -X POST https://cf_ai_vector_database.cf-ai-vector-db.workers.dev/query \
  -H 'Content-Type: application/json' \
  -d '{"text":"hello","k":5}'
```

Delete example

```bash
curl -X POST https://cf_ai_vector_database.cf-ai-vector-db.workers.dev/delete \
  -H 'Content-Type: application/json' \
  -d '{"id":"doc1"}'
```

Run tests locally

If you want to run the unit tests locally (they use mocks and do not call live AI/KV bindings):

```bash
npm install
npm test
```

Run locally (optional)

If you prefer to run the worker locally instead of using the deployed instance, you can use `wrangler dev`:

```bash
npm install -g wrangler
npm run dev
```

Note: when running locally the AI binding will typically be mocked or unavailable in the dev environment; the deployed instance will run with the configured AI binding.

Interactive walkthrough (try it on the deployed site)

Follow these steps in your browser at the deployed URL to exercise the UI and API end-to-end:

1. Open the deployed UI: `https://cf_ai_vector_database.cf-ai-vector-db.workers.dev/`.
2. Click the "Insert" button in the toolbar to open the Insert form.
3. Add the first record:
  - `Index / ID`: `doc1`
  - `Text`: `Hello from doc1`
  - Click the `Insert` button. You should see a confirmation in the output area.
4. Add a second record:
  - `Index / ID`: `doc2`
  - `Text`: `Greetings from doc2`
  - Click the `Insert` button.
5. Click the "Query" button to open the Query form.
  - In `Search text` enter a term that matches one of the inserted texts, for example `Hello`.
  - Optionally adjust `k` (default 5).
  - Click `Search` (or press Enter). The results area will display the top-k matches and similarity scores.
6. To verify deletion, click the "Delete" button, enter `doc1` for the ID and click `Delete`.
7. Return to the Query form and run the same search again (`Hello`). `doc1` should no longer appear in the results.

This quick sequence demonstrates the full cycle: insert -> query -> delete -> query (observe change).

## Configuration / Bindings

The worker expects the following bindings to be configured in `wrangler.jsonc` or via the dashboard:
- `VECTOR_KV` — a `kv_namespace` binding where vectors are stored.
- `AI` — a Cloudflare AI binding used by `getEmbedding()` in `src/lib/components.ts`.

During development you can mock these bindings (see `test/*.spec.ts` which use `vi` to stub `env.VECTOR_KV` and `env.AI`).

If you plan to deploy to Cloudflare:
1. Create a KV namespace and update `wrangler.jsonc` with the namespace id and name.
2. Add an AI binding following Cloudflare docs and ensure the name matches the binding used in `src/lib/interfaces.ts` (by default `AI`).
3. Deploy with:

```bash
wrangler deploy
```

## Implementation notes

- Embeddings: the code calls `env.AI.run("@cf/baai/bge-m3", { text, size: 256 })` to generate embeddings. You can change model name/size inside `getEmbedding()` if you want a cheaper/faster model (e.g. a 'mini' variant) or a different dimension.
- Storage: each KV value is `JSON.stringify({ text, embedding })` stored under the provided `id`.
- Query: `src/lib/query.ts` computes cosine similarity for all stored embeddings and returns the top-k sorted results. This is intentionally simple; for large datasets swap to an approximate nearest-neighbour store.

## Tests

- Run all tests:

```bash
npm test
```

- Tests are in `test/` and mock the Worker `env` where appropriate. Example files:
  - `test/components.spec.ts` — tests `cosineSimilarity`, `getEmbedding` (mocked), `getVectorsFromKV` (mocked KV)
  - `test/insert.spec.ts` — tests `insert()` stores expected value in KV
  - `test/query.spec.ts` — tests `query()` top-k behaviour by mocking `getEmbedding` and `getVectorsFromKV`


## Next steps / Suggestions

- Add CI (GitHub Actions) that runs `npm test` on push/PR and prevents accidental commits that hit live AI bindings.
- Add a paginated listing mechanism for `getVectorsFromKV()` to avoid reading very large KV namespaces into memory.
- Use HNSW (Hierarchical Navigable Small World) for large datasets instead of scanning KV — store vectors in an HNSW index (locally or via a service) and use it for efficient approximate nearest-neighbour search.

## AI-assisted coding

This project contains code created and modified with AI assistance. AI was used to help give insights to implement features and generate tests;

This project belongs to Reginald Kotey Appiah-Sekyere. I take full responsibility for and ownership of this project.

