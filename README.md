# Prompt Audit Engine

Enterprise LLM prompt risk analysis for regulated industries — healthcare, legal, finance, government.

Paste any prompt, select your industry context, and get a scored audit across 5 enterprise-grade dimensions in seconds. Powered by Groq + LLaMA 3.3 70B.

## What it audits

| Dimension | What it measures |
|---|---|
| Auditability | Can outputs be traced, logged, attributed? |
| Explainability | Will the LLM justify reasoning for non-technical stakeholders? |
| Regression Risk | How brittle is this prompt across model versions? |
| Integration Safety | Is it safe for production API use with edge cases handled? |
| Response Consistency | Will repeated calls return stable, enterprise-grade outputs? |

## Stack

- **Backend**: FastAPI + Groq SDK (Python 3.12)
- **LLM**: LLaMA 3.3 70B via Groq (ultra-low latency)
- **Frontend**: React 18 + Recharts
- **Infrastructure**: Docker + docker-compose, GCP-ready

## Run locally

```bash
# Clone and start
git clone https://github.com/Rabba-Meghana/Prompt-Audit-Engine
cd Prompt-Audit-Engine

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm start
```

Or with Docker:

```bash
docker-compose up --build
```

Frontend: http://localhost:3000  
Backend API: http://localhost:8000  
Docs: http://localhost:8000/docs

## Deploy on GCP

```bash
gcloud run deploy prompt-audit-backend \
  --source ./backend \
  --region us-central1 \
  --allow-unauthenticated

gcloud run deploy prompt-audit-frontend \
  --source ./frontend \
  --region us-central1 \
  --allow-unauthenticated
```

## API

```
POST /audit
{
  "prompt": "Your LLM prompt here",
  "industry": "Healthcare / Clinical",
  "groq_api_key": "gsk_..."
}
```

Returns scored audit with findings and a rewritten prompt suggestion.
