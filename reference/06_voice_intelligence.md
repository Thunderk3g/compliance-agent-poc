# AI Voice Intelligence Platform

**Repository**: [Jayesh033/ai-voice-intelligence](https://github.com/Jayesh033/ai-voice-intelligence)

## Overview

An AI-powered system that converts **spoken audio into structured business insights**. Performs speech-to-text, sentiment analysis, named entity recognition, and business insight extraction.

## Problem Statement

Voice data (calls, meetings, recordings) contains valuable insights but:

- Time-consuming to listen and transcribe manually
- Difficult to extract structured data
- No easy way to analyze sentiment at scale
- Hard to identify key entities and topics

## Solution Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Audio     │────▶│   Whisper    │────▶│   Transcript │
│    Input     │     │    STT       │     │     Text     │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                     ┌───────────────────────────┤
                     ▼                           ▼
              ┌──────────────┐            ┌──────────────┐
              │   spaCy      │            │  Sentiment   │
              │     NER      │            │  Analysis    │
              └──────────────┘            └──────────────┘
                     │                           │
                     └───────────┬───────────────┘
                                 ▼
                          ┌──────────────┐
                          │   Business   │
                          │   Insights   │
                          └──────────────┘
```

## Key Features

### 1. Speech-to-Text Transcription

- Uses **OpenAI Whisper** for high-accuracy transcription
- Supports multiple languages
- Handles various audio formats

### 2. Sentiment Analysis

- Analyzes emotional tone of speech
- Categories: Positive, Negative, Neutral
- Useful for call quality assessment

### 3. Named Entity Recognition (NER)

- Identifies entities using **spaCy**
- Extracts: People, Organizations, Dates, Amounts, Products

### 4. Business Insight Extraction

- Summarizes key points
- Identifies action items
- Highlights important topics

## Tech Stack

| Component | Technology       |
| --------- | ---------------- |
| Backend   | FastAPI (Python) |
| Frontend  | Streamlit        |
| STT       | OpenAI Whisper   |
| NLP       | spaCy            |

## Processing Pipeline

```python
class VoiceIntelligencePipeline:
    def __init__(self):
        self.whisper = load_whisper_model()
        self.nlp = spacy.load("en_core_web_lg")
        self.sentiment_analyzer = SentimentAnalyzer()

    def process(self, audio_file: bytes) -> dict:
        # 1. Transcription
        transcript = self.whisper.transcribe(audio_file)

        # 2. NER
        doc = self.nlp(transcript)
        entities = [(ent.text, ent.label_) for ent in doc.ents]

        # 3. Sentiment
        sentiment = self.sentiment_analyzer.analyze(transcript)

        # 4. Insights
        insights = self.extract_insights(transcript, entities)

        return {
            "transcript": transcript,
            "entities": entities,
            "sentiment": sentiment,
            "insights": insights
        }
```

## Entity Types for Insurance

| Entity  | Example        | Use Case                 |
| ------- | -------------- | ------------------------ |
| PERSON  | "Mr. Sharma"   | Customer identification  |
| ORG     | "Bajaj Life"   | Company mentions         |
| MONEY   | "₹50,000"      | Premium/coverage amounts |
| DATE    | "15th January" | Policy dates             |
| PRODUCT | "Term Plan"    | Product mentions         |

## Sentiment Analysis for Compliance

### Call Quality Indicators

| Sentiment Pattern                 | Interpretation               |
| --------------------------------- | ---------------------------- |
| Customer negative, Agent positive | Possible issue being handled |
| Both negative                     | Escalation needed            |
| Customer neutral → positive       | Good resolution              |
| Sudden negative spike             | Complaint/dissatisfaction    |

### Compliance Red Flags

| Pattern                  | Risk                 |
| ------------------------ | -------------------- |
| High-pressure language   | Miss-selling risk    |
| Guarantee mentions       | Regulatory violation |
| Competitor disparagement | Unethical practice   |

## Integration Points

| For Your Project  | How to Use                       |
| ----------------- | -------------------------------- |
| Document Analysis | Apply NER for entity extraction  |
| Compliance Checks | Sentiment as quality indicator   |
| Content Analysis  | Entity extraction from marketing |

## Whisper Setup

```python
import whisper

# Load model (sizes: tiny, base, small, medium, large)
model = whisper.load_model("base")

# Transcribe
result = model.transcribe("audio.mp3")
print(result["text"])
```

## spaCy NER Setup

```python
import spacy

# Load model
nlp = spacy.load("en_core_web_lg")

# Process text
doc = nlp("Mr. Sharma bought a ₹1 crore term plan from Bajaj Life on January 15.")

# Extract entities
for ent in doc.ents:
    print(ent.text, ent.label_)
# Output:
# Mr. Sharma - PERSON
# ₹1 crore - MONEY
# Bajaj Life - ORG
# January 15 - DATE
```

## Usage Flow

1. Upload an audio file via Streamlit UI
2. System transcribes using Whisper
3. NER extracts entities
4. Sentiment is analyzed
5. Results displayed with structured insights

## Key Learnings

1. **Whisper Quality**: "base" model is good balance of speed/accuracy
2. **spaCy Models**: Use language-specific models for better accuracy
3. **Pipeline Design**: Keep stages independent for flexibility
4. **Streamlit**: Great for quick demo interfaces
