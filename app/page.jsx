"use client";
import "./global.css";
import { useState, useRef, useCallback } from "react";
import {
  FiFileText,
  FiZap,
  FiAlertTriangle,
  FiTarget,
  FiCheck,
  FiX,
  FiPlus,
  FiClipboard,
  FiDownload,
  FiRefreshCw,
  FiCornerUpLeft
} from "react-icons/fi";
import { BsDiamondFill, BsFillLightbulbFill } from "react-icons/bs";
import { FaBullseye } from "react-icons/fa";
import { FaRobot } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
function getScoreColor(s) {
  if (s >= 75) return "#6af7a0";
  if (s >= 50) return "#f7c46a";
  return "#f76a6a";
}

function CircleScore({ score }) {
  const r = 52, c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = getScoreColor(score);
  return (
    <div className="score-ring-wrap">
      <svg className="score-ring" viewBox="0 0 120 120">
        <circle className="score-ring-bg" cx="60" cy="60" r={r} />
        <circle className="score-ring-fill" cx="60" cy="60" r={r}
          stroke={color} strokeDasharray={c} strokeDashoffset={offset} />
      </svg>
      <div className="score-center">
        <span className="score-num" style={{ color }}>{score}%</span>
        <span className="score-label">Match</span>
      </div>
    </div>
  );
}

const SECTION_TABS = ["Summary", "Skills", "Experience", "Projects"];

export default function Home() {
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [isDrag, setIsDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Summary");
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    setError("");
    setFileName(file.name);
    setLoadMsg("Reading resume...");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResumeText(data.text);
    } catch (e) {
      setError(e.message || "Could not read file");
      setFileName("");
    } finally {
      setLoading(false);
      setLoadMsg("");
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setIsDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const analyze = async () => {
    if (!resumeText || !jobDesc) return;
    setError(""); setResult(null); setLoading(true);
    const msgs = ["Parsing resume structure...", "Analyzing job requirements...", "Matching skills and keywords...", "Scoring sections...", "Generating suggestions..."];
    let i = 0;
    setLoadMsg(msgs[i]);
    const interval = setInterval(() => { i = (i + 1) % msgs.length; setLoadMsg(msgs[i]); }, 1400);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDesc }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setActiveTab("Summary");
    } catch (e) {
      setError(e.message || "Analysis failed. Please try again.");
    } finally {
      clearInterval(interval);
      setLoading(false);
      setLoadMsg("");
    }
  };

  const reset = () => { setResult(null); setResumeText(""); setFileName(""); setJobDesc(""); setError(""); };

  const downloadReport = () => {
    if (!result) return;
    const lines = [
      `RESUME ANALYSIS REPORT`, `======================`, ``,
      `Match Score: ${result.matchScore}%`, `ATS Score: ${result.atsScore}%`, ``,
      `VERDICT`, result.verdict, ``,
      `TOP SKILLS`, result.skillsFromResume, ``,
      `MATCHED SKILLS`, result.matchedSkills.join(", "), ``,
      `MISSING SKILLS`, result.missingSkills.join(", "), ``,
      `SUGGESTED KEYWORDS`, result.suggestedKeywords.join(", "), ``,
      `TOP IMPROVEMENTS`, ...result.topImprovements.map((t, i) => `${i + 1}. ${t}`), ``,
      `SECTION SCORES`,
      ...Object.entries(result.sections).map(([k, v]) => `${k}: ${v.score}%\n  ${v.feedback}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "resume-analysis.txt";
    a.click(); URL.revokeObjectURL(url);
  };

  const sec = result?.sections?.[activeTab];

  return (
    <div className="app">
      <div className="noise" />
      <div className="glow-orb orb1" />
      <div className="glow-orb orb2" />

      <div className="container">
        <header>
          <div className="header-inner">
            <div className="logo">
              <span className="logo-dot" />
              Fit<span>with JD</span>
            </div>
          </div>
        </header>

        <div className="hero">
          <div className="hero-tag">Resume Analyzing Tool</div>
          <h1>Know Exactly <em>Why</em> You<br />Didn&apos;t Get the Interview</h1>
          <p>Upload your resume, paste any job description, and get a precise ATS analysis with section-level feedback.</p>
        </div>

        <div className="two-col">
          <div className="panel">
            <div className="panel-label">01 — Your Resume</div>
            <div
              className={`upload-zone${isDrag ? " drag" : ""}${resumeText ? " has-file" : ""}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDrag(true); }}
              onDragLeave={() => setIsDrag(false)}
              onDrop={handleDrop}
            >
              <div className="upload-icon">{resumeText ? <FiCheck /> : <FiFileText />}</div>
              <div className="upload-title">{resumeText ? "Resume Loaded" : "Drop PDF or TXT File here"}</div>
              <div className="upload-sub">{resumeText ? "Click to replace" : "or click to browse"}</div>
              {fileName && <div className="upload-file-name">📎 {fileName}</div>}
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.txt" onChange={e => handleFile(e.target.files[0])} />
          </div>

          <div className="panel">
            <div className="panel-label">02 — Job Description</div>
            <textarea
              placeholder="Paste the full job description here — include requirements, responsibilities, and any skills listed..."
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
            />
          </div>
        </div>

        <button
          className="btn btn-primary btn-full"
          disabled={loading || !resumeText || !jobDesc.trim()}
          onClick={analyze}
        >
          {loading ? "Analyzing..." : "Analyze My Resume"}
        </button>

        {loading && (
          <div style={{ marginTop: 24 }}>
            <div className="loading-bar"><div className="loading-fill" /></div>
            <div className="loading-msg">{loadMsg}</div>
          </div>
        )}

        {error && <div className="error-box"><FiAlertTriangle />{error}</div>}

        {/* Results */}
        {result && (
          <div className="results" style={{ marginTop: 40 }}>

            <div className="score-banner">
              <CircleScore score={result.matchScore} />
              <div className="score-details">
                <div className="score-title">
                  {result.matchScore >= 75 ? (
                    <>Strong Match <FiTarget /></>
                  ) : result.matchScore >= 50 ? (
                    <>Moderate Match <BsDiamondFill /></>
                  ) : (
                    <>Weak Match <FiAlertTriangle /></>
                  )}
                </div>
                <div className="score-verdict">{result.verdict}</div>
                <div className="score-chips">
                  <span className="chip chip-green"><FiCheck/> {result.matchedSkills.length} matched</span>
                  <span className="chip chip-red"><FiX/> {result.missingSkills.length} missing</span>
                  <span className="chip chip-purple"><FiPlus/> {result.suggestedKeywords.length} keywords</span>
                  <span className="chip chip-yellow">ATS {result.atsScore}%</span>
                </div>
              </div>
            </div>

            <div className="section-grid">
              {result.allResumeSkills?.length > 0 && (
                <div className="card" style={{ gridColumn: "1 / -1" }}>
                  <div className="card-title"><FiFileText/> All Skills Found in Your Resume</div>
                  <div className="tag-list">
                    {result.allResumeSkills.map(s => (
                      <span key={s} className="tag"
                        style={{ background: "rgba(255,255,255,0.05)", color: "#c5c5d8", border: "1px solid rgba(255,255,255,0.1)" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="card">
                <div className="card-title"><FiCheck/> Matched Skills</div>
                <div className="tag-list">{result.matchedSkills.slice(0, 16).map(s => <span key={s} className="tag tag-match">{s}</span>)}</div>
              </div>
              <div className="card">
                <div className="card-title"><FiX/> Missing Skills</div>
                <div className="tag-list">{result.missingSkills.slice(0, 16).map(s => <span key={s} className="tag tag-miss">{s}</span>)}</div>
              </div>
              <div className="card">
                <div className="card-title"><BsFillLightbulbFill/> Keyword Suggestions</div>
                <div className="tag-list">{result.suggestedKeywords.slice(0, 16).map(s => <span key={s} className="tag tag-suggest">{s}</span>)}</div>
              </div>
              <div className="card">
                <div className="card-title"><FaBullseye/> Top Improvements</div>
                <ul className="bullet-list">
                  {(result.topImprovements || []).slice(0, 5).map((t, i) => <li key={i} className="bullet-item">{t}</li>)}
                </ul>
              </div>
            </div>

            {result.atsBreakdown && (
              <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-title"><FaRobot/> ATS Breakdown</div>
                <div className="ats-meter">
                  {[
                    { label: "Keyword Density", key: "keywordDensity" },
                    { label: "Formatting & Structure", key: "formatting" },
                    { label: "Section Clarity", key: "sectionClarity" },
                  ].map(({ label, key }) => {
                    const val = result.atsBreakdown[key] ?? 0;
                    const col = getScoreColor(val);
                    return (
                      <div key={key}>
                        <div className="ats-row">
                          <span className="ats-label">{label}</span>
                          <span className="ats-val" style={{ color: col }}>{val}%</span>
                        </div>
                        <div className="ats-bar"><div className="ats-fill" style={{ width: `${val}%`, background: col }} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, marginBottom: 16, letterSpacing: -0.5 }}>
                Section-Level Analysis
              </div>
              <div className="section-tabs">
                {SECTION_TABS.map(tab => (
                  <button key={tab} className={`tab${activeTab === tab ? " active" : ""}`} onClick={() => setActiveTab(tab)}>{tab}</button>
                ))}
              </div>
              {sec && (
                <div className="section-content">
                  <div className="section-score-row">
                    <span className="mini-score" style={{ color: getScoreColor(sec.score) }}>{sec.score}%</span>
                    <div className="mini-bar"><div className="mini-bar-fill" style={{ width: `${sec.score}%`, background: getScoreColor(sec.score) }} /></div>
                  </div>
                  <div className="feedback-block">
                    <h4>Feedback</h4>
                    <p>{sec.feedback}</p>
                  </div>
                  {sec.weakPoints?.length > 0 && (
                    <div className="feedback-block" style={{ marginTop: 14 }}>
                      <h4>Weak Points</h4>
                      <ul>{sec.weakPoints.map((p, i) => <li key={i}>{p}</li>)}</ul>
                    </div>
                  )}
                  {sec.rewrite && (
                    <div className="rewrite-box">
                      <div className="rewrite-label"><HiSparkles size={12}/> Suggested Rewrite</div>
                      {sec.rewrite}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="actions-row">
              <button className="btn btn-outline" onClick={reset}><FiCornerUpLeft/> Start Over</button>
              <button className="btn btn-outline" onClick={downloadReport}><FiDownload/> Download Report</button>
              <button className="btn btn-primary" onClick={analyze}><FiRefreshCw/> Re-analyze</button>
            </div>
          </div>
        )}
        <div style={{ height: 64 }} />
      </div>
    </div>
  );
}
