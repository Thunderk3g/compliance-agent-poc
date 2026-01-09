# Reference Projects - AI/Insurance Technology POCs

This folder contains comprehensive documentation and analysis of 7 GitHub repositories that demonstrate various AI-powered solutions for the insurance and business intelligence industry. These projects serve as reference implementations and inspiration for building compliance, sales, analytics, and automation systems.

## 📚 Repository Overview

| #   | Project                                                        | Domain                 | Core Technology          | Key Value                                         |
| --- | -------------------------------------------------------------- | ---------------------- | ------------------------ | ------------------------------------------------- |
| 1   | [AI-Call-Audit](./01_ai_call_audit.md)                         | Call Center Compliance | Speech-to-Text + LLM     | Miss-selling detection, script deviation analysis |
| 2   | [Agentic-LLM-Power-BI](./02_agentic_llm_powerbi.md)            | Business Intelligence  | Agentic LLM + Power BI   | Automated insights, anomaly detection             |
| 3   | [Sales-Bot-Assistant](./03_sales_bot_assistant.md)             | Customer Support       | React + FastAPI + Ollama | Insurance sales chatbot                           |
| 4   | [SalesAgent](./04_sales_agent.md)                              | Sales Automation       | RAG + LLM Runtime        | Knowledge-based sales chatbot                     |
| 5   | [AI-UnderWriting-Issuance-System](./05_underwriting_system.md) | Insurance Underwriting | Python + ML              | Risk prediction, policy issuance                  |
| 6   | [AI-Voice-Intelligence](./06_voice_intelligence.md)            | Voice Analytics        | Whisper + spaCy          | Speech-to-text, NER, sentiment                    |
| 7   | [Compliance-AI-Platform](./07_compliance_platform.md)          | Regulatory Compliance  | RAG + Vector DB          | Content generation, rule validation               |

## 🎯 Common Themes Across Projects

### 1. **Insurance Industry Focus**

All projects are designed for the insurance sector (primarily Bajaj Life Insurance), addressing:

- Regulatory compliance (IRDAI guidelines)
- Sales agent assistance and training
- Call quality monitoring
- Content marketing compliance
- Underwriting automation

### 2. **AI/LLM Integration Patterns**

- **RAG (Retrieval Augmented Generation)**: Used in compliance checking and sales assistance
- **Agentic Workflows**: Multi-step reasoning with autonomous task execution
- **Speech-to-Text**: Call transcription using Whisper or similar
- **LLM Providers**: Gemini, Groq (Llama 3.3), Mistral via Ollama

### 3. **Technology Stack Patterns**

- **Backend**: FastAPI (Python) - dominant choice
- **Frontend**: React + TypeScript, Streamlit
- **Database**: PostgreSQL for relational data
- **Vector Database**: Pinecone for semantic search
- **LLM Runtime**: Ollama for local models
- **Containerization**: Docker + Docker Compose

## 🏗️ Architecture Patterns

### Microservices Pattern

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│  Database   │
│  React/TS   │     │   FastAPI   │     │ PostgreSQL  │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────▼──────┐     ┌─────────────┐
                    │  LLM Layer  │────▶│  Vector DB  │
                    │Gemini/Groq  │     │  Pinecone   │
                    └─────────────┘     └─────────────┘
```

### Agentic Workflow Pattern

```
User Query → LLM Orchestrator → Agent Reasoning Loop → Tool Execution → Insight Generation → Response
```

## 🔧 Key Capabilities Matrix

| Capability         | Call Audit | Power BI | Sales Bot | SalesAgent | Underwriting | Voice Intel | Compliance |
| ------------------ | :--------: | :------: | :-------: | :--------: | :----------: | :---------: | :--------: |
| Speech-to-Text     |     ✅     |    ❌    |    ❌     |     ❌     |      ❌      |     ✅      |     ❌     |
| LLM Reasoning      |     ✅     |    ✅    |    ✅     |     ✅     |      ❌      |     ❌      |     ✅     |
| RAG                |     ❌     |    ❌    |    ❌     |     ✅     |      ❌      |     ❌      |     ✅     |
| Agentic Loop       |     ❌     |    ✅    |    ❌     |     ❌     |      ❌      |     ❌      |     ❌     |
| Vector Search      |     ❌     |    ❌    |    ❌     |     ❌     |      ❌      |     ❌      |     ✅     |
| Rule Engine        |     ✅     |    ❌    |    ❌     |     ❌     |      ❌      |     ❌      |     ✅     |
| Anomaly Detection  |     ❌     |    ✅    |    ❌     |     ❌     |      ❌      |     ❌      |     ❌     |
| Sentiment Analysis |     ✅     |    ❌    |    ❌     |     ❌     |      ❌      |     ✅      |     ❌     |
| NER                |     ❌     |    ❌    |    ❌     |     ❌     |      ❌      |     ✅      |     ❌     |
| Conversational UI  |     ❌     |    ✅    |    ✅     |     ✅     |      ❌      |     ❌      |     ❌     |

## 📁 Folder Structure

```
reference/
├── README.md                          # This file
├── 01_ai_call_audit.md               # Call auditing system
├── 02_agentic_llm_powerbi.md         # Power BI automation
├── 03_sales_bot_assistant.md         # Insurance sales chatbot
├── 04_sales_agent.md                 # RAG-based sales agent
├── 05_underwriting_system.md         # Underwriting prediction
├── 06_voice_intelligence.md          # Voice analytics platform
├── 07_compliance_platform.md         # Compliance AI platform
└── concepts/
    ├── agentic_workflows.md          # Agentic AI patterns
    ├── rag_architecture.md           # RAG implementation patterns
    ├── compliance_rules.md           # Rule engine concepts
    └── tech_stack_comparison.md      # Technology comparisons
```

## 🚀 Quick Reference by Use Case

### **"I want to audit call recordings"**

→ See [AI-Call-Audit](./01_ai_call_audit.md) + [AI-Voice-Intelligence](./06_voice_intelligence.md)

### **"I want to build a sales chatbot"**

→ See [Sales-Bot-Assistant](./03_sales_bot_assistant.md) + [SalesAgent](./04_sales_agent.md)

### **"I want to automate compliance checking"**

→ See [Compliance-AI-Platform](./07_compliance_platform.md) + [AI-Call-Audit](./01_ai_call_audit.md)

### **"I want to build an agentic AI system"**

→ See [Agentic-LLM-Power-BI](./02_agentic_llm_powerbi.md) + [concepts/agentic_workflows.md](./concepts/agentic_workflows.md)

### **"I want to automate underwriting"**

→ See [AI-UnderWriting-Issuance-System](./05_underwriting_system.md)
