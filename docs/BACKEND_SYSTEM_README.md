# Compliance Agent Backend – Developer Guide

Audience: backend engineers joining the project. Scope: FastAPI backend located in `backend/app`. This document explains architecture, core features and flows, key models/services, dependencies, and production readiness gaps with remediation guidance.

## Architecture at a Glance
- Stack: FastAPI, SQLAlchemy/PostgreSQL, httpx, Pydantic, Ollama LLM.
- Entrypoint: `app.main` wires routers, CORS, logging, and lifespan check against Ollama.
- Request dependencies: DB sessions via `api.deps.get_db_session`; user identity is a raw `X-User-Id` header (POC only), with a simple super-admin guard for rule admin routes.
- Persistence: SQLAlchemy models under `app/models`; Alembic migrations present in `backend/migrations`.
- AI Integration: `services.ollama_service` centralizes calls with retry/fallback, used by compliance checks, deep analysis, rule generation, and rule matching.
- Content pipeline: upload → optional preprocessing/chunking → compliance analysis → optional deep analysis → dashboards/exports.

## Core Data Model (simplified)
- `User`: `id`, `name`, `email`, `role` (agent/reviewer/super_admin); `created_rules` relationship.
- `Submission`: uploaded document; `title`, `content_type`, `original_content`, `file_path`, `status` (`uploaded`, `preprocessing`, `preprocessed`, `analyzing`, `analyzed`, `failed`); relationships to `ComplianceCheck` and `ContentChunk`.
- `ContentChunk`: chunked text with ordering, token count, metadata (`page_number`, offsets, method, etc.) for traceability/backward compatibility.
- `ComplianceCheck`: per-submission summary scores (`overall`, `irdai`, `brand`, `seo`), `status`, `grade`, `ai_summary`; `violations` relationship.
- `Violation`: linked to `ComplianceCheck` and optionally `Rule`; holds severity/category, description, location, suggested fix, auto-fix flag.
- `Rule`: dynamic rules with `category` (irdai/brand/seo), `severity`, `rule_text`, optional regex/pattern, keywords, `points_deduction`, active flag, `created_by`.
- `DeepAnalysis`: single-row JSON blob per `ComplianceCheck`, storing line-by-line results plus severity weight snapshot and summary stats.

## Key Services and How They Work
- `ollama_service`: async client with health check, chat/generate fallback, max retries, simple JSON fallback when unreachable.
- `content_parser`/`ContentParserService`: HTML/Markdown → BeautifulSoup; PDF via PyPDF2; DOCX via python-docx; markdown → HTML → text; synchronous helpers for preprocessing.
- `PreprocessingService`: chunking orchestrator. Sets submission status to `preprocessing`, chunks text via sliding window with sentence-aware boundaries and metadata, stores `ContentChunk` rows, then marks `preprocessed`. PDF/DOCX parsing TODOs for richer metadata.
- `ContentRetrievalService`: unified read layer returning `ChunkDTO` objects. Uses real chunks if `preprocessed`; otherwise synthesizes a single legacy chunk (truncated to 3000 chars) to stay backward-compatible.
- `ComplianceEngine`: chunk-aware analysis. Loads active rules (top 3 per category by severity), builds a JSON-only prompt, calls Ollama per chunk, parses JSON, attaches chunk refs, aggregates violations, calculates scores via `ScoringService`, stores `ComplianceCheck` + `Violation` rows, updates submission status.
- `ScoringService`: deterministic scoring; uses rule `points_deduction` when present, otherwise severity fallbacks. Weighted category aggregation (IRDAI 50%, Brand 30%, SEO 20%), grade/status derivation, safeguards against runaway deductions.
- `DeepAnalysisService`: “Deep Compliance Research Mode”. Segments document into lines, uses AI only for violation detection/context, then deterministically scores each line with user-provided severity multipliers. Persists a single `DeepAnalysis` JSON record (audit-friendly). Exposes retrieval and SSE streaming. Can sync impacts back into overview results.
- `RuleGeneratorService`: super-admin-only. Parses uploaded compliance docs, builds extraction prompt, calls Ollama, validates JSON, inserts rules with `points_deduction`. Also supports preview (no DB write), AI refinement, manual updates/deletes, and bulk save.
- `RuleMatcherService`: AI semantic matching from Deep Analysis impacts to existing rules with a confidence threshold and cache.
- `DashboardService`: aggregates compliance trends (daily averages), violation heatmaps by category/severity, and top violation counts.

## API Surface (high level)
- Submissions (`/api/submissions`): upload, list/get, analyze (auto-preprocess if needed), delete (single/all).
- Compliance (`/api/compliance`): fetch compliance results/violations, deep analysis run/get/presets/stream, export HTML report, sync deep analysis into overview scores/violations.
- Admin (`/api/admin`): super-admin gated rule generation, preview, refinement, bulk save, CRUD, stats.
- Dashboard (`/api/dashboard`): trend, heatmap, top-violation analytics (served via `dashboard_service`; check router for exact signatures).
- Preprocessing (`/api/preprocessing`): chunk management endpoints (chunk counts, delete/reprocess) – useful for debugging large docs.

## End-to-End Flow (what happens)
1) Upload  
   - `POST /api/submissions/upload` saves file to `settings.upload_dir`, parses to text, writes `Submission` with `status=uploaded`.

2) Preprocess (implicit if needed)  
   - `analyze` endpoint auto-runs `PreprocessingService` when `status=uploaded`, generating ordered `ContentChunk` rows with metadata and switching status to `preprocessed`.

3) Compliance analysis (chunk-aware)  
   - `ComplianceEngine.analyze_submission` pulls chunks (or legacy synthetic), loads top rules, prompts Ollama per chunk, parses violations, scores via `ScoringService`, persists `ComplianceCheck` + `Violation`, sets submission `analyzed`.

4) Deep analysis (line-by-line optional)  
   - `POST /api/compliance/{id}/deep-analyze` segments lines, AI detects violations, deterministic scoring with caller-supplied severity weights, stores a single `DeepAnalysis` JSON record + summary stats. SSE variant streams progress. Export and sync endpoints reuse stored results.

5) Rules lifecycle  
   - Super-admin header (`X-User-Id` + role) gates document-driven rule generation, preview/refine, bulk submit, manual CRUD, deactivate, stats. Rules feed both chunked analysis and deep analysis scoring/matching.

6) Dashboards  
   - Aggregations over `ComplianceCheck`/`Violation` for trends, heatmaps, and top issues for UI consumption.

## Configuration & Conventions
- Settings: `app/config.py` via `.env` (DB URL, Ollama URL/model, timeouts, CORS, upload dir, log level).
- Status enums are stringly-typed; no DB enum constraints.
- Categories: `irdai`, `brand`, `seo`. Severities: `critical|high|medium|low`.
- Files land in `./uploads` relative to backend root; not auto-cleaned on failures.
- Logging: standard library; level from config; no structured logging/metrics.

## Notable Gaps and Production Risks
- Authentication/authorization: relies on raw `X-User-Id`; no JWT/OAuth, no rate limiting, no audit trail of requests. Super-admin trust is client-side only.
- Long-running work in request thread: chunking (PDF/DOCX parsing), LLM calls, and deep analysis run inside request handlers; no background jobs or timeouts per task; single DB session reused across streams.
- Error handling/transactions: mixed commit/flush patterns; partial writes possible if exceptions occur mid-loop; no idempotency for repeated analyze/deep-analyze calls.
- File handling: uploads written to local disk without scanning, size enforcement beyond form limit, or lifecycle cleanup; path configured to relative `./uploads`.
- LLM robustness: JSON parsing is tolerant but still brittle; prompt injection/sensitive content controls absent; no guardrails on model selection.
- Data validation: many free-form strings (statuses, categories) lack enum constraints; severity weights not range-clamped at the DB level.
- Observability: no metrics/tracing, minimal structured logs; health check only pings Ollama tags.
- Security: no TLS mention, no CSRF for non-GET, no IP allowlisting; CORS wide-open to localhost.
- Performance: chunking is character-based and single-threaded; PDF/DOCX parsing sync-blocks event loop; rule loading fetches all active rules and trims to 3 per category in memory; no caching of scoring weights or rules except rule matcher cache.
- Testing: a few tests exist but coverage is unclear; no contract tests for LLM prompts/responses or streaming endpoints.
- Data integrity: `ContentChunk` uses `metadata` param name when constructing (SQLAlchemy reserves `metadata`); risk of runtime errors depending on SQLAlchemy version. Status transitions aren’t enforced; retries may double-run.

## Quick Mitigations / Improvement Plan
- Security/authn: add proper JWT/OAuth, role checks server-side, and request logging; enforce rate limits and size limits at gateway.
- Background processing: move preprocessing, chunk analysis, and deep analysis to task queue (Celery/RQ) with progress tracking; keep HTTP endpoints as triggers/pollers.
- Validation: use Enums in schemas and DB constraints for statuses/categories/severities; clamp severity weights at API boundary.
- Transactions/idempotency: wrap multi-step writes in explicit transactions; mark runs with an execution ID to prevent duplicates; add `started_at/ended_at` on long jobs.
- File pipeline: virus scan, MIME sniff, object storage with signed URLs, expiring temp files, enforce `max_upload_size`.
- LLM hardening: stricter JSON schema validation, retry with guarded system prompts, redact secrets, and log prompt/response hashes (not full content) for audit.
- Observability: add structured logging (request IDs), metrics (duration per step, LLM latency, chunk counts), health checks for DB and storage.
- Performance: async-friendly parsers or worker pool for PDF/DOCX; batch LLM calls or summarization for large docs; cache active rules; consider tokenizer-based chunking and page-aware metadata.
- Testing: add integration tests around upload→analyze, deep analyze presets, admin rule generation (mocked LLM), and streaming endpoints; seed fixtures for rules/users.

## Debugging & Ops Tips
- Health: `GET /health` checks API + Ollama availability only; DB health is implicit—watch logs for connection errors.
- Stuck states: if a submission is stuck in `preprocessing`/`analyzing`, inspect `ContentChunk` rows and rerun preprocessing via preprocessing routes or delete/re-upload.
- LLM failures: `ollama_service` falls back to empty-violation JSON; scores may be 100 with “AI service unavailable” message—surface this to clients.
- Deep analysis: uses a single DB session during SSE; if the stream is interrupted, check `deep_analysis.status` (may be `processing`/`failed`) and rerun.
- Rule changes: scoring uses `points_deduction`; ensure rules have reasonable values (positive numbers representing deductions). Re-run analyses after significant rule updates.
- Storage cleanup: deletions attempt to remove files; failures are logged but not fatal—clean `uploads/` manually or add a cron.

## Quick Start (local)
1) Install deps from `backend/requirements.txt` (and `requirements-dev.txt` if needed).
2) Set up Postgres and apply Alembic migrations (`backend/migrations`).
3) Ensure Ollama is running with model `qwen2.5:7b` (configurable via `.env`).
4) Run FastAPI (e.g., `uvicorn app.main:app --reload` from `backend`).
5) Use `/docs` for interactive exploration; include `X-User-Id` header (UUID) and super-admin role in DB for admin endpoints.

## What Makes It Non-Prod Ready Today (summary)
- Incomplete authZ/authN, no rate limiting, and reliance on client-sent headers.
- Blocking, long-running AI work in request path without queues or timeouts.
- Weak input validation and lack of strict schema/enum enforcement.
- Minimal observability/metrics and coarse error handling.
- File and LLM security hardening missing; local disk storage without lifecycle.
- Limited testing around critical flows and LLM-dependent paths.
