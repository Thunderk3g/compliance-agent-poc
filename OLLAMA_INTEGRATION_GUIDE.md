# Ollama Integration Guide - eTouch II Insurance Backend

A comprehensive guide for building AI-powered applications with Ollama LLM integration, based on the Bajaj Allianz eTouch II Insurance Backend implementation.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Ollama Configuration](#ollama-configuration)
3. [API Integration Patterns](#api-integration-patterns)
4. [Port and Connection Management](#port-and-connection-management)
5. [Error Handling & Fallback Mechanisms](#error-handling--fallback-mechanisms)
6. [Conversation Context Management](#conversation-context-management)
7. [Implementation Examples](#implementation-examples)
8. [Best Practices](#best-practices)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Application                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Agent Orchestrator (Orchestration Layer)     │   │
│  │  - Manages conversation flow                        │   │
│  │  - Coordinates state transitions                    │   │
│  │  - Handles API calls                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Ollama Service (Integration Layer)           │   │
│  │  - HTTP client management                           │   │
│  │  - Prompt engineering                               │   │
│  │  - Response parsing                                 │   │
│  │  - Retry logic                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│                   HTTP/REST API                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   Ollama Server                              │
│              (Local LLM Runtime)                             │
│  - Model: qwen2.5:7b / llama3 / mistral                    │
│  - Port: 11434 (default)                                    │
│  - APIs: /api/chat, /api/generate, /api/tags               │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Service-Oriented Architecture**: Ollama integration is isolated in a dedicated service layer
2. **Async/Await Pattern**: All Ollama calls are asynchronous for better performance
3. **Context Awareness**: Conversation history and state are managed centrally
4. **Graceful Degradation**: Fallback responses when Ollama is unavailable
5. **API Abstraction**: Multiple Ollama API endpoints with automatic fallback

---

## Ollama Configuration

### Environment Configuration

**File: `app/config.py`**

```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Ollama connection settings
    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_model: str = "qwen2.5:7b"

    # Ollama service settings
    ollama_timeout: int = 30          # Request timeout in seconds
    ollama_max_retries: int = 3       # Number of retry attempts

    # CORS configuration for frontend
    api_cors_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
```

### Environment Variables (.env)

```bash
# Ollama Configuration
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:7b

# Alternative models you can use:
# OLLAMA_MODEL=llama3
# OLLAMA_MODEL=mistral
# OLLAMA_MODEL=qwen2.5:0.5b

# Service Configuration
OLLAMA_TIMEOUT=30
OLLAMA_MAX_RETRIES=3

# Application Settings
ENVIRONMENT=development
LOG_LEVEL=INFO
SESSION_SECRET_KEY=your-secret-key-change-in-production

# CORS Settings
API_CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Model Selection Guidelines

| Model | Size | Use Case | Performance |
|-------|------|----------|-------------|
| qwen2.5:0.5b | ~500MB | Lightweight, fast responses | Good for testing |
| qwen2.5:7b | ~7GB | Balanced performance | Production ready |
| llama3 | ~4-8GB | General purpose | Excellent quality |
| mistral | ~7GB | Coding & reasoning | High accuracy |

---

## API Integration Patterns

### OllamaService Class Structure

**File: `app/services/ollama_service.py`**

```python
import httpx
import json
import asyncio
from typing import Dict, Any, Optional, List

class OllamaService:
    """Service for integrating with Ollama LLM."""

    def __init__(self):
        self.base_url = settings.ollama_base_url
        self.model = settings.ollama_model
        self.timeout = settings.ollama_timeout
        self.max_retries = settings.ollama_max_retries
        self.client = httpx.AsyncClient(timeout=self.timeout)
        self.use_chat_api = True  # Try chat API first, fallback to generate
```

### Ollama API Endpoints

#### 1. Chat API (Recommended - Modern)

**Endpoint**: `POST /api/chat`

**Features**:
- Native conversation history support
- Message-based interface
- Better context management

**Request Format**:
```json
{
  "model": "qwen2.5:7b",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi! How can I help?"},
    {"role": "user", "content": "What is insurance?"}
  ],
  "stream": false
}
```

**Implementation**:
```python
async def _call_ollama_chat_with_messages(self, messages: List[Dict[str, str]]) -> str:
    url = f"{self.base_url}/api/chat"
    data = {
        "model": self.model,
        "messages": messages,
        "stream": False
    }

    response = await self.client.post(url, json=data)
    response.raise_for_status()
    result = response.json()
    return result.get("message", {}).get("content", "").strip()
```

#### 2. Generate API (Legacy - Fallback)

**Endpoint**: `POST /api/generate`

**Features**:
- Simple prompt-response interface
- Single string input
- Compatible with older Ollama versions

**Request Format**:
```json
{
  "model": "qwen2.5:7b",
  "prompt": "System: You are helpful.\nUser: What is insurance?",
  "stream": false
}
```

**Implementation**:
```python
async def _call_ollama_generate(self, prompt: str) -> str:
    url = f"{self.base_url}/api/generate"
    data = {
        "model": self.model,
        "prompt": prompt,
        "stream": False
    }

    response = await self.client.post(url, json=data)
    response.raise_for_status()
    result = response.json()
    return result.get("response", "").strip()
```

#### 3. Tags API (Health Check)

**Endpoint**: `GET /api/tags`

**Purpose**: Check available models and service health

**Implementation**:
```python
async def health_check(self) -> bool:
    try:
        url = f"{self.base_url}/api/tags"
        response = await self.client.get(url, timeout=5)
        if response.status_code != 200:
            return False

        tags_data = response.json()
        models = [model.get("name", "") for model in tags_data.get("models", [])]
        model_available = any(self.model in model for model in models)

        if not model_available:
            logger.warning(f"Model '{self.model}' not found")
            return False

        logger.info(f"✅ Ollama service available with model '{self.model}'")
        return True

    except Exception as e:
        logger.warning(f"Ollama health check failed: {str(e)}")
        return False
```

---

## Port and Connection Management

### Port Configuration

**Default Ollama Port**: `11434`

**Configuration Hierarchy**:
1. Environment variable: `OLLAMA_BASE_URL`
2. Config file default: `http://127.0.0.1:11434`
3. Runtime override: Passed to Settings()

### Connection Management

#### AsyncClient Lifecycle

```python
class OllamaService:
    def __init__(self):
        # Initialize persistent async client
        self.client = httpx.AsyncClient(timeout=self.timeout)

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        # Properly close the client
        await self.client.aclose()
```

#### Context Manager Usage

```python
# Proper resource management
async with OllamaService() as ollama:
    response = await ollama.generate_response("Hello")
```

### Network Configuration

#### Firewall Rules
```bash
# Allow Ollama port (Linux)
sudo ufw allow 11434/tcp

# Windows - Add inbound rule for port 11434
netsh advfirewall firewall add rule name="Ollama" dir=in action=allow protocol=TCP localport=11434
```

#### Docker Network
```yaml
# docker-compose.yml
services:
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    networks:
      - app-network

  backend:
    build: .
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
    networks:
      - app-network
    depends_on:
      - ollama

networks:
  app-network:
    driver: bridge
```

---

## Error Handling & Fallback Mechanisms

### Multi-Level Retry Strategy

```python
async def generate_response(self, prompt: str, system_prompt: str = None,
                          context: Dict[str, Any] = None) -> str:
    """Generate response from Ollama with retry mechanism."""
    for attempt in range(self.max_retries):
        try:
            if self.use_chat_api:
                messages = self._build_chat_messages(prompt, system_prompt, context)
                response = await self._call_ollama_chat_with_messages(messages)
            else:
                full_prompt = self._build_prompt(prompt, system_prompt, context)
                response = await self._call_ollama_generate(full_prompt)
            return response

        except Exception as e:
            logger.warning(f"Ollama attempt {attempt + 1} failed: {str(e)}")
            if attempt == self.max_retries - 1:
                logger.error(f"All Ollama attempts failed. Returning fallback response.")
                return self._get_fallback_response(prompt, context)

            # Exponential backoff: 1s, 2s, 4s
            await asyncio.sleep(2 ** attempt)
```

### Automatic API Fallback

```python
async def _call_ollama(self, prompt: str) -> str:
    """Make HTTP call to Ollama API with automatic fallback."""
    try:
        if self.use_chat_api:
            return await self._call_ollama_chat(prompt)
        else:
            return await self._call_ollama_generate(prompt)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404 and self.use_chat_api:
            # Fallback to generate API for older Ollama versions
            logger.info("Chat API not available, falling back to generate API")
            self.use_chat_api = False
            return await self._call_ollama_generate(prompt)
        raise
```

### Fallback Response System

```python
def _get_fallback_response(self, prompt: str, context: Dict[str, Any]) -> str:
    """Get fallback response when Ollama is unavailable."""
    fallback_responses = {
        "greeting": "Hello! I'm here to help you. How can I assist you today?",
        "error": "I apologize, but I'm having temporary technical difficulties. "
                 "Please try again in a moment.",
        "quote": "I'd be happy to help you with a quote. "
                "Let me collect some basic information from you first.",
        "documents": "I can help you with document upload and verification.",
    }

    # Simple keyword matching
    prompt_lower = prompt.lower()
    if any(word in prompt_lower for word in ["hello", "hi", "start"]):
        return fallback_responses["greeting"]
    elif any(word in prompt_lower for word in ["quote", "premium", "price"]):
        return fallback_responses["quote"]
    else:
        return fallback_responses["error"]
```

### Application Startup Health Check

**File: `app/main.py`**

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Starting eTouch Insurance Backend")

    # Check Ollama connection
    from app.services.ollama_service import ollama_service
    ollama_healthy = await ollama_service.health_check()

    if ollama_healthy:
        logger.info("✅ Ollama service is available")
    else:
        logger.warning("⚠️ Ollama service is not available - using fallback responses")

    yield

    # Shutdown
    logger.info("Shutting down eTouch Insurance Backend")
```

---

## Conversation Context Management

### Context Building Strategy

```python
def _build_chat_messages(self, user_prompt: str, system_prompt: str = None,
                       context: Dict[str, Any] = None) -> List[Dict[str, str]]:
    """Build messages array for Ollama chat API with conversation history."""
    messages = []

    # 1. Add system message if provided
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})

    # 2. Add conversation history
    if context and "conversation_history" in context:
        history = context["conversation_history"]
        for turn in history:
            if isinstance(turn, dict):
                user_msg = turn.get("user", "")
                bot_msg = turn.get("bot", "") or turn.get("agent", "")
                if user_msg and bot_msg:
                    messages.append({"role": "user", "content": user_msg})
                    messages.append({"role": "assistant", "content": bot_msg})

    # 3. Add context information as a system message
    context_parts = []
    if context and "customer_data" in context:
        customer_data = context["customer_data"]
        if customer_data:
            context_parts.append(f"Customer Data: {json.dumps(customer_data)}")

    if context and "session_state" in context:
        context_parts.append(f"Current State: {context['session_state']}")

    if context_parts:
        context_message = "\n".join(context_parts)
        messages.append({"role": "system", "content": context_message})

    # 4. Add current user message
    messages.append({"role": "user", "content": user_prompt})

    return messages
```

### Session Management Integration

```python
async def process_state_message(self, session: SessionData, user_message: str,
                              state_context: Dict[str, Any] = None) -> str:
    """Process message with state-specific context."""
    system_prompt = self._get_state_system_prompt(session.current_state)

    context = {
        "session_state": session.current_state.value,
        "customer_data": session.customer_data,
        "conversation_history": [
            {"user": turn.user_message, "bot": turn.bot_response}
            for turn in session.conversation_history[-5:]  # Last 5 turns
        ],
        "state_context": state_context or {}
    }

    return await self.generate_response(user_message, system_prompt, context)
```

### Memory Window Management

**Strategy**: Keep last N conversation turns to manage context size

```python
# In agent_orchestrator.py
conversation_context = []
recent_turns = session.conversation_history[-7:]  # Last 7 turns

for turn in recent_turns:
    conversation_context.append({
        "user": turn.user_message,
        "bot": turn.bot_response
    })
```

**Benefits**:
- Prevents token limit overflow
- Maintains recent conversation relevance
- Improves response speed
- Reduces costs for paid models

---

## Implementation Examples

### Example 1: Basic Question-Answer

```python
# Simple usage
from app.services.ollama_service import ollama_service

async def ask_question():
    response = await ollama_service.generate_response(
        prompt="What is term life insurance?",
        system_prompt="You are an insurance expert. Explain concepts simply."
    )
    print(response)
```

### Example 2: Multi-Turn Conversation

```python
# Conversation with history
async def have_conversation():
    context = {
        "conversation_history": [
            {"user": "I want to buy insurance", "bot": "Great! Let me help you."},
            {"user": "What is my name?", "bot": "I don't know yet. What's your name?"}
        ]
    }

    response = await ollama_service.generate_response(
        prompt="My name is John Doe",
        system_prompt="You are a helpful insurance agent",
        context=context
    )
    print(response)
```

### Example 3: State-Aware Processing

```python
# Using session state for context-aware responses
async def process_with_state(session_id: str, message: str):
    session = session_manager.get_session(session_id)

    response = await ollama_service.process_state_message(
        session=session,
        user_message=message,
        state_context={
            "form_completion": session.form_completion,
            "quote_data": session.quote_data
        }
    )

    return response
```

### Example 4: Streaming Responses

```python
# Stream tokens as they are generated
async def stream_response():
    async for token in ollama_service.generate_response_stream(
        prompt="Explain term insurance in detail",
        system_prompt="You are an insurance expert"
    ):
        print(token, end='', flush=True)
```

### Example 5: Document Analysis

```python
# Analyze uploaded documents
async def analyze_document(document_type: str, extracted_text: str):
    result = await ollama_service.analyze_document(
        document_type="PAN Card",
        extracted_text="Name: John Doe\nPAN: ABCDE1234F\nDOB: 01/01/1990"
    )

    # Returns structured JSON:
    # {"name": "John Doe", "pan_number": "ABCDE1234F", "date_of_birth": "01/01/1990"}
    return result
```

---

## Best Practices

### 1. Connection Management

**✅ DO:**
- Use a single `httpx.AsyncClient` instance per service
- Implement proper async context managers
- Set appropriate timeouts (30s recommended)
- Close clients in shutdown hooks

**❌ DON'T:**
- Create new clients for each request
- Use blocking/synchronous HTTP calls
- Set infinite timeouts
- Ignore connection errors

### 2. Error Handling

**✅ DO:**
- Implement exponential backoff for retries
- Provide meaningful fallback responses
- Log all errors with context
- Handle both network and API errors
- Validate responses before using

**❌ DON'T:**
- Fail silently
- Return generic error messages to users
- Retry indefinitely
- Assume Ollama is always available

### 3. Context Management

**✅ DO:**
- Limit conversation history to recent turns (5-10)
- Structure context hierarchically (system → history → current)
- Serialize complex data as JSON
- Clear sensitive data from context

**❌ DON'T:**
- Send entire conversation history every time
- Include unnecessary data in context
- Expose sensitive information in prompts
- Ignore token limits

### 4. Prompt Engineering

**✅ DO:**
- Use clear, structured system prompts
- Separate concerns (system, context, user message)
- Request specific output formats (JSON, text)
- Provide examples in prompts
- Use role-based prompting

**❌ DON'T:**
- Mix instructions with user content
- Create overly complex prompts
- Assume model will follow format without guidance
- Ignore model-specific capabilities

### 5. Performance Optimization

**✅ DO:**
- Use streaming for long responses
- Implement response caching when appropriate
- Monitor token usage
- Use smaller models for simple tasks
- Batch similar requests when possible

**❌ DON'T:**
- Wait for full response for UI updates
- Generate same response multiple times
- Use large models for trivial tasks
- Send duplicate requests

### 6. Security

**✅ DO:**
- Validate and sanitize user inputs
- Use environment variables for configuration
- Implement rate limiting
- Log access patterns
- Encrypt sensitive data in transit

**❌ DON'T:**
- Trust LLM output without validation
- Hard-code credentials or API keys
- Expose internal system details in prompts
- Allow unrestricted access to Ollama

---

## Dependencies

### Core Requirements

```txt
# requirements.txt
fastapi==0.104.1           # Web framework
uvicorn[standard]==0.24.0  # ASGI server
httpx==0.25.2              # Async HTTP client for Ollama
pydantic==2.5.0            # Data validation
pydantic-settings==2.1.0   # Settings management
python-multipart==0.0.6    # File upload support
python-dotenv==1.0.0       # Environment variable loading
typing-extensions==4.8.0   # Type hints
```

### Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install Ollama (if not installed)
# Visit: https://ollama.com/download

# Pull required model
ollama pull qwen2.5:7b
```

---

## Running the Application

### Start Ollama Server

```bash
# Start Ollama service
ollama serve

# Verify it's running
curl http://localhost:11434/api/tags
```

### Start FastAPI Backend

```bash
# Development mode with auto-reload
uvicorn app.main:app --host 0.0.0.0 --port 9000 --reload

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 9000 --workers 4
```

### Access Points

- **API Documentation**: http://localhost:9000/docs
- **ReDoc**: http://localhost:9000/redoc
- **Health Check**: http://localhost:9000/health
- **Chat Endpoint**: http://localhost:9000/api/chat/message

---

## Troubleshooting

### Issue: Ollama Not Responding

**Symptoms**: Connection refused, timeout errors

**Solutions**:
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
# Linux/Mac:
killall ollama
ollama serve

# Windows:
taskkill /F /IM ollama.exe
ollama serve

# Check firewall rules
sudo ufw status  # Linux
netsh advfirewall show allprofiles  # Windows
```

### Issue: Model Not Found

**Symptoms**: 404 errors, model unavailable

**Solutions**:
```bash
# List installed models
ollama list

# Pull required model
ollama pull qwen2.5:7b

# Update .env with correct model name
OLLAMA_MODEL=qwen2.5:7b
```

### Issue: Slow Responses

**Symptoms**: Timeout errors, high latency

**Solutions**:
1. Use smaller model: `qwen2.5:0.5b` instead of `qwen2.5:7b`
2. Increase timeout: `OLLAMA_TIMEOUT=60`
3. Limit conversation history: Keep only last 3-5 turns
4. Use streaming API for better perceived performance
5. Check system resources (CPU, RAM, GPU)

### Issue: Context Too Large

**Symptoms**: Token limit errors, truncated responses

**Solutions**:
1. Reduce conversation history window
2. Summarize older context
3. Remove unnecessary data from context
4. Use a model with larger context window
5. Implement context pruning strategy

---

## Advanced Topics

### Custom Model Configuration

```python
# Use a custom fine-tuned model
OLLAMA_MODEL=mycompany/insurance-agent:latest

# Pull custom model
ollama pull mycompany/insurance-agent:latest
```

### GPU Acceleration

```bash
# Ollama automatically uses GPU if available

# Check GPU usage
nvidia-smi  # For NVIDIA GPUs

# Force CPU-only mode
OLLAMA_NUM_GPU=0 ollama serve
```

### Load Balancing Multiple Ollama Instances

```python
# Round-robin between multiple Ollama servers
import itertools

class LoadBalancedOllamaService:
    def __init__(self, servers: List[str]):
        self.servers = itertools.cycle(servers)
        self.clients = {
            server: httpx.AsyncClient(base_url=server, timeout=30)
            for server in servers
        }

    async def generate_response(self, prompt: str):
        server = next(self.servers)
        client = self.clients[server]
        # Make request to selected server
        ...
```

---

## Reference Files

### Configuration Files
- `app/config.py` - Centralized configuration management
- `.env.example` - Environment variable template
- `requirements.txt` - Python dependencies

### Service Implementation
- `app/services/ollama_service.py` - Core Ollama integration (510 lines)
- `app/services/agent_orchestrator.py` - High-level orchestration (967 lines)

### API Routes
- `app/api/routes/chat.py` - Chat endpoints
- `app/main.py` - Application entry point

### Models
- `app/models/session.py` - Session and state management
- `app/models/chat_response.py` - Response structures

---

## Conclusion

This guide provides a complete blueprint for integrating Ollama into your Python applications. The architecture demonstrated here can be adapted for various use cases:

- Customer service chatbots
- Document processing systems
- Intelligent form filling
- Content generation
- Code assistants
- Data analysis tools

**Key Takeaways**:
1. Use async/await for all Ollama calls
2. Implement robust error handling and fallbacks
3. Manage conversation context carefully
4. Monitor performance and optimize for your use case
5. Test with different models to find the best fit

For questions or issues, refer to:
- [Ollama Documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [HTTPX Documentation](https://www.python-httpx.org/)
