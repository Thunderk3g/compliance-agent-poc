# AI Underwriting & Issuance System

**Repository**: [Utkarshdas24/AI-UnderWriting-Issuance-System](https://github.com/Utkarshdas24/AI-UnderWriting-Issuance-System)

## Overview

**Bajaj Life Insurance Predict** - A system for automating insurance underwriting decisions using AI/ML. Helps predict risk and automate policy issuance decisions.

## What is Underwriting?

Underwriting is the process of evaluating risk to determine:

1. Whether to insure an applicant
2. What premium to charge
3. What exclusions to apply
4. Policy terms and conditions

## Problem Statement

Traditional underwriting is:

- **Manual**: Requires human underwriters to review each application
- **Slow**: Days to weeks for complex cases
- **Inconsistent**: Different underwriters may make different decisions
- **Expensive**: High labor costs

## Solution: AI-Powered Underwriting

```
Application Data
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Feature    │────▶│     ML       │────▶│   Decision   │
│  Extraction  │     │    Model     │     │    Engine    │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                          ┌──────▼──────┐
                                          │  Auto-Issue │
                                          │  or Refer   │
                                          └─────────────┘
```

## Tech Stack

| Component | Technology                   |
| --------- | ---------------------------- |
| Backend   | Python + FastAPI             |
| Frontend  | React + Vite                 |
| ML        | Scikit-learn / Custom models |

## Project Structure

```
AI-UnderWriting-Issuance-System/
├── backend/
│   ├── main.py           # FastAPI server
│   └── requirements.txt
└── frontend/
    └── (React application)
```

## Setup

```bash
# Backend
python backend/main.py
# Wait for: "Application startup complete"

# Frontend (separate terminal)
cd frontend
npm run dev
# Open: http://localhost:5173
```

## Underwriting Concepts

### 1. Risk Factors

| Factor            | Impact                        |
| ----------------- | ----------------------------- |
| Age               | Older = Higher risk           |
| Health conditions | Pre-existing = Higher premium |
| Occupation        | Hazardous = Higher risk       |
| Lifestyle         | Smoking = Higher premium      |
| Sum Assured       | Higher = More scrutiny        |

### 2. Decision Categories

| Decision         | Description                  |
| ---------------- | ---------------------------- |
| **Auto-Approve** | Low risk, immediate issuance |
| **Standard**     | Normal risk, standard rates  |
| **Substandard**  | Higher risk, loaded premiums |
| **Refer**        | Needs manual review          |
| **Decline**      | Too risky to insure          |

### 3. ML Model Approach

```python
class UnderwritingModel:
    def __init__(self):
        self.model = RandomForestClassifier()

    def predict_risk(self, applicant_data: dict) -> dict:
        """
        Returns:
        - risk_class: 1-5 (1=lowest risk)
        - confidence: 0-1
        - factors: List of contributing factors
        """
        features = self.extract_features(applicant_data)
        prediction = self.model.predict_proba(features)
        return {
            "risk_class": self.get_risk_class(prediction),
            "confidence": prediction.max(),
            "factors": self.explain_prediction(features)
        }

    def recommend_action(self, risk_class: int) -> str:
        if risk_class <= 2:
            return "AUTO_APPROVE"
        elif risk_class == 3:
            return "STANDARD"
        elif risk_class == 4:
            return "REFER_MEDICAL"
        else:
            return "REFER_SENIOR"
```

## Integration Points

| For Your Project   | How to Use                             |
| ------------------ | -------------------------------------- |
| Scoring Engine     | Similar pattern for compliance scoring |
| Decision Logic     | Auto-approve / refer patterns          |
| Feature Extraction | Extracting signals from documents      |

## Key Patterns

### 1. Straight-Through Processing (STP)

```
Application → Risk Score → Decision → Policy Issuance
                                 ↓
                        (If low risk, no human)
```

### 2. Risk Scoring

Similar to your compliance scoring:

- Multiple dimensions evaluated
- Weighted scoring
- Threshold-based decisions

### 3. Explainability

Critical for regulated industries:

- Why was the decision made?
- Which factors contributed?
- Audit trail for regulators

## Applicability to Compliance

| Underwriting Concept | Compliance Equivalent |
| -------------------- | --------------------- |
| Risk score           | Compliance score      |
| Risk factors         | Violation categories  |
| Auto-approve         | Auto-pass             |
| Refer to human       | HITL review           |
| Audit trail          | Compliance logs       |

## Benefits of AI Underwriting

1. **Speed**: Decisions in seconds vs. days
2. **Consistency**: Same rules applied uniformly
3. **Scalability**: Handle volume spikes
4. **Cost**: Lower operational costs
5. **Auditability**: Every decision logged
