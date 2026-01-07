# Compliance Agent POC - Technical Documentation

## 1. System Vision & Core Value Proposition

The **Compliance Agent POC** represents a paradigm shift from manual, error-prone compliance checking to an automated, AI-driven validation engine. Traditional compliance involves human reviewers manually cross-referencing marketing content against complex, ever-changing regulatory guidelines—a process that is slow, inconsistent, and unscalable.

**Core Value Proposition:**

- **Automated Validation:** Instantly analyzes PDF/DOCX marketing materials against strict regulatory standards (IRDAI), brand guidelines, and SEO best practices.
- **AI-Driven Fixes:** Going beyond simple flagging, the system acts as an agentic partner, suggesting specific, context-aware text rewrites to resolve violations.
- **Dynamic Rule Engine:** Empowers business users to upload raw regulation documents and have the AI automatically extract, categorize, and deploy executable compliance rules.
- **12-Factor Agent Design:** Built on "Stateless Reducer" principles, ensuring deterministic, reproducible, and scalable agent execution.

---

## 2. Architectural Deep-Dive

The system follows a modern, containerized microservices architecture composed of a FastAPI backend and a React/TypeScript frontend.

### Service Orchestration (Docker Compose)

The entire stack is managed via `docker-compose`, orchestrating the following services:

| Service        | Technology       | Role                                                         |
| :------------- | :--------------- | :----------------------------------------------------------- |
| **`backend`**  | Python (FastAPI) | Core API, Compliance Engine, Agent Orchestration             |
| **`frontend`** | React + Vite     | User Interface for Submissions, Results, and Admin           |
| **`postgres`** | PostgreSQL 15    | Primary relational database (Rules, Submissions, Violations) |
| **`redis`**    | Redis 7          | High-performance cache and message broker for async tasks    |
| **`pgadmin`**  | pgAdmin 4        | Database administration interface                            |

### Backend Architecture (FastAPI)

- **Framework:** FastAPI for high-performance, async API endpoints.
- **Agent Framework:** Implements **LangGraph** for stateful, multi-step agent workflows (Human-in-the-Loop).
- **Dependency Injection:** Utilizes FastAPI's `Depends` for database sessions (`deps.py`) and authentication.
- **Modular Services:** Business logic is encapsulated in dedicated services (`compliance_engine.py`, `rule_generator_service.py`), keeping routers clean.

### Frontend Architecture (React/TypeScript)

- **Framework:** Vite + React 18 for a fast, responsive SPA experience.
- **Styling:** Tailwind CSS for a modern, "Golden Ratio" inspired aesthetic.
- **State Management:** React Query (implied via API hooks) for server state synchronization.
- **Key Components:**
  - `Results.tsx`: Sophisticated report card view using Radar charts and Heatmaps.
  - `AdminDashboard.tsx`: Interface for managing and refining the rule set.

---

## 3. The AI Pipeline (The 'Engine')

The heart of the system is a multi-stage AI pipeline designed for precision and context awareness.

### 3.1 Token-Based Chunking (Context Management)

To handle large compliance documents within LLM context windows without losing meaning, the **Context Engineering Service** (`preprocessing_service.py`) implements advanced chunking:

- **Tokenizer:** Uses `tiktoken` (cl100k_base) for precise token counting, falling back to HuggingFace `transformers`.
- **Logic:**
  1.  **Segmentation:** Splits text into sentences (using `spaCy` or regex).
  2.  **Greedy Packing:** packs sentences into chunks (default 900 tokens).
  3.  **Overlap:** Maintains a sliding window overlap (200 tokens) to preserve cross-chunk context.
  4.  **Metadata:** Tags chunks with page numbers (PDF) or offsets for precise violation location tracking.

### 3.2 Compliance Engine & Scoring

The `ComplianceEngine` acts as a central orchestrator:

1.  **State Initialization:** Creates a `ComplianceState` object to track progress.
2.  **Sub-Agent Dispatch:** Dynamically spawns specialized sub-agents based on active rule categories (Factor 10: Configurable Sub-Agents).
3.  **Analysis:** Agents process chunks against loaded rules using LLMs (e.g., Gemini 2.0 Flash).
4.  **Scoring Strategy:**
    Violations are aggregated and scored using a weighted multi-dimensional model:
    - **IRDAI (Regulatory):** 50% weight (Critical for legal safety)
    - **Brand Guidelines:** 30% weight (Voice & Identity)
    - **SEO Best Practices:** 20% weight (Discoverability)
      _Final Grades (A-F) are derived from these weighted scores._

### 3.3 Rule Generator (Phase 2)

Allows "Zero-Touch" rule creation from raw documents:

1.  **Ingestion:** Parses uploaded PDF/DOCX files.
2.  **Extraction:** LLM analyzes content to identify prescriptive statements.
3.  **Structuring:** Converts unstructured text into JSON objects with:
    - `category` (IRDAI/Brand/SEO)
    - `severity` (Critical/High/Medium/Low)
    - `keywords`
    - `logic` (Pattern matching conditions - Phase 3)
4.  **Refinement:** Includes an AI-powered refinement loop for Super Admins to polish rule definitions before deployment.

---

## 4. Data Architecture

### PostgreSQL 15 Schema

The database is designed for flexibility, leveraging `JSONB` for evolving AI requirements.

- **`rules` table:** Stores compliance logic.
  - `rule_text`: Natural language description.
  - `pattern`: `JSONB` field storing structured conditions or regex for hybrid checking.
  - `is_active`: Soft-delete mechanism.
- **`submissions` table:** Tracks document state (Uploaded -> Preprocessing -> Analyzed).
- **`compliance_checks` & `violations`:** Relational storage for audit trails.
- **`agent_executions`:** Logs every AI interaction (tokens, latency, prompt) for observability.

### Redis 7

- Used as a backing store for **LangGraph** checkpoints (persistence layer) to enable Human-in-the-Loop (HITL) workflows like pausing analysis for user review.
- Acts as the message broker for asynchronous processing queues (Celery/background tasks).

---

## 5. Component Breakdown

### Backend Map

- **`services/compliance_engine.py`**: The "Brain". Orchestrates the checking flow, manages state, and persists results.
- **`services/rule_generator_service.py`**: The "Teacher". Extracts new logic from documents.
- **`services/preprocessing_service.py`**: The "Librarian". Chunks and indexes content.
- **`api/routes/`**:
  - `/compliance`: Endpoints for starting checks (`POST /analyze/{id}`) and retrieving results.
  - `/admin`: Implementation of rule management (CRUD).

### Frontend Structure

- **Results Dashboard (`pages/Results.tsx`)**:
  - Displays the "Report Card" with A-F grades.
  - Interactive "Detailed Violations" tab showing exact text overlays.
  - "Deep Research" tab for complex reasoning traces.
- **Admin Dashboard (`pages/AdminDashboard.tsx`)**:
  - Table view of active rules.
  - Stats cards for rule coverage (System Health).

---

## 6. Security & Access Control

The POC implements a lightweight but robust security model suitable for demonstration and internal use.

### Authentication

- **Header-Based Auth:** identification is handled via the `X-User-Id` header.
- **Middleware:** `get_current_user_id` dependency in `dpes.py` validates this header on every protected request.
- **Auto-Provisioning:** For the POC, if a valid UUID is passed in `X-User-Id` that doesn't exist, a "Default User" is automatically provisioned to facilitate frictionless testing.

### Role-Based Access Control (RBAC)

- **Roles:** `super_admin`, `standard_user`.
- **Enforcement:**
  - **Super Admin:** Full access to Rule Generation, Deletion, and System Configuration.
  - **Standard User:** Can upload submissions and view results but _cannot_ modify the Global Rule Set.
  - _Implementation:_ `require_super_admin` logic in `RuleGeneratorService`.

---

## 7. Implementation Roadmap

- **Phase 1: Core Engine (Completed)**

  - PDF/Text ingestion
  - Basic Rule implementation
  - MVP Results Dashboard

- **Phase 2: Dynamic Rules & Admin (Current)**

  - Rule Generator (LLM Extraction)
  - Admin Dashboard
  - Token-based Chunking

- **Phase 3: Deep Analysis & Verification (Next)**
  - "Enterprise Architect" Agent for complex, cross-document reasoning.
  - Automated Regression Testing for rules.
  - Hybrid Rule Logic (combining Regex + Semantic Search).
