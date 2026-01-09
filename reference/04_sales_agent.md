# SalesAgent - RAG Sales Agent Chatbot

**Repository**: [nikhilgaikwad2321/SalesAgent](https://github.com/nikhilgaikwad2321/SalesAgent)

## Overview

A **POC for RAG (Retrieval Augmented Generation) sales agent chatbot**. Unlike simple chatbots, this uses a knowledge base to ground responses in actual product/company information.

## What is RAG?

RAG (Retrieval Augmented Generation) combines:

1. **Retrieval**: Search a knowledge base for relevant documents
2. **Augmentation**: Inject retrieved context into LLM prompt
3. **Generation**: LLM generates response based on context

```
User Query
    │
    ▼
┌─────────────┐     ┌─────────────┐
│   Vector    │────▶│   Relevant  │
│   Search    │     │  Documents  │
└─────────────┘     └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Augmented  │
                    │   Prompt    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │     LLM     │
                    │  Response   │
                    └─────────────┘
```

## Project Structure

```
SalesAgent/
├── backend/      # FastAPI backend with RAG logic
├── frontend/     # User interface
└── llm-runtime/  # LLM execution environment
```

## Why RAG for Sales?

### Problem with Vanilla LLMs

- May hallucinate product details
- Outdated training data
- Can't access company-specific information
- Inconsistent responses about policies

### RAG Solution

- Grounds responses in actual product documents
- Can be updated without retraining
- Provides traceable sources
- Consistent, accurate information

## RAG Architecture Pattern

### 1. Document Ingestion

```python
def ingest_documents(documents: List[str]):
    """
    1. Split documents into chunks
    2. Generate embeddings for each chunk
    3. Store in vector database
    """
    chunks = text_splitter.split(documents)
    embeddings = embedding_model.embed(chunks)
    vector_db.upsert(chunks, embeddings)
```

### 2. Query Processing

```python
def process_query(query: str) -> str:
    """
    1. Embed user query
    2. Search vector DB for similar chunks
    3. Build context from retrieved chunks
    4. Generate response with context
    """
    query_embedding = embedding_model.embed(query)
    relevant_chunks = vector_db.search(query_embedding, top_k=5)

    prompt = f"""
    Context: {relevant_chunks}

    User Question: {query}

    Answer based on the context provided:
    """

    return llm.generate(prompt)
```

### 3. Response Generation

```python
def generate_sales_response(query: str, context: List[str]) -> str:
    system_prompt = """
    You are a sales assistant. Use the provided context to answer questions.
    If the answer is not in the context, say "I don't have that information."
    Never make up product details.
    """

    return llm.chat(
        system=system_prompt,
        context=context,
        query=query
    )
```

## Integration Points

| For Your Project   | How to Use                            |
| ------------------ | ------------------------------------- |
| Compliance Engine  | RAG pattern for rule retrieval        |
| Rule Service       | Store rules as retrievable documents  |
| Content Generation | Ground generation in approved content |

## Key Concepts

### 1. Chunking Strategy

- **Token-based**: Split by token count (your project uses this)
- **Semantic**: Split by meaning/paragraphs
- **Overlap**: Include overlapping content between chunks

### 2. Embedding Models

- OpenAI text-embedding-ada-002
- Sentence Transformers (local)
- Cohere Embed

### 3. Vector Databases

- Pinecone (cloud)
- Chroma (local)
- FAISS (local, lightweight)
- PostgreSQL pgvector (SQL + vector)

### 4. Retrieval Strategies

- **Similarity Search**: Nearest neighbors
- **Hybrid Search**: Combine keyword + semantic
- **Re-ranking**: Score and reorder results

## Benefits for Insurance Sales

| Benefit      | Description                                   |
| ------------ | --------------------------------------------- |
| Accuracy     | Responses grounded in actual policy documents |
| Compliance   | Can restrict to approved marketing language   |
| Traceability | Source documents can be cited                 |
| Updates      | New products added without retraining         |

## Example Use Case

**User**: "What's the premium for a 25-year-old for term insurance?"

**Without RAG**: "It varies..." (generic, unhelpful)

**With RAG**:

1. Retrieves: Premium tables, age-based rates
2. Augments prompt with actual rate information
3. Generates: "For a 25-year-old, term insurance premiums start at ₹500/month for 50L coverage..."
