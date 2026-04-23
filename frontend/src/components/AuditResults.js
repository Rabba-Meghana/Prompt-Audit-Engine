import React, { useState } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

const DIMENSION_LABELS = {
  auditability: "Auditability",
  explainability: "Explainability",
  regression_risk: "Regression Risk",
  integration_safety: "Integration Safety",
  response_consistency: "Consistency",
};

function scoreColor(val) {
  if (val >= 75) return "var(--good)";
  if (val >= 50) return "var(--tip)";
  return "var(--risk)";
}

export default function AuditResults({ result, originalPrompt, industry }) {
  const [copied, setCopied] = useState(false);

  const radarData = Object.entries(result.scores).map(([key, val]) => ({
    dim: DIMENSION_LABELS[key] || key,
    value: val,
  }));

  const handleCopy = () => {
    navigator.clipboard.writeText(result.rewritten_prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="results-wrap">
      {/* Header */}
      <div className="results-header">
        <div>
          <div className="overall-block">
            <span className="overall-num" style={{ color: scoreColor(result.overall) }}>
              {result.overall}
            </span>
            <span className="overall-denom">/100</span>
          </div>
          <div className="verdict-text">{result.verdict}</div>
        </div>
        <div className="industry-tag">{industry}</div>
      </div>

      {/* Score tiles */}
      <div className="scores-grid">
        {Object.entries(result.scores).map(([key, val]) => (
          <div className="score-tile" key={key}>
            <div className="score-tile-label">{DIMENSION_LABELS[key]}</div>
            <div className="score-tile-val" style={{ color: scoreColor(val) }}>
              {val}
            </div>
            <div className="score-bar-bg">
              <div
                className="score-bar-fill"
                style={{ width: `${val}%`, background: scoreColor(val) }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Radar chart */}
      <div className="chart-card">
        <div className="card-title">// risk profile radar</div>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid stroke="#2a2a2a" />
            <PolarAngleAxis
              dataKey="dim"
              tick={{ fill: "#888", fontSize: 11, fontFamily: "IBM Plex Mono" }}
            />
            <Radar
              dataKey="value"
              stroke="#e8f542"
              fill="#e8f542"
              fillOpacity={0.12}
              strokeWidth={1.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Findings */}
      <div>
        <div className="card-title" style={{ marginBottom: 10 }}>// findings</div>
        <div className="findings-list">
          {result.findings.map((f, i) => (
            <div className="finding-row" key={i}>
              <span className={`finding-tag tag-${f.type}`}>{f.type}</span>
              <span style={{ color: "var(--text)", fontSize: 13 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rewrite */}
      {result.rewritten_prompt && (
        <div className="rewrite-card">
          <div className="rewrite-header">
            <div className="card-title" style={{ marginBottom: 0 }}>// suggested rewrite</div>
            <button className="copy-btn" onClick={handleCopy}>
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
          <div className="rewrite-body">{result.rewritten_prompt}</div>
        </div>
      )}
    </div>
  );
}
