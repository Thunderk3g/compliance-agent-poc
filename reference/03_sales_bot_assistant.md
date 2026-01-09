# AI Insurance Sales Bot

**Repository**: [abhi00123/Sales-Bot-Assistant](https://github.com/abhi00123/Sales-Bot-Assistant)

## Overview

A React + FastAPI application powered by local **Ollama (Mistral)** to serve as a customer-facing insurance sales assistant. Helps customers understand insurance products through conversational AI.

## Problem Statement

Insurance products are complex. Customers need:

- Clear explanations of policy features
- Answers to common questions
- Guidance on product selection
- 24/7 availability

## Solution Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    React UI     │────▶│    FastAPI      │────▶│    Ollama       │
│  (Vite + CSS)   │     │   (Backend)     │     │   (Mistral)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                                               │
        │           ┌───────────────────────────────────┘
        │           │
        ▼           ▼
┌─────────────────────┐
│  Insurance Context  │
│  (System Prompt)    │
└─────────────────────┘
```

## Key Features

### 1. Local LLM Execution

- Uses **Ollama** for running Mistral locally
- No cloud API costs
- Data privacy maintained

### 2. Multi-Language Support

- Language selector (EN/HI)
- Context adjusts based on language choice

### 3. Professional Styling

- Insurance-themed bot persona
- Tailwind CSS for modern UI

## Tech Stack

| Layer     | Technology                  |
| --------- | --------------------------- |
| Frontend  | React + Vite + Tailwind CSS |
| Backend   | FastAPI (Python)            |
| LLM       | Ollama (Mistral model)      |
| Transport | REST API (HTTP)             |

## Project Structure

```
Sales-Bot-Assistant/
├── backend/
│   ├── main.py          # FastAPI server
│   └── requirements.txt
└── frontend/
    ├── src/             # React components
    ├── package.json
    └── tailwind.config.js
```

## Setup

### Prerequisites

1. **Ollama** must be installed and running
2. **Node.js** for frontend
3. **Python** for backend

### Steps

```bash
# 1. Install Ollama from ollama.com
# 2. Pull Mistral model
ollama pull mistral

# 3. Keep Ollama running
ollama serve

# 4. Backend setup
cd backend
pip install -r requirements.txt
python main.py  # Starts at http://localhost:8000

# 5. Frontend setup
cd frontend
npm install
npm run dev  # Starts at http://localhost:5173
```

## Usage Flow

1. Open frontend URL
2. Select language (EN/HI)
3. Type insurance-related questions
4. Bot responds as professional insurance assistant

## Concepts for Reuse

### 1. System Prompt Engineering

The bot is configured with insurance-specific context:

```python
SYSTEM_PROMPT = """
You are a professional insurance sales assistant for [Company].
You help customers understand:
- Term Life Insurance
- Health Insurance
- ULIP plans
- Motor Insurance

Guidelines:
- Be helpful and informative
- Never make false promises
- Always recommend consulting an advisor for complex cases
- Comply with IRDAI regulations
"""
```

### 2. Ollama Integration Pattern

```python
import ollama

def chat_with_model(messages: list):
    response = ollama.chat(
        model='mistral',
        messages=messages
    )
    return response['message']['content']
```

### 3. Conversation Management

```python
class ConversationManager:
    def __init__(self):
        self.history = []

    def add_message(self, role: str, content: str):
        self.history.append({"role": role, "content": content})

    def get_response(self, user_input: str) -> str:
        self.add_message("user", user_input)
        response = chat_with_model(self.history)
        self.add_message("assistant", response)
        return response
```

## Integration Points

| For Your Project | How to Use                                                  |
| ---------------- | ----------------------------------------------------------- |
| LLM Service      | Pattern for Ollama integration as alternative to cloud LLMs |
| Conversation UI  | React chat component patterns                               |
| System Prompts   | Insurance-specific prompt structures                        |

## Key Learnings

1. **Local LLMs**: Ollama provides easy local LLM deployment
2. **Cost Efficiency**: No API costs for high-volume use cases
3. **Privacy**: Data never leaves the local environment
4. **Latency**: May be slower than cloud APIs depending on hardware

## Limitations

- Mistral 7B is smaller than GPT-4, may have less capability
- Requires local GPU/CPU resources
- No built-in RAG or document retrieval
- Single-turn context (needs conversation history management)
