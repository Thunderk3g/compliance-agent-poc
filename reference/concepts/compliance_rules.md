# Compliance Rules - Concepts & Patterns

## What is a Compliance Rule?

A compliance rule is a structured representation of a regulatory or business requirement that can be:

1. **Checked** against content (documents, calls, actions)
2. **Enforced** automatically or with human oversight
3. **Traced** back to its source regulation

## Rule Anatomy

```json
{
  "id": "IRDAI-DISC-001",
  "category": "disclosure",
  "severity": "critical",
  "source": "IRDAI Master Circular 2023",
  "description": "All marketing materials must include risk disclosure disclaimer",
  "check_type": "must_include",
  "pattern": "Investment in securities are subject to market risks",
  "variations": [
    "Investments are subject to market risks",
    "Market risks apply to all investments"
  ],
  "applies_to": ["marketing", "advertisement", "brochure"],
  "active": true
}
```

## Rule Categories for Insurance

| Category         | Description                           | Severity |
| ---------------- | ------------------------------------- | -------- |
| **Disclosure**   | Required disclaimers and warnings     | Critical |
| **Claims**       | What can/cannot be promised           | Critical |
| **Branding**     | Logo usage, colors, approved language | Major    |
| **Pricing**      | Premium/benefit presentation          | Critical |
| **Comparisons**  | Competitor references                 | Major    |
| **Testimonials** | Customer quote requirements           | Minor    |

## Rule Types

### 1. Must Include Rules

Content MUST contain specific elements.

```python
class MustIncludeRule:
    pattern: str  # Required text or pattern
    variations: List[str]  # Acceptable variations

    def check(self, content: str) -> Optional[Violation]:
        if not self.contains_any(content, [self.pattern] + self.variations):
            return Violation(
                rule_id=self.id,
                type="missing_required",
                message=f"Missing required: {self.description}"
            )
        return None
```

### 2. Must Not Include Rules

Content MUST NOT contain prohibited elements.

```python
class MustNotIncludeRule:
    prohibited_patterns: List[str]

    def check(self, content: str) -> Optional[Violation]:
        for pattern in self.prohibited_patterns:
            if pattern.lower() in content.lower():
                return Violation(
                    rule_id=self.id,
                    type="prohibited_content",
                    message=f"Prohibited content found: {pattern}",
                    evidence=self.extract_context(content, pattern)
                )
        return None
```

### 3. Semantic Rules

Check meaning, not just keywords.

```python
class SemanticRule:
    intent: str  # "guarantee_of_returns"
    threshold: float  # Similarity threshold

    def check(self, content: str, llm) -> Optional[Violation]:
        # Use LLM to detect semantic violations
        prompt = f"""
        Analyze if this content implies {self.intent}:

        Content: {content}

        Return JSON: {{"violates": bool, "evidence": str, "explanation": str}}
        """
        result = llm.analyze(prompt)

        if result.violates:
            return Violation(
                rule_id=self.id,
                type="semantic_violation",
                evidence=result.evidence,
                message=result.explanation
            )
        return None
```

### 4. Conditional Rules

Rules that apply based on context.

```python
class ConditionalRule:
    condition: str  # "if product_type == 'ULIP'"
    then_rule: Rule

    def check(self, content: str, context: dict) -> Optional[Violation]:
        if self.evaluate_condition(context):
            return self.then_rule.check(content)
        return None
```

## Rule Engine Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         RULE ENGINE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │    Rule      │    │    Rule      │    │    Rule      │      │
│  │   Loader     │───▶│   Matcher    │───▶│   Executor   │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                   │                │
│         ▼                   ▼                   ▼                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  PostgreSQL  │    │   Vector DB  │    │     LLM      │      │
│  │   (Rules)    │    │  (Semantic)  │    │  (Analysis)  │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │   Violations     │
                    │     Report       │
                    └──────────────────┘
```

## Rule Storage Schema

### PostgreSQL Schema (Your Project Pattern)

```sql
CREATE TABLE rules (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    category VARCHAR(50),
    name VARCHAR(255),
    description TEXT,
    severity VARCHAR(20),      -- critical, major, minor
    check_type VARCHAR(50),    -- must_include, must_not_include, semantic
    pattern TEXT,              -- For pattern-based rules
    rule_config JSONB,         -- Flexible configuration
    is_active BOOLEAN DEFAULT true,
    source_document VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Example JSONB for rule_config
{
    "keywords": ["guaranteed", "assured", "promise"],
    "variations": [],
    "semantic_intent": "claims of guaranteed returns",
    "applies_to_document_types": ["marketing", "brochure"],
    "llm_prompt_template": "Check if content makes..."
}
```

## Rule Matching Strategies

### Strategy 1: Keyword Matching

Fast, simple, but misses context.

```python
def keyword_match(content: str, keywords: List[str]) -> List[Match]:
    matches = []
    content_lower = content.lower()
    for keyword in keywords:
        if keyword.lower() in content_lower:
            matches.append(Match(keyword=keyword, position=content_lower.find(keyword.lower())))
    return matches
```

### Strategy 2: Regex Matching

More flexible patterns.

```python
import re

def regex_match(content: str, patterns: List[str]) -> List[Match]:
    matches = []
    for pattern in patterns:
        for m in re.finditer(pattern, content, re.IGNORECASE):
            matches.append(Match(
                matched_text=m.group(),
                start=m.start(),
                end=m.end()
            ))
    return matches
```

### Strategy 3: Semantic Similarity

Find conceptually similar content.

```python
def semantic_match(content: str, rule_embedding: List[float], threshold: float) -> bool:
    content_embedding = embed(content)
    similarity = cosine_similarity(content_embedding, rule_embedding)
    return similarity >= threshold
```

### Strategy 4: LLM-Based Analysis

Understanding intent and context.

```python
def llm_match(content: str, rule: Rule) -> Violation | None:
    prompt = f"""
    Analyze this content for compliance violations.

    RULE: {rule.description}
    VIOLATION TYPE: {rule.check_type}
    CONTEXT: {rule.context}

    CONTENT TO CHECK:
    {content}

    Does this content violate the rule? Explain your reasoning.
    Return JSON: {{"violates": bool, "confidence": float, "evidence": str, "explanation": str}}
    """

    result = llm.analyze(prompt)

    if result.violates and result.confidence > 0.7:
        return Violation(rule_id=rule.id, **result)
    return None
```

## Multi-Dimensional Scoring

### Your Project's Approach

```python
class MultiDimensionalScorer:
    dimensions = {
        "irdai_compliance": {"weight": 0.4, "rules": ["IRDAI-*"]},
        "brand_guidelines": {"weight": 0.3, "rules": ["BRAND-*"]},
        "seo_quality": {"weight": 0.2, "rules": ["SEO-*"]},
        "clarity": {"weight": 0.1, "rules": ["CLARITY-*"]}
    }

    def score(self, violations: List[Violation]) -> Dict[str, float]:
        scores = {}
        for dim, config in self.dimensions.items():
            dim_violations = [v for v in violations if v.rule_id.startswith(config["rules"])]
            raw_score = self.calculate_dimension_score(dim_violations)
            scores[dim] = raw_score * config["weight"]

        scores["overall"] = sum(scores.values())
        return scores
```

## Rule Lifecycle

```
┌──────────────────────────────────────────────────────────────────┐
│                       RULE LIFECYCLE                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐      │
│  │  DRAFT   │──▶│  REVIEW  │──▶│  ACTIVE  │──▶│ DEPRECATED│      │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘      │
│       │              │              │               │             │
│       │              │              │               │             │
│       ▼              ▼              ▼               ▼             │
│  Not applied   Tested only   Full enforcement   Logged only      │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Rule Extraction from Regulations

### Automated Extraction Pattern

```python
def extract_rules_from_pdf(pdf_path: str, llm) -> List[Rule]:
    # 1. Extract text from PDF
    text = pdf_parser.extract(pdf_path)

    # 2. Use LLM to identify rules
    prompt = """
    Extract compliance rules from this regulatory document.

    For each rule, provide:
    - id: Unique identifier (format: ORG-CATEGORY-NUMBER)
    - category: disclosure, claims, branding, etc.
    - description: What must be done/avoided
    - severity: critical, major, minor
    - check_type: must_include, must_not_include, semantic
    - keywords: Trigger words to detect

    Document:
    {text}

    Return as JSON array.
    """

    rules_json = llm.extract(prompt.format(text=text))
    return [Rule(**r) for r in rules_json]
```

## Best Practices

1. **Versioning**: Track rule changes over time
2. **Testing**: Test rules against known good/bad examples
3. **Hierarchy**: Group rules by source, category, severity
4. **Context**: Store what document types rules apply to
5. **Explanation**: Always provide user-friendly violation messages
6. **Evidence**: Extract and save the violating text snippet
7. **False Positives**: Track and learn from incorrect matches
