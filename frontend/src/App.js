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
      const data = await res.json();
      setResult(data);
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
          <div className="logo-mark">PAE</div>
          <div>
            <h1 className="app-title">Prompt Audit Engine</h1>
            <p className="app-sub">Enterprise LLM prompt risk analysis for regulated industries</p>
          </div>
        </div>
      </header>
      <main className="app-main">
        <AuditForm onSubmit={handleAudit} loading={loading} />
        {error && <div className="error-banner">{error}</div>}
        {result && (
          <AuditResults
            result={result}
            originalPrompt={lastPrompt}
            industry={lastIndustry}
          />
        )}
      </main>
      <footer className="app-footer">
        <span>Built by Meghana Rabba · Powered by Groq + LLaMA 3.3 70B</span>
      </footer>
    </div>
  );
}
