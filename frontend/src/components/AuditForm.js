import React, { useState } from "react";

const INDUSTRIES = [
  "Healthcare / Clinical",
  "Insurance / Reinsurance",
  "Financial Services / Fintech",
  "Government / Defense",
  "Legal / Compliance",
  "Pharma / Life Sciences",
];

const EXAMPLES = [
  {
    label: "Prior auth review",
    prompt:
      "Given the following patient clinical notes and insurance policy details, determine whether this prior authorization request should be approved, denied, or escalated for physician review.",
    industry: "Healthcare / Clinical",
  },
  {
    label: "Claims triage",
    prompt:
      "Analyze this insurance claim submission and extract the key risk indicators. Flag any anomalies that may indicate fraud or require adjuster review.",
    industry: "Insurance / Reinsurance",
  },
  {
    label: "Contract clause risk",
    prompt:
      "Review the following contract clause and identify any liability exposure, ambiguous terms, or regulatory compliance gaps relevant to enterprise software agreements.",
    industry: "Legal / Compliance",
  },
  {
    label: "M&A due diligence",
    prompt:
      "Given the following financial documents from the target company, identify any tail risks, under-reserving patterns, or data anomalies that may affect the acquisition valuation.",
    industry: "Financial Services / Fintech",
  },
];

export default function AuditForm({ onSubmit, loading }) {
  const [prompt, setPrompt] = useState("");
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [groqApiKey, setGroqApiKey] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || !groqApiKey.trim()) return;
    onSubmit({ prompt, industry, groqApiKey });
  };

  const loadExample = (ex) => {
    setPrompt(ex.prompt);
    setIndustry(ex.industry);
  };

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="panel-header">
        <span className="panel-title">// prompt configuration</span>
        <span className="panel-badge">LLaMA-3.3-70B · Groq</span>
      </div>
      <div className="form-body">
        <div className="form-row">
          <div className="field" style={{ flex: "0 0 240px" }}>
            <label>Groq API Key</label>
            <input
              type="password"
              placeholder="gsk_..."
              value={groqApiKey}
              onChange={(e) => setGroqApiKey(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Industry Context</label>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
              {INDUSTRIES.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label>Prompt to Audit</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Paste the LLM prompt you want to evaluate for production readiness..."
            required
          />
        </div>

        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            Load example
          </div>
          <div className="examples-row">
            {EXAMPLES.map((ex) => (
              <button
                type="button"
                key={ex.label}
                className="example-chip"
                onClick={() => loadExample(ex)}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-footer">
          <button
            className="run-btn"
            type="submit"
            disabled={loading || !prompt.trim() || !groqApiKey.trim()}
          >
            {loading ? "Auditing..." : "Run Audit →"}
          </button>
          {loading ? (
            <div className="loading-indicator">
              <div className="spinner" />
              Analyzing with LLaMA 3.3 70B · problem + context + prompt engineering
            </div>
          ) : (
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-dim)" }}>
              Scores across 5 AIE dimensions · findings + rewrite in &lt;2s
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
