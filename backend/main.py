from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import json
import os

app = FastAPI(title="Prompt Audit Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

AUDIT_DIMENSIONS = [
    "auditability",
    "explainability",
    "regression_risk",
    "integration_safety",
    "response_consistency",
]

SYSTEM_PROMPT = """You are an enterprise AI prompt auditor specializing in regulated industries (healthcare, legal, finance, government).

Given a prompt and industry context, evaluate it across 5 dimensions and return ONLY valid JSON (no markdown, no prose):

{
  "scores": {
    "auditability": <0-100>,
    "explainability": <0-100>,
    "regression_risk": <0-100>,
    "integration_safety": <0-100>,
    "response_consistency": <0-100>
  },
  "overall": <0-100>,
  "verdict": "<one short sentence verdict>",
  "findings": [
    {"type": "risk|good|tip", "text": "<concise finding>"},
    ...
  ],
  "rewritten_prompt": "<improved version of the prompt>"
}

Scoring guide:
- auditability: Can outputs be traced, logged, and attributed? Are inputs/outputs clearly bounded?
- explainability: Will the LLM justify its reasoning? Is the output interpretable by non-technical stakeholders?
- regression_risk: How likely is prompt drift across model versions? Are instructions brittle?
- integration_safety: Safe for production API use? Handles edge cases, errors, and unexpected inputs?
- response_consistency: Will repeated calls produce stable, deterministic-enough outputs for enterprise use?

Provide 4-6 findings. Be specific and actionable. Keep each finding under 20 words."""


class AuditRequest(BaseModel):
    prompt: str
    industry: str
    groq_api_key: str


@app.post("/audit")
async def audit_prompt(req: AuditRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    client = Groq(api_key=req.groq_api_key)

    user_message = f"Industry context: {req.industry}\n\nPrompt to audit:\n{req.prompt}"

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.2,
            max_tokens=1200,
        )
        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        result = json.loads(raw)
        return result
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Model returned malformed JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {"status": "ok"}
