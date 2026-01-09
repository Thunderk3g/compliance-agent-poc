# RAG Architecture Patterns

## What is RAG?

**RAG (Retrieval Augmented Generation)** is a technique that enhances LLM responses by:

1. Retrieving relevant documents from a knowledge base
2. Augmenting the prompt with this context
3. Generating responses grounded in the retrieved information

## Why RAG?

| Problem              | RAG Solution                        |
| -------------------- | ----------------------------------- |
| LLM hallucinations   | Ground responses in real documents  |
| Outdated knowledge   | Always use latest documents         |
| Domain-specific info | Inject company knowledge            |
| Traceability         | Cite sources for answers            |
| Privacy              | Keep data in-house, not in training |

## Basic RAG Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        INDEXING PHASE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐     │
│  │ Documents│──▶│ Chunking │──▶│Embedding │──▶│ Vector   │     │
│  │          │   │          │   │  Model   │   │ Database │     │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        RETRIEVAL PHASE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐     │
│  │  Query   │──▶│ Embed    │──▶│ Vector   │──▶│ Top-K    │     │
│  │          │   │  Query   │   │  Search  │   │ Documents│     │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘     │
│                                                   │              │
│                                                   ▼              │
│                                            ┌──────────┐         │
│                                            │ Context  │         │
│                                            │ Window   │         │
│                                            └──────────┘         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       GENERATION PHASE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐     │
│  │ System   │ + │ Context  │ + │  Query   │──▶│   LLM    │     │
│  │ Prompt   │   │ (Docs)   │   │          │   │ Response │     │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Document Chunking

Split documents into manageable pieces.

```python
# Token-based chunking (your project uses this via tiktoken)
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

def chunk_by_tokens(text: str, max_tokens: int = 512, overlap: int = 50):
    tokens = tokenizer.encode(text)
    chunks = []

    for i in range(0, len(tokens), max_tokens - overlap):
        chunk_tokens = tokens[i:i + max_tokens]
        chunk_text = tokenizer.decode(chunk_tokens)
        chunks.append(chunk_text)

    return chunks
```

**Chunking Strategies:**

| Strategy        | Use Case                                         |
| --------------- | ------------------------------------------------ |
| Token-based     | Consistent size for embedding models             |
| Sentence-based  | Preserve semantic units                          |
| Paragraph-based | Longer context, fewer chunks                     |
| Recursive       | Hierarchical (headings → paragraphs → sentences) |
| Semantic        | Split by topic/meaning change                    |

### 2. Embedding Models

Convert text to vectors for similarity search.

```python
# Using sentence-transformers (local)
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')
embedding = model.encode("Your text here")

# Using OpenAI
import openai
response = openai.Embedding.create(
    model="text-embedding-ada-002",
    input="Your text here"
)
embedding = response['data'][0]['embedding']
```

**Popular Embedding Models:**

| Model                  | Dimension | Provider              |
| ---------------------- | --------- | --------------------- |
| text-embedding-ada-002 | 1536      | OpenAI                |
| text-embedding-3-small | 1536      | OpenAI                |
| all-MiniLM-L6-v2       | 384       | Sentence Transformers |
| e5-large-v2            | 1024      | Microsoft             |

### 3. Vector Database

Store and search embeddings.

```python
# Pinecone (cloud)
import pinecone

pinecone.init(api_key="key", environment="env")
index = pinecone.Index("compliance-rules")

# Upsert
index.upsert(vectors=[
    {"id": "rule-1", "values": embedding, "metadata": {"category": "disclosure"}}
])

# Query
results = index.query(query_embedding, top_k=5, include_metadata=True)
```

**Vector DB Options:**

| Database | Type   | Best For                    |
| -------- | ------ | --------------------------- |
| Pinecone | Cloud  | Production, scalability     |
| Chroma   | Local  | Development, prototyping    |
| FAISS    | Local  | In-memory, high performance |
| pgvector | SQL    | PostgreSQL integration      |
| Weaviate | Hybrid | Multi-modal, GraphQL        |

### 4. Retrieval Strategies

```python
# Basic similarity search
results = vector_db.similarity_search(query, k=5)

# Hybrid search (keyword + semantic)
keyword_results = bm25_search(query)
semantic_results = vector_db.search(query)
combined = reciprocal_rank_fusion(keyword_results, semantic_results)

# Re-ranking
initial_results = vector_db.search(query, k=20)
reranked = reranker_model.rerank(query, initial_results)[:5]
```

### 5. Prompt Construction

```python
def build_rag_prompt(query: str, context: List[str]) -> str:
    context_str = "\n\n".join([
        f"Document {i+1}:\n{doc}"
        for i, doc in enumerate(context)
    ])

    return f"""You are a compliance assistant. Use the following context to answer the question.
If the answer is not in the context, say "I don't have that information."

CONTEXT:
{context_str}

QUESTION: {query}

ANSWER:"""
```

## Advanced RAG Patterns

### Pattern 1: Self-Query RAG

Extract metadata filters from the query.

```python
# Query: "Show me IRDAI rules from 2023 about disclosures"
# Extracted:
# - semantic_query: "IRDAI rules disclosures"
# - filters: {"year": 2023, "category": "disclosure"}
```

### Pattern 2: Multi-Query RAG

Generate multiple query variations.

```python
def multi_query_rag(original_query: str):
    # Generate variations
    variations = llm.generate_variations(original_query)
    # ["What are IRDAI disclosure rules?",
    #  "Mandatory disclosures for insurance",
    #  "IRDAI requirements for policy documents"]

    # Retrieve for each
    all_results = []
    for q in variations:
        results = vector_db.search(q)
        all_results.extend(results)

    # Deduplicate and rank
    return deduplicate_and_rank(all_results)
```

### Pattern 3: Hierarchical RAG

Two-stage retrieval: summary → detail.

```python
# Stage 1: Find relevant documents
doc_summaries = summary_index.search(query)
relevant_doc_ids = [s.doc_id for s in doc_summaries]

# Stage 2: Search within those documents
detailed_chunks = chunk_index.search(
    query,
    filter={"doc_id": {"$in": relevant_doc_ids}}
)
```

### Pattern 4: RAG with Citations

Track sources for transparency.

```python
def rag_with_citations(query: str):
    chunks = retrieve(query)

    # Build prompt with source markers
    context = ""
    for i, chunk in enumerate(chunks):
        context += f"[Source {i+1}] {chunk.text}\n\n"

    response = llm.generate(
        f"Answer using the sources. Cite them as [Source N].\n\n{context}\n\nQuestion: {query}"
    )

    return {
        "answer": response,
        "sources": [{"id": i+1, "text": c.text, "file": c.metadata.get("file")}
                    for i, c in enumerate(chunks)]
    }
```

## RAG for Compliance Checking

### Architecture

```
Document Upload
       │
       ▼
┌──────────────┐
│   Chunking   │  ← Split document into chunks
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   For Each   │
│    Chunk     │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│   Retrieve   │────▶│  Relevant    │
│    Rules     │     │    Rules     │
└──────────────┘     └──────┬───────┘
                            │
                     ┌──────▼───────┐
                     │   Check for  │
                     │  Violations  │
                     └──────┬───────┘
                            │
                     ┌──────▼───────┐
                     │   Compile    │
                     │   Report     │
                     └──────────────┘
```

### Implementation

```python
class ComplianceRAG:
    def check_document(self, document: str) -> ComplianceReport:
        # 1. Chunk the document
        chunks = self.chunker.split(document)

        violations = []
        for chunk in chunks:
            # 2. Find relevant rules for this chunk
            rules = self.rule_retriever.find_rules(chunk.text)

            # 3. Check chunk against each rule
            for rule in rules:
                violation = self.check_rule(chunk, rule)
                if violation:
                    violations.append(violation)

        # 4. Compile report
        return ComplianceReport(
            violations=violations,
            score=self.calculate_score(violations)
        )
```

## Best Practices

1. **Chunk Size**: Match to embedding model's optimal input
2. **Overlap**: 10-20% overlap prevents context loss
3. **Metadata**: Enrich chunks with source, page, category
4. **Evaluation**: Test retrieval quality with known queries
5. **Caching**: Cache frequent queries and embeddings
6. **Fallback**: Handle cases when nothing relevant is found
