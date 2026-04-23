import React, { useState } from "react";

const INDUSTRIES = [
  "Healthcare / Clinical",
  "Legal / Compliance",
  "Financial Services",
  "Government / Public Sector",
  "Insurance",
  "Pharma / Life Sciences",
];

const EXAMPLES = [
  {
    label: "Clinical triage",
    prompt: "Given the following patient symptoms, determine the likely diagnosis and recommend next steps for the care team.",
    industry: "Healthcare / Clinical",
  },
  {
    label: "Contract review",
    prompt: "Review this contract clause and flag any terms that may expose the company to liability.",
    industry: "Legal / Compliance",
  },
  {
    label: "Fraud detection",
    prompt: "Analyze this transaction and determine if it is fraudulent. Return true or false.",
    industry: "Financial Services",
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
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-section-label">// audit configuration</div>
      <div className="form-body">
        <div className="form-row">
          <div className="field" style={{ flex: "0 0 220px" }}>
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
          <label>
            Prompt to Audit
            <span style={{ marginLeft: 12, opacity: 0.6 }}>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => loadExample(ex)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: "var(--mono)",
                    marginLeft: 8,
                    textDecoration: "underline",
                  }}
                >
                  {ex.label}
                </button>
              ))}
            </span>
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Paste your LLM prompt here..."
            required
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button className="run-btn" type="submit" disabled={loading || !prompt.trim() || !groqApiKey.trim()}>
            {loading ? "Auditing..." : "Run Audit →"}
          </button>
          {loading && (
            <div className="loading-indicator">
              <div className="spinner" />
              Analyzing with LLaMA 3.3 70B
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
