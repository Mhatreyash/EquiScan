"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { analyzeFile, AnalyzeResponse } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";

const DonutChart = ({ score, color, isDark }: { score: number; color: string; isDark: boolean }) => {
  const r = 38;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative w-44 h-44">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"} strokeWidth="10" fill="transparent" />
        <motion.circle
          cx="50" cy="50" r={r} stroke={color} strokeWidth="10" fill="transparent"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }} strokeLinecap="round" transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tracking-tighter text-t-primary">{score}</span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-t-muted mt-1">risk</span>
      </div>
    </div>
  );
};

const StatusDot = ({ color }: { color: string }) => (
  <span className="relative flex h-2 w-2">
    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75`} style={{ backgroundColor: color }} />
    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: color }} />
  </span>
);

const SCAN_LOGS = [
  "[INIT] Ingesting CSV data stream...",
  "[PARSE] Validating column schema & data types...",
  "[MAP] Mapping demographic vectors across protected classes...",
  "[AI] Initializing XGBoost classifier (n_estimators=500)...",
  "[AI] Running SHAP TreeExplainer on feature matrix...",
  "[CALC] Computing Disparate Impact Ratio (4/5ths rule)...",
  "[AUDIT] Cross-referencing EEOC compliance thresholds...",
  "[REPORT] Assembling risk assessment payload...",
];

const ScanTerminal = () => {
  const [lines, setLines] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [logIndex, setLogIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const progress = Math.min(((logIndex + (charIndex / (SCAN_LOGS[logIndex]?.length || 1))) / SCAN_LOGS.length) * 100, 100);

  useEffect(() => {
    if (logIndex >= SCAN_LOGS.length) return;
    const fullLine = SCAN_LOGS[logIndex];
    if (charIndex < fullLine.length) {
      const timer = setTimeout(() => {
        setCurrentText(fullLine.slice(0, charIndex + 1));
        setCharIndex((c) => c + 1);
      }, 18 + Math.random() * 25);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setLines((prev) => [...prev, fullLine]);
        setCurrentText("");
        setCharIndex(0);
        setLogIndex((i) => i + 1);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [logIndex, charIndex]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines, currentText]);

  return (
    <div className="w-full max-w-2xl">
      {/* Terminal Window */}
      <div className="rounded-xl overflow-hidden border border-border-card bg-bg-secondary shadow-[var(--shadow-card)]">
        {/* Title Bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-subtle">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-danger/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-warn/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-safe/70" />
          </div>
          <span className="text-[10px] font-mono text-t-muted ml-2">equi://audit-engine — scanning</span>
          <div className="ml-auto flex items-center gap-1.5">
            <StatusDot color="var(--color-safe)" />
            <span className="text-[10px] font-mono text-safe/70">LIVE</span>
          </div>
        </div>

        {/* Log Output */}
        <div ref={containerRef} className="p-4 h-56 overflow-y-auto font-mono text-[13px] leading-relaxed space-y-1">
          {lines.map((line, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-zinc-700 select-none shrink-0">{String(i + 1).padStart(2, "0")}</span>
              <span className={line.includes("[AI]") ? "text-warn" : line.includes("[AUDIT]") || line.includes("[REPORT]") ? "text-safe" : "text-t-secondary"}>
                {line}
              </span>
            </div>
          ))}
          {logIndex < SCAN_LOGS.length && (
            <div className="flex gap-2">
              <span className="text-zinc-700 select-none shrink-0">{String(lines.length + 1).padStart(2, "0")}</span>
              <span className="text-safe">
                {currentText}<span className="animate-blink">▌</span>
              </span>
            </div>
          )}
          {logIndex >= SCAN_LOGS.length && (
            <div className="flex gap-2 mt-2">
              <span className="text-zinc-700 select-none shrink-0">{'>>'}  </span>
              <span className="text-safe font-semibold">Audit complete. Rendering dashboard<span className="animate-blink">▌</span></span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.1em]">Progress</span>
            <span className="text-[10px] font-mono text-safe">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/[0.04] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-safe/70 to-safe"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMitigating, setIsMitigating] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      document.body.style.backgroundColor = "#141418";
    } else {
      root.classList.remove("dark");
      document.body.style.backgroundColor = "#faf8f5";
    }
    document.body.style.transition = "background-color 0.4s ease";
  }, [isDarkMode]);

  const handleUpload = async (selectedFile: File) => {
    setStatus("loading");
    setError(null);
    try {
      const result = await analyzeFile(selectedFile);
      setTimeout(() => { setData(result); setStatus("success"); }, 1500);
    } catch (err) {
      setError("Failed to analyze dataset. Please ensure it is a valid CSV and try again.");
      setStatus("idle");
    }
  };

  const handleMitigate = async () => {
    setIsMitigating(true);
    try {
      const { mitigateFile } = await import("@/services/api");
      const result = await mitigateFile();
      setTimeout(() => { setData(result); setIsMitigating(false); }, 2000);
    } catch (err) {
      setError("Failed to mitigate data.");
      setIsMitigating(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) { setFile(e.target.files[0]); setError(null); }
  };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => { setIsDragging(false); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const f = e.dataTransfer.files[0];
      if (f.name.endsWith(".csv")) { setFile(f); setError(null); }
      else { setError("Invalid file type. Please upload a .csv file."); }
    }
  };
  const resetState = () => { setFile(null); setData(null); setStatus("idle"); setError(null); };

  const getRiskColor = (score: number) => {
    if (score < 40) return { hex: "var(--color-safe)", text: "text-safe", bg: "bg-safe", dim: "bg-safe-dim", border: "border-safe/20" };
    if (score < 70) return { hex: "var(--color-warn)", text: "text-warn", bg: "bg-warn", dim: "bg-warn-dim", border: "border-warn/20" };
    return { hex: "var(--color-danger)", text: "text-danger", bg: "bg-danger", dim: "bg-danger-dim", border: "border-danger/20" };
  };

  const getDemoBarColor = (group: "Male" | "Female") => {
    if (!data) return "bg-safe";
    const maleRate = data.demographics.Male.approval_rate;
    const femaleRate = data.demographics.Female.approval_rate;
    if (group === "Male") return maleRate >= femaleRate ? "bg-safe" : "bg-danger";
    return femaleRate >= maleRate ? "bg-safe" : "bg-danger";
  };

  const generateChecklist = (ratio: number) => [
    { name: "Four-Fifths (80%) Rule", passed: ratio >= 0.8 },
    { name: "Demographic Parity", passed: ratio >= 0.9 },
    { name: "Equal Opportunity", passed: ratio >= 0.75 },
    { name: "Predictive Equality", passed: true },
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-t-primary font-sans bg-grid transition-colors duration-400">
      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-xl transition-colors duration-400">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={resetState}>
            <div className="w-7 h-7 rounded-md bg-safe-dim border border-safe/20 flex items-center justify-center text-safe group-hover:bg-safe/20 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <span className="font-semibold text-sm tracking-tight text-t-primary">EquiScan</span>
            <span className="text-[10px] font-mono text-t-muted border border-border-card rounded px-1.5 py-0.5">v2.0</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[11px] font-mono text-t-muted">
              <StatusDot color="var(--color-safe)" />
              <span>SYSTEM ONLINE</span>
            </div>
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg border border-border-card bg-bg-card hover:bg-bg-card-hover transition-all text-t-secondary hover:text-t-primary"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-10">
        <AnimatePresence mode="wait">

          {/* ── IDLE / UPLOAD ── */}
          {status === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="flex flex-col items-center">
              <div className="text-center max-w-2xl mb-14 mt-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-card bg-bg-card text-[11px] font-mono text-t-muted uppercase tracking-[0.15em] mb-6">
                  <StatusDot color="var(--color-safe)" />
                  Algorithmic Audit Engine
                </div>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-5 text-t-primary leading-[1.1]">
                  Bias Detection<br />
                  <span className="text-accent">& Compliance.</span>
                </h1>
                <p className="text-base text-t-secondary leading-relaxed max-w-lg mx-auto">
                  Upload historical HR datasets to generate disparate impact analysis, SHAP-powered explanations, and automated legal risk assessments.
                </p>
              </div>

              <div className="w-full max-w-xl relative">
                <div
                  onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                  className={`refined-card relative w-full rounded-2xl border-dashed p-14 flex flex-col items-center justify-center gap-5 transition-all ${
                    isDragging ? "border-safe bg-safe-dim scale-[1.02]" : "border-border-card hover:border-t-muted"
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl bg-bg-secondary border border-border-card flex items-center justify-center text-t-muted">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-semibold text-t-primary mb-1">Upload Dataset</h3>
                    <p className="text-xs text-t-muted font-mono">Drag .CSV or click to browse</p>
                  </div>
                  <input type="file" accept=".csv" onChange={onFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-lg bg-danger-dim border border-danger/20 text-danger text-xs font-mono text-center">
                    {error}
                  </motion.div>
                )}

                {file && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="refined-card mt-4 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-safe-dim flex items-center justify-center text-safe">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-t-primary">{file.name}</p>
                        <p className="text-[11px] font-mono text-t-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button onClick={() => handleUpload(file)} className="px-5 py-2 rounded-lg bg-safe text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                      Run Audit →
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── LOADING: SCAN TERMINAL ── */}
          {status === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }} className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
              <div className="text-center mb-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-safe/20 bg-safe-dim text-[10px] font-mono text-safe uppercase tracking-[0.15em] mb-4">
                  <StatusDot color="var(--color-safe)" />
                  Audit In Progress
                </div>
                <h2 className="text-xl font-semibold tracking-tighter text-t-primary">Scanning Dataset</h2>
              </div>
              <ScanTerminal />
            </motion.div>
          )}

          {/* ── SUCCESS / DASHBOARD ── */}
          {status === "success" && data && (
            <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full">

              {/* Header Row */}
              <div className="flex items-end justify-between mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-safe-dim text-safe text-[10px] font-mono uppercase tracking-[0.15em]">
                      <StatusDot color="var(--color-safe)" /> Audit Complete
                    </span>
                    <span className="text-[11px] font-mono text-t-muted">{data.filename}</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tighter text-t-primary">Compliance Dashboard</h2>
                </div>
                <button onClick={resetState} className="px-4 py-2 rounded-lg border border-border-card bg-bg-card text-t-secondary text-xs font-medium hover:bg-bg-card-hover hover:text-t-primary transition-all">
                  New Audit
                </button>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Total Records */}
                <div className="refined-card rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono uppercase tracking-[0.1em] text-t-muted">Total Records</span>
                    <div className="p-1.5 rounded-md bg-accent-dim text-accent"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg></div>
                  </div>
                  <div className="text-3xl font-bold tracking-tighter text-t-primary"><CountUp end={data.total_records} duration={2} separator="," /></div>
                  <div className="text-[10px] font-mono text-t-muted mt-1">dataset entries</div>
                </div>

                {/* Impact Ratio */}
                <div className="refined-card rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono uppercase tracking-[0.1em] text-t-muted">Impact Ratio</span>
                    <div className={`p-1.5 rounded-md ${data.disparate_impact_ratio >= 0.8 ? "bg-safe-dim text-safe" : "bg-danger-dim text-danger"}`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                    </div>
                  </div>
                  <div className={`text-3xl font-bold tracking-tighter ${data.disparate_impact_ratio >= 0.8 ? "text-safe" : "text-danger"}`}>{data.disparate_impact_ratio}</div>
                  <div className="text-[10px] font-mono text-t-muted mt-1">disparate impact</div>
                </div>

                {/* Risk Status - spans 2 cols */}
                <div className={`refined-card rounded-xl p-5 col-span-1 lg:col-span-2 border-l-2 ${getRiskColor(data.risk_score).border}`}
                  style={{ borderLeftColor: getRiskColor(data.risk_score).hex }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[11px] font-mono uppercase tracking-[0.1em] ${getRiskColor(data.risk_score).text}`}>
                      Status: {data.risk_status}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold text-white ${getRiskColor(data.risk_score).bg}`}>
                      SCORE <CountUp end={data.risk_score} duration={1.8} />
                    </span>
                  </div>
                  <p className="text-sm text-t-secondary leading-relaxed mt-2">{data.recommendation}</p>
                </div>
              </div>

              {/* ── XAI MITIGATION CONSOLE ── */}
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
                className="refined-card rounded-xl mb-4 overflow-hidden"
              >
                {/* Console Header Bar */}
                <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border-subtle">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-danger/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-warn/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-safe/70" />
                  </div>
                  <span className="text-[10px] font-mono text-t-muted ml-2">equi://xai-mitigation-console</span>
                </div>

                <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                  {/* Left: Terminal Output */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="p-1 rounded bg-warn text-white"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></span>
                      <h3 className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-warn">XGBoost & SHAP Analysis</h3>
                    </div>
                    <div className="bg-bg-secondary rounded-lg p-4 border border-border-subtle">
                      <p className="text-sm font-mono text-safe leading-relaxed">
                        <span className="text-t-muted select-none">$ </span>
                        {data.ai_explanation || "AI Analysis running... detecting complex feature interactions."}
                        <span className="animate-blink text-safe">▌</span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Glowing Mitigate Button */}
                  {data.risk_score > 40 && (
                    <div className="shrink-0 flex flex-col items-center gap-2">
                      <motion.button
                        onClick={handleMitigate} disabled={isMitigating}
                        whileHover={{ scale: isMitigating ? 1 : 1.05 }} whileTap={{ scale: isMitigating ? 1 : 0.97 }}
                        className={`relative px-6 py-3 rounded-lg text-xs font-mono font-bold uppercase tracking-[0.1em] transition-all ${
                          isMitigating
                            ? "bg-bg-secondary text-t-muted cursor-not-allowed"
                            : "bg-danger text-white shadow-[0_0_15px_rgba(192,96,90,0.3)] hover:shadow-[0_0_25px_rgba(192,96,90,0.45)]"
                        }`}
                      >
                        {!isMitigating && <span className="absolute inset-0 rounded-lg animate-pulse-glow bg-danger/15" />}
                        <span className="relative z-10">{isMitigating ? "Recalibrating Neural Weights..." : "Initiate Neural Mitigation"}</span>
                      </motion.button>
                      {!isMitigating && <span className="text-[9px] font-mono text-t-muted">CAUTION: Irreversible operation</span>}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                {/* Donut */}
                <div className="refined-card rounded-xl p-6 flex flex-col items-center justify-center">
                  <h3 className="text-[11px] font-mono uppercase tracking-[0.1em] text-t-muted mb-6 w-full text-left">Risk Assessment</h3>
                  <DonutChart score={data.risk_score} color={getRiskColor(data.risk_score).hex} isDark={isDarkMode} />
                  <p className="text-[11px] text-t-muted text-center mt-6 leading-relaxed">Lower score indicates better compliance with demographic parity laws.</p>
                </div>

                {/* Bar Chart */}
                <div className="refined-card rounded-xl p-6 col-span-1 lg:col-span-2 flex flex-col justify-between">
                  <h3 className="text-[11px] font-mono uppercase tracking-[0.1em] text-t-muted mb-6">Approval Distribution</h3>
                  <div className="space-y-6 flex-1 flex flex-col justify-center">
                    {/* Male */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-t-primary">Male</span>
                        <span className="text-xs font-mono text-t-secondary">{data.demographics.Male.approval_rate}%</span>
                      </div>
                      <div className="h-3 w-full rounded-full overflow-hidden bg-bg-secondary">
                        <motion.div className={`h-full rounded-full ${getDemoBarColor("Male")}`} initial={{ width: 0 }} animate={{ width: `${data.demographics.Male.approval_rate}%` }} transition={{ duration: 1.2, ease: "easeOut" }} />
                      </div>
                      <div className="text-[10px] font-mono text-t-muted mt-1.5">{data.demographics.Male.count.toLocaleString()} applicants</div>
                    </div>
                    {/* Female */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-t-primary">Female</span>
                        <span className="text-xs font-mono text-t-secondary">{data.demographics.Female.approval_rate}%</span>
                      </div>
                      <div className="h-3 w-full rounded-full overflow-hidden bg-bg-secondary">
                        <motion.div className={`h-full rounded-full ${getDemoBarColor("Female")}`} initial={{ width: 0 }} animate={{ width: `${data.demographics.Female.approval_rate}%` }} transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }} />
                      </div>
                      <div className="text-[10px] font-mono text-t-muted mt-1.5">{data.demographics.Female.count.toLocaleString()} applicants</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Checklist */}
              <div className="refined-card rounded-xl p-6">
                <h3 className="text-[11px] font-mono uppercase tracking-[0.1em] text-t-muted mb-5">Compliance Checks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {generateChecklist(data.disparate_impact_ratio).map((check, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="p-4 rounded-lg bg-bg-card border border-border-card flex items-start gap-3"
                    >
                      {check.passed ? (
                        <div className="p-1 rounded bg-safe-dim text-safe shrink-0"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
                      ) : (
                        <div className="p-1 rounded bg-danger-dim text-danger shrink-0"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></div>
                      )}
                      <div>
                        <p className="text-xs font-medium text-t-primary">{check.name}</p>
                        <p className={`text-[10px] font-mono mt-0.5 ${check.passed ? "text-safe" : "text-danger"}`}>{check.passed ? "PASSED" : "FAILED"}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle mt-auto">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-[10px] font-mono text-t-muted">© 2026 EquiScan — Algorithmic Fairness Engine</span>
          <span className="text-[10px] font-mono text-t-muted flex items-center gap-1.5"><StatusDot color="var(--color-safe)" />All systems nominal</span>
        </div>
      </footer>
    </div>
  );
}
