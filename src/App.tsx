import { useMemo, useState } from "react";

type Severity = "Critical" | "High" | "Medium" | "Low";
type Indicator = {
  id: string;
  type: "IP" | "Domain" | "Hash" | "URL" | "Email";
  value: string;
  severity: Severity;
  confidence: number;
  source: string;
  campaign: string;
  seen: string;
  related: string[];
  context: string;
};

const indicators: Indicator[] = [
  { id: "i-01", type: "Domain", value: "cdn-update-svc[.]net", severity: "Critical", confidence: 94, source: "Feed A · passive DNS", campaign: "Silent Cascade", seen: "2026-03-18", related: ["i-02", "i-05", "i-07"], context: "Newly registered domain resolving to infrastructure linked to a known campaign cluster. Certificate reuse observed across three hosts." },
  { id: "i-02", type: "IP", value: "185.220.101[.]42", severity: "High", confidence: 88, source: "Feed B · honeypot", campaign: "Silent Cascade", seen: "2026-03-17", related: ["i-01", "i-04"], context: "Exit node observed scanning exposed remote-access services. Traffic overlaps with the Silent Cascade cluster." },
  { id: "i-03", type: "Hash", value: "9f2a…c41d (SHA-256)", severity: "High", confidence: 91, source: "Feed C · malware lab", campaign: "Quiet Ledger", seen: "2026-03-16", related: ["i-06", "i-08"], context: "Sample exhibits string obfuscation and a loader stub matching previously catalogued families." },
  { id: "i-04", type: "URL", value: "hxxps://docs-panel[.]info/auth", severity: "Medium", confidence: 76, source: "Feed A · URL scan", campaign: "Silent Cascade", seen: "2026-03-15", related: ["i-02", "i-05"], context: "Credential-harvesting page imitating a document portal. Form action posts to an external collector." },
  { id: "i-05", type: "Email", value: "billing@secure-invoice[.]co", severity: "Medium", confidence: 72, source: "Feed D · mail telemetry", campaign: "Silent Cascade", seen: "2026-03-14", related: ["i-01", "i-04"], context: "Sender domain used in phishing lures referencing fake invoices. Low-volume, targeted distribution." },
  { id: "i-06", type: "IP", value: "45.155.205[.]19", severity: "High", confidence: 85, source: "Feed B · sinkhole", campaign: "Quiet Ledger", seen: "2026-03-13", related: ["i-03", "i-08"], context: "Command-and-control endpoint sinkholed after correlation with malware sample beaconing." },
  { id: "i-07", type: "Domain", value: "static-assets-cache[.]com", severity: "Low", confidence: 64, source: "Feed A · passive DNS", campaign: "Unattributed", seen: "2026-03-12", related: ["i-01"], context: "Shared registration metadata with the primary domain. No direct malicious activity observed." },
  { id: "i-08", type: "Hash", value: "3b7e…90af (SHA-256)", severity: "Medium", confidence: 79, source: "Feed C · malware lab", campaign: "Quiet Ledger", seen: "2026-03-11", related: ["i-03", "i-06"], context: "Configuration file extracted from the same sample family; contains the sinkholed endpoint." },
];

const nodes = [
  { id: "i-01", x: 300, y: 190 }, { id: "i-02", x: 150, y: 95 }, { id: "i-05", x: 470, y: 100 },
  { id: "i-07", x: 500, y: 300 }, { id: "i-04", x: 130, y: 290 }, { id: "i-03", x: 300, y: 350 },
  { id: "i-06", x: 145, y: 410 }, { id: "i-08", x: 455, y: 430 },
];

export function App() {
  const [severity, setSeverity] = useState<Severity | "All">("All");
  const [type, setType] = useState<Indicator["type"] | "All">("All");
  const [selected, setSelected] = useState("i-01");
  const filtered = useMemo(
    () => indicators.filter((i) => (severity === "All" || i.severity === severity) && (type === "All" || i.type === type)),
    [severity, type],
  );
  const active = indicators.find((i) => i.id === selected) ?? indicators[0]!;
  const byId = (id: string) => indicators.find((i) => i.id === id);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">SI</span><span>Signal <b>Threat Intelligence</b></span></div>
        <div className="feeds"><span className="pulse" /> 4 feeds connected · last sync 2m ago</div>
      </header>
      <main className="main">
        <div className="page-head">
          <div><p className="eyebrow">Analyst workspace</p><h1>Correlation overview</h1></div>
          <p className="sub">Normalize. Correlate. Follow the evidence.</p>
        </div>
        <div className="stats">
          {[
            ["Indicators", "1,284", "+38 today"],
            ["Active campaigns", "7", "2 new"],
            ["High confidence", "68%", "+4 pts"],
            ["Critical alerts", "3", "needs review"],
          ].map(([label, value, note]) => (
            <div className="stat" key={label}><p>{label}</p><b>{value}</b><small>{note}</small></div>
          ))}
        </div>
        <div className="grid">
          <section className="panel feed">
            <div className="feed-head">
              <p className="panel-title">Indicator feed</p>
              <div className="filters">
                <select value={severity} onChange={(e) => setSeverity(e.target.value as Severity | "All")} aria-label="Filter by severity">
                  <option>All</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
                </select>
                <select value={type} onChange={(e) => setType(e.target.value as Indicator["type"] | "All")} aria-label="Filter by type">
                  <option>All</option><option>IP</option><option>Domain</option><option>Hash</option><option>URL</option><option>Email</option>
                </select>
              </div>
            </div>
            <div className="rows">
              {filtered.map((i) => (
                <button className={`row ${i.id === selected ? "active" : ""}`} key={i.id} onClick={() => setSelected(i.id)}>
                  <span className={`sev ${i.severity.toLowerCase()}`}>{i.severity}</span>
                  <span className="row-main"><code>{i.value}</code><small>{i.type} · {i.campaign}</small></span>
                  <span className="conf">{i.confidence}%</span>
                </button>
              ))}
              {filtered.length === 0 && <p className="dim">No indicators match those filters.</p>}
            </div>
          </section>

          <section className="panel graph">
            <p className="panel-title">Relationship graph</p>
            <svg viewBox="0 0 600 480" className="network" role="img" aria-label="Indicator relationship graph">
              <defs>
                <radialGradient id="halo"><stop stopColor="#22d3ee" stopOpacity=".22" /><stop offset="1" stopColor="#22d3ee" stopOpacity="0" /></radialGradient>
              </defs>
              <circle cx="300" cy="240" r="220" fill="url(#halo)" />
              {[80, 150, 220].map((r) => <circle key={r} cx="300" cy="240" r={r} fill="none" stroke="rgba(148,163,184,.1)" />)}
              {nodes.flatMap((n) => (byId(n.id)?.related ?? []).map((rid) => {
                const target = nodes.find((t) => t.id === rid);
                if (!target) return null;
                const highlighted = n.id === selected || rid === selected;
                return <line key={`${n.id}-${rid}`} x1={n.x} y1={n.y} x2={target.x} y2={target.y} stroke={highlighted ? "#22d3ee" : "rgba(59,130,246,.35)"} strokeWidth={highlighted ? 2 : 1} strokeDasharray={highlighted ? undefined : "5 6"} />;
              }))}
              {nodes.map((n) => {
                const ind = byId(n.id);
                const isActive = n.id === selected;
                return (
                  <g key={n.id} onClick={() => setSelected(n.id)} style={{ cursor: "pointer" }}>
                    <circle cx={n.x} cy={n.y} r={isActive ? 22 : 15} fill="#08131c" stroke={isActive ? "#22d3ee" : "#3b82f6"} strokeWidth={isActive ? 3 : 1.5} />
                    <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono, monospace" fill={isActive ? "#22d3ee" : "#8ea3b4"}>{ind?.type.slice(0, 3).toUpperCase()}</text>
                  </g>
                );
              })}
            </svg>
            <p className="graph-note">Click a node to inspect · lines show correlated indicators</p>
          </section>

          <section className="panel detail">
            <p className="panel-title">Indicator detail</p>
            <div className="detail-head">
              <span className={`sev ${active.severity.toLowerCase()}`}>{active.severity}</span>
              <span className="type-tag">{active.type}</span>
            </div>
            <code className="detail-value">{active.value}</code>
            <div className="meta">
              <div><span>Campaign</span><b>{active.campaign}</b></div>
              <div><span>Confidence</span><b>{active.confidence}%</b></div>
              <div><span>Source</span><b>{active.source}</b></div>
              <div><span>First seen</span><b>{active.seen}</b></div>
            </div>
            <p className="context">{active.context}</p>
            <div className="related">
              <p className="panel-title">Related indicators</p>
              {active.related.map((rid) => {
                const r = byId(rid);
                return r ? <button key={rid} onClick={() => setSelected(rid)}><code>{r.value}</code><span>{r.type}</span></button> : null;
              })}
            </div>
          </section>
        </div>
      </main>
      <footer className="watermark"><span className="wm-mark">SY</span> SYFERON</footer>
    </div>
  );
}
