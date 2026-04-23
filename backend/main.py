from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import json

app = FastAPI(title="Prompt Audit Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """You are a brutally honest enterprise AI prompt auditor for regulated industries. Your job is to find real weaknesses.

Analyze the prompt deeply and return ONLY valid JSON (no markdown, no prose, no code fences):

{
  "scores": {
    "auditability": <integer 0-100>,
    "explainability": <integer 0-100>,
    "regression_risk": <integer 0-100>,
    "integration_safety": <integer 0-100>,
    "response_consistency": <integer 0-100>
  },
  "overall": <integer 0-100>,
  "verdict": "<one specific sentence naming the prompt's biggest single weakness or strength>",
  "findings": [
    {"type": "risk|good|tip", "text": "<specific finding quoting or referencing exact words from the prompt>"}
  ],
  "rewritten_prompt": "<substantially improved version at least 2x longer with output schema, error handling, reasoning requirements, and format constraints added>"
}

SCORING RULES - scores MUST be differentiated. Do NOT cluster around 70-85. Most prompts score poorly on regression_risk and response_consistency:
- auditability: No output schema = max 45. JSON schema specified = +30. Explicit logging = +20.
- explainability: No reasoning required = max 40. Requires justification = +25. Evidence citation = +20.
- regression_risk: Vague open-ended instructions = max 30. Specific format + enum constraints = higher. Score reflects stability, NOT risk level.
- integration_safety: No null/error handling = max 35. Explicit fallback = +30. Input validation = +20.
- response_consistency: No format spec = max 25. Strict schema = +40. Enum outputs = +20.

overall = auditability*0.25 + explainability*0.20 + regression_risk*0.20 + integration_safety*0.20 + response_consistency*0.15

FINDINGS RULES:
- Minimum 2 risks, 1 good, 2 tips. Total 5-7 findings.
- Quote specific words/phrases from the prompt in each finding.
- Be brutally specific: not "no error handling" but "if the claim submission is null or truncated, prompt will hallucinate a response with no fallback path"
- The rewritten_prompt MUST be substantially longer and better — include JSON output schema, error conditions, reasoning steps, format constraints."""


class AuditRequest(BaseModel):
    prompt: str
    industry: str
    groq_api_key: str


@app.post("/audit")
async def audit_prompt(req: AuditRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    client = Groq(api_key=req.groq_api_key)

    user_message = (
        f"Industry: {req.industry}\n\n"
        f"Prompt to audit:\n\"\"\"\n{req.prompt}\n\"\"\"\n\n"
        "Be brutally honest. Spread scores across the full range — most prompts score 20-40 on regression_risk "
        "and response_consistency unless they specify a strict output schema. "
        "Return valid JSON only, no code fences, no prose."
    )

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.1,
            max_tokens=1800,
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
