import React, { useState } from "react";
import AuditForm from "./components/AuditForm";
import AuditResults from "./components/AuditResults";
import "./App.css";

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastPrompt, setLastPrompt] = useState("");
  const [lastIndustry, setLastIndustry] = useState("");

  const handleAudit = async ({ prompt, industry, groqApiKey }) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setLastPrompt(prompt);
    setLastIndustry(industry);

    try {
      const res = await fetch("http://localhost:8000/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, industry, groq_api_key: groqApiKey }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Audit failed");
      }
      setResult(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-left">
            <div className="logo-wrap">
              <div className="logo-icon">L</div>
              <span className="logo-name">Lazarus<span>AI</span></span>
            </div>
            <div className="hdr-div" />
            <span className="hdr-product">Prompt Audit Engine · AIE Layer</span>
          </div>
          <div className="header-right">
            <div className="status-dot">
              <div className="dot" />
              Groq / LLaMA-3.3-70B online
            </div>
            <div className="version-badge">v1.0.0</div>
          </div>
        </div>
      </header>

      <div className="hero-strip">
        <div className="hero-inner">
          <div className="hero-text">
            <h1>Audit your prompts before<br /><span>they reach production.</span></h1>
            <p>
              95% of enterprise AI pilots fail to deploy. Most fail at the prompt layer —
              brittle instructions, unexplainable outputs, regression risk across model versions.
              The Prompt Audit Engine catches these issues before your clients do.
            </p>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-num">5</div>
              <div className="hero-stat-label">AIE dimensions</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">6</div>
              <div className="hero-stat-label">industry contexts</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">&lt;2s</div>
              <div className="hero-stat-label">per audit</div>
            </div>
          </div>
        </div>
      </div>

      <main className="app-main">
        <AuditForm onSubmit={handleAudit} loading={loading} />
        {error && <div className="error-banner">Error: {error}</div>}
        {result && (
          <AuditResults
            result={result}
            originalPrompt={lastPrompt}
            industry={lastIndustry}
          />
        )}
      </main>

      <footer className="app-footer">
        <span className="footer-left">
          Built by <span>Meghana Rabba</span> · Powered by Groq + LLaMA 3.3 70B ·{" "}
          <span>Applied Intelligence Engine</span>
        </span>
      </footer>
    </div>
  );
}
