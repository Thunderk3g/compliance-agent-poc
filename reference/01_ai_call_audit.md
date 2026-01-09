# AI Call Audit System

**Repository**: [rohanpatil-prog/AI-Call-Audit](https://github.com/rohanpatil-prog/AI-Call-Audit)

## Overview

AI-powered call audit system for **Bajaj Life Insurance** that automatically detects miss-selling, compliance breaches, and script deviations in agent–customer calls using speech-to-text and LLM-based analysis.

## Problem Statement

Insurance call centers need to audit agent calls for:

- **Miss-selling**: Agents misrepresenting product features
- **Compliance breaches**: Regulatory violations (IRDAI)
- **Script deviations**: Agents not following approved scripts

Manual auditing is time-consuming, inconsistent, and doesn't scale.

## Solution Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Call Audio  │────▶│ Speech-to-   │────▶│    LLM       │
│   Uploads    │     │    Text      │     │  Analysis    │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                          ┌──────▼──────┐
                                          │  Compliance │
                                          │   Report    │
                                          └─────────────┘
```

## Key Features

### 1. Speech-to-Text Transcription

- Converts audio call recordings to text
- Handles multiple speakers (agent vs customer)
- Supports various audio formats

### 2. LLM-Based Analysis

- **Miss-selling Detection**: Identifies false promises, exaggerated claims
- **Compliance Checking**: Validates against regulatory requirements
- **Script Adherence**: Compares agent speech to approved scripts

### 3. Automated Reporting

- Generates audit reports with flagged violations
- Provides evidence snippets from transcripts
- Categorizes issues by severity

## Tech Stack

| Component     | Technology        |
| ------------- | ----------------- |
| Framework     | Node.js           |
| LLM           | Google Gemini API |
| Configuration | .env.local        |

## Setup

```bash
# Install dependencies
npm install

# Set API key in .env.local
GEMINI_API_KEY=your_key_here

# Run the app
npm run dev
```

## Concepts for Reuse

### 1. Audio Processing Pipeline

```
Audio Upload → Format Validation → STT → Diarization → Transcript
```

### 2. Compliance Rule Matching

The LLM analyzes transcripts against:

- Regulatory requirements (IRDAI guidelines)
- Sales script templates
- Product benefit claims

### 3. Violation Detection Patterns

- **Promised Returns**: Detecting guaranteed return claims (illegal for ULIPs)
- **Omission of Risks**: Not disclosing policy exclusions
- **Pressure Tactics**: Urgency-based selling patterns

## Integration Points

| For Your Project    | How to Use                                            |
| ------------------- | ----------------------------------------------------- |
| Compliance Engine   | Apply same LLM analysis patterns for document content |
| Rule Engine         | Structure rules similar to call script validation     |
| Violation Detection | Reuse severity categorization logic                   |

## Key Learnings

1. **Structured Prompting**: Use detailed prompts with specific violation categories
2. **Evidence Extraction**: Always return the exact text that triggered a violation
3. **Multi-dimensional Analysis**: Check multiple compliance aspects in parallel
