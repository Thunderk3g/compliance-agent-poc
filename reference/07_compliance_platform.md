# Compliance AI Platform (POC)

**Repository**: [tanish-24-git/Compliance-AI-Platform-POC-](https://github.com/tanish-24-git/Compliance-AI-Platform-POC-)

## Overview

**Automated Compliance & Content Generation** for the Insurance Industry. An AI-powered platform that enables insurance agents to generate marketing content that is automatically validated against strictly enforced compliance rules (IRDAI/Brand Guidelines).

> **Note**: This is the most similar project to your current compliance-agent-poc project and serves as a direct reference implementation.

## Problem Statement

Insurance marketing content must comply with:

- **IRDAI regulations** (Insurance Regulatory and Development Authority)
- **Brand guidelines** (tone, messaging, approved language)
- **Legal requirements** (disclaimers, disclosures)

Manual compliance checking is:

- Time-consuming and error-prone
- Bottleneck for marketing teams
- Inconsistent across reviewers

## Solution: RAG-Powered Compliance

```
┌───────────────────────────────────────────────────────────────┐
│                    Content Generation Flow                     │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  User Request                                                 │
│       │                                                       │
│       ▼                                                       │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐               │
│  │ Content  │───▶│   RAG    │───▶│ Compliant│               │
│  │ Service  │    │ w/Rules  │    │ Content  │               │
│  └──────────┘    └──────────┘    └──────────┘               │
│                        ▲                                      │
│                        │                                      │
│                  ┌─────┴─────┐                               │
│                  │ Pinecone  │                               │
│                  │ (Rules)   │                               │
│                  └───────────┘                               │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                    Compliance Check Flow                       │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Document Upload                                              │
│       │                                                       │
│       ▼                                                       │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐               │
│  │Compliance│───▶│Deterministic│─▶│ AI-Based │               │
│  │ Service  │    │  Checks   │   │  Checks  │               │
│  └──────────┘    └──────────┘   └──────────┘               │
│                        │              │                       │
│                        └──────┬───────┘                       │
│                               ▼                               │
│                       ┌──────────┐                           │
│                       │ Violation│                           │
│                       │  Report  │                           │
│                       └──────────┘                           │
└───────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. Compliance-Aware Generation

- Uses RAG (Retrieval Augmented Generation)
- Generates content that inherently understands regulatory context
- Reduces need for post-generation corrections

### 2. Automated Verification

- **Deterministic checks**: Pattern matching, keyword detection
- **AI-based checks**: Semantic similarity, intent analysis
- Combined for comprehensive coverage

### 3. Rule Extraction

- Automatically ingests PDF regulatory documents
- Extracts executable compliance rules
- Stores in vector database for semantic search

### 4. Multi-LLM Support

- Configurable backend (Groq or Gemini)
- Fallback mechanisms
- Different models for different tasks

## Architecture

### Services

| Service                | Purpose                        |
| ---------------------- | ------------------------------ |
| **Content Service**    | Generates and purifies content |
| **Compliance Service** | Checks existing documents      |
| **Rule Service**       | Manages rule lifecycle         |

### Tech Stack

| Component        | Technology                       |
| ---------------- | -------------------------------- |
| Frontend         | React + TypeScript               |
| Backend          | FastAPI (Python)                 |
| Database         | PostgreSQL                       |
| Vector DB        | Pinecone                         |
| LLM              | Groq (Llama 3.3) / Google Gemini |
| Containerization | Docker Compose                   |

## Configuration

```env
DATABASE_URL=postgresql://postgres:postgres@compliance-db:5432/compliance_db
PINECONE_API_KEY=your_key
PINECONE_ENV=your_env
GROQ_API_KEY=your_key
GEMINI_API_KEY=your_key
DEFAULT_LLM_PROVIDER=groq
REVIEWER_LLM_PROVIDER=groq
SEMANTIC_SIMILARITY_THRESHOLD=0.85
```

## Comparison with Your Project

| Feature       | This POC              | Your compliance-agent-poc |
| ------------- | --------------------- | ------------------------- |
| Vector DB     | Pinecone              | PostgreSQL (pgvector?)    |
| LLM           | Groq/Gemini           | Gemini                    |
| Rule Storage  | Pinecone + PostgreSQL | PostgreSQL                |
| Orchestration | Simple flow           | LangGraph state machine   |
| HITL          | Not mentioned         | Implemented               |
| Scoring       | Not detailed          | Multi-dimensional         |
| Content Gen   | Yes                   | No (check only)           |

## Key Patterns to Adopt

### 1. Rule Extraction from PDFs

```python
class RuleExtractor:
    def extract_rules(self, pdf_path: str) -> List[Rule]:
        """
        1. Parse PDF to text
        2. Use LLM to identify rule statements
        3. Structure as executable rules
        4. Store in vector DB for retrieval
        """
        text = self.parse_pdf(pdf_path)

        prompt = """
        Extract compliance rules from the following regulatory document.
        For each rule, provide:
        - rule_id: Unique identifier
        - category: (disclosure, claims, pricing, etc.)
        - description: What must be complied with
        - keywords: Trigger words to detect violations
        - severity: (critical, major, minor)
        """

        rules = self.llm.extract(prompt, text)
        return rules
```

### 2. Semantic Rule Matching

```python
class SemanticMatcher:
    def find_relevant_rules(self, content: str, threshold: float = 0.85):
        """
        Find rules semantically similar to content
        """
        content_embedding = self.embed(content)

        # Search Pinecone for similar rule embeddings
        results = self.vector_db.query(
            vector=content_embedding,
            top_k=10,
            include_metadata=True
        )

        return [r for r in results if r.score >= threshold]
```

### 3. Compliance-Aware Content Generation

```python
class ContentGenerator:
    def generate_compliant_content(self, request: ContentRequest):
        # 1. Retrieve relevant rules
        rules = self.rule_service.get_rules_for_category(request.category)

        # 2. Build RAG prompt with rules
        prompt = f"""
        Generate marketing content for: {request.topic}

        COMPLIANCE RULES TO FOLLOW:
        {self.format_rules(rules)}

        REQUIREMENTS:
        - Must include required disclaimers
        - Must not make guarantee claims
        - Must use approved terminology

        Generate compliant content:
        """

        # 3. Generate with context
        content = self.llm.generate(prompt)

        # 4. Self-check before returning
        violations = self.compliance_service.check(content)

        if violations:
            # Regenerate or flag
            content = self.fix_violations(content, violations)

        return content
```

## Integration Points

| Concept            | How to Apply                                              |
| ------------------ | --------------------------------------------------------- |
| Rule Extraction    | Enhance your rule_generator to use similar LLM extraction |
| Pinecone           | Consider for faster semantic search vs pgvector           |
| Content Generation | Add content generation mode to your platform              |
| Dual LLM           | Use different models for generation vs verification       |

## Setup

```bash
# Clone and configure
git clone <repo-url>
cd poc
cp .env.example .env
# Fill in API keys

# Run with Docker
docker compose up -d --build

# Access
# Frontend: http://localhost:3000
# Backend: http://localhost:8000/docs
```

## Key Learnings

1. **RAG for Rules**: Semantic retrieval is more robust than keyword matching
2. **Dual Checks**: Combine deterministic + AI for best coverage
3. **Self-Verification**: Generate then check, fix if needed
4. **Multi-LLM**: Different models excel at different tasks
5. **Similarity Threshold**: 0.85 is a good starting point for semantic matching
