import React, { useState } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Cell, Tooltip,
} from "recharts";

const DIMS = {
  auditability: {
    label: "Auditability",
    desc: "Outputs traceable, logged, attributed",
  },
  explainability: {
    label: "Explainability",
    desc: "Reasoning visible to non-technical stakeholders",
  },
  regression_risk: {
    label: "Regression Risk",
    desc: "Stability across model versions & drift",
  },
  integration_safety: {
    label: "Integration Safety",
    desc: "Production API safety & edge case handling",
  },
  response_consistency: {
    label: "Consistency",
    desc: "Deterministic enough for enterprise SLAs",
  },
};

function scoreColor(v) {
  if (v >= 75) return "var(--good)";
  if (v >= 50) return "var(--tip)";
  return "var(--risk)";
}

function productionVerdict(overall) {
  if (overall >= 75) return { label: "PRODUCTION READY", cls: "pl-go" };
  if (overall >= 50) return { label: "NEEDS REFINEMENT", cls: "pl-warn" };
  return { label: "NOT PRODUCTION READY", cls: "pl-stop" };
}

function ScoreRing({ value, size = 96 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (value / 100) * circ;
  const color = scoreColor(value);

  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={4} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={4}
          strokeDasharray={`${fill} ${circ - fill}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="ring-text">
        <span className="ring-num" style={{ color }}>{value}</span>
        <span className="ring-denom">/100</span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px", fontFamily: "var(--mono)", fontSize: 12, color: "var(--text)" }}>
        {payload[0].payload.dim}: <strong style={{ color: scoreColor(payload[0].value) }}>{payload[0].value}</strong>
      </div>
    );
  }
  return null;
};

export default function AuditResults({ result, originalPrompt, industry }) {
  const [copied, setCopied] = useState(false);

  const pv = productionVerdict(result.overall);

  const radarData = Object.entries(result.scores).map(([key, val]) => ({
    dim: DIMS[key]?.label || key,
    value: val,
  }));

  const barData = Object.entries(result.scores).map(([key, val]) => ({
    dim: DIMS[key]?.label || key,
    value: val,
  }));

  const handleCopy = () => {
    navigator.clipboard.writeText(result.rewritten_prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const riskCount = result.findings?.filter((f) => f.type === "risk").length || 0;
  const goodCount = result.findings?.filter((f) => f.type === "good").length || 0;

  return (
    <div className="results-wrap">

      {/* ─ Overall score ─ */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">// audit result</span>
          <span className="panel-badge">{industry}</span>
        </div>
        <div className="score-hero">
          <ScoreRing value={result.overall} />
          <div className="score-meta">
            <div className="score-verdict">{result.verdict}</div>
            <div className="score-sub">
              {riskCount} risk{riskCount !== 1 ? "s" : ""} identified · {goodCount} strength{goodCount !== 1 ? "s" : ""} confirmed ·{" "}
              {result.findings?.length || 0} total findings
            </div>
            <div className="score-tags">
              <span className="score-tag ind">{industry}</span>
              <span className="score-tag">LLaMA-3.3-70B</span>
              <span className="score-tag">Groq Inference</span>
              <span className="score-tag">AIE Alignment</span>
            </div>
          </div>
          <div className={`production-label ${pv.cls}`}>{pv.label}</div>
        </div>

        {/* Dimension tiles */}
        <div className="dim-grid">
          {Object.entries(result.scores).map(([key, val]) => (
            <div className="dim-tile" key={key}>
              <div className="dim-label">{DIMS[key]?.label || key}</div>
              <div className="dim-score" style={{ color: scoreColor(val) }}>{val}</div>
              <div className="dim-bar-bg">
                <div className="dim-bar-fill" style={{ width: `${val}%`, background: scoreColor(val) }} />
              </div>
              <div className="dim-desc">{DIMS[key]?.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─ Charts + Findings ─ */}
      <div className="two-col">

        {/* Radar */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">// risk profile radar</span>
          </div>
          <div style={{ padding: "16px 8px" }}>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} margin={{ top: 10, right: 32, bottom: 10, left: 32 }}>
                <PolarGrid stroke="rgba(99,140,255,0.1)" />
                <PolarAngleAxis
                  dataKey="dim"
                  tick={{ fill: "#3d5080", fontSize: 10, fontFamily: "DM Mono" }}
                />
                <Radar
                  dataKey="value"
                  stroke="#4f8fff"
                  fill="#4f8fff"
                  fillOpacity={0.12}
                  strokeWidth={1.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart below radar */}
          <div style={{ padding: "0 16px 16px" }}>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={barData} barSize={20} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="dim" tick={{ fill: "#3d5080", fontSize: 9, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={false} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,140,255,0.05)" }} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={scoreColor(entry.value)} fillOpacity={0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Findings */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">// findings</span>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--risk)" }}>
                {riskCount} risk{riskCount !== 1 ? "s" : ""}
              </span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-dim)" }}>·</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--good)" }}>
                {goodCount} good
              </span>
            </div>
          </div>
          <div>
            {result.findings?.map((f, i) => (
              <div className="finding-row" key={i}>
                <span className={`finding-tag tag-${f.type}`}>{f.type}</span>
                <span className="finding-text">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─ Rewrite ─ */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">// suggested rewrite</span>
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
        <div className="rewrite-label">
          ORIGINAL → PRODUCTION-HARDENED · context + prompt engineering applied
        </div>
        <div className="rewrite-body">{result.rewritten_prompt}</div>
      </div>

      {/* ─ AIE Alignment ─ */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">// lazarus aie alignment</span>
          <span className="panel-badge">Applied Intelligence Engine</span>
        </div>
        <div className="aie-grid">
          <div className="aie-tile">
            <div className="aie-icon">Problem Engineering</div>
            <div className="aie-title">Is the right problem being solved?</div>
            <div className="aie-body">
              Lazarus AIE starts with problem framing before touching a model. This audit checks whether your prompt addresses a well-scoped, solvable problem — not a symptom of a deeper architecture gap.
            </div>
            <div className="aie-metric">
              <span className="aie-metric-num" style={{ color: scoreColor(result.scores.auditability) }}>
                {result.scores.auditability}
              </span>
              <span className="aie-metric-label">auditability score</span>
            </div>
          </div>
          <div className="aie-tile">
            <div className="aie-icon">Context Engineering</div>
            <div className="aie-title">Is the model given what it needs?</div>
            <div className="aie-body">
              Context engineering ensures models receive the right data, in the right format, at the right layer. This audit evaluates whether your prompt supplies enough structured context for consistent, auditable outputs.
            </div>
            <div className="aie-metric">
              <span className="aie-metric-num" style={{ color: scoreColor(result.scores.explainability) }}>
                {result.scores.explainability}
              </span>
              <span className="aie-metric-label">explainability score</span>
            </div>
          </div>
          <div className="aie-tile">
            <div className="aie-icon">Prompt Engineering</div>
            <div className="aie-title">Will this survive model updates?</div>
            <div className="aie-body">
              Prompt brittleness is the #1 cause of pilot-to-production failure. This audit measures regression risk, consistency, and integration safety — the three vectors where enterprise prompts most commonly break.
            </div>
            <div className="aie-metric">
              <span className="aie-metric-num" style={{ color: scoreColor(result.scores.regression_risk) }}>
                {result.scores.regression_risk}
              </span>
              <span className="aie-metric-label">regression risk score</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
