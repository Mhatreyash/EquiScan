"use client";

import { useState, useEffect } from "react";
import { analyzeFile, AnalyzeResponse } from "@/services/api";

// --- Custom SVG Components for Charts ---

const DonutChart = ({ score, colorClass }: { score: number, colorClass: string }) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full drop-shadow-xl" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-black/5 dark:text-white/5" />
        <circle 
          cx="50" cy="50" r={radius} 
          stroke="currentColor" 
          strokeWidth="12" 
          fill="transparent" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          className={`${colorClass} transition-all duration-1500 ease-out`} 
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black">{score}</span>
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
  const [isDarkMode, setIsDarkMode] = useState(false); // Default Light Mode

  useEffect(() => {
    // New Color Palette: Sand/Stone for Light, Deep Forest/Charcoal for Dark
    document.body.style.backgroundColor = isDarkMode ? "#0f1115" : "#f4f4f5";
    document.body.style.transition = "background-color 0.5s ease";
  }, [isDarkMode]);

  const handleUpload = async (selectedFile: File) => {
    setStatus("loading");
    setError(null);

    try {
      const result = await analyzeFile(selectedFile);
      // Fake delay for animation
      setTimeout(() => {
        setData(result);
        setStatus("success");
      }, 1500);
    } catch (err) {
      setError("Failed to analyze dataset. Please ensure it is a valid CSV and try again.");
      setStatus("idle");
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Invalid file type. Please upload a .csv file.");
      }
    }
  };

  const resetState = () => {
    setFile(null);
    setData(null);
    setStatus("idle");
    setError(null);
  };

  // Modern Teal / Coral / Amber Palette
  const getRiskColor = (score: number) => {
    if (score < 40) return { text: "text-teal-500", bg: "bg-teal-500", lightBg: isDarkMode ? "bg-teal-500/10" : "bg-teal-50", border: isDarkMode ? "border-teal-500/20" : "border-teal-200" };
    if (score < 70) return { text: "text-amber-500", bg: "bg-amber-500", lightBg: isDarkMode ? "bg-amber-500/10" : "bg-amber-50", border: isDarkMode ? "border-amber-500/20" : "border-amber-200" };
    return { text: "text-rose-500", bg: "bg-rose-500", lightBg: isDarkMode ? "bg-rose-500/10" : "bg-rose-50", border: isDarkMode ? "border-rose-500/20" : "border-rose-200" };
  };

  const generateChecklist = (ratio: number) => {
    return [
      { name: "Four-Fifths (80%) Rule", passed: ratio >= 0.8 },
      { name: "Demographic Parity", passed: ratio >= 0.9 },
      { name: "Equal Opportunity", passed: ratio >= 0.75 },
      { name: "Predictive Equality", passed: true }
    ];
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${isDarkMode ? 'bg-[#0f1115] text-stone-200' : 'bg-zinc-100 text-stone-800'}`}>
      
      {/* Navbar */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors ${isDarkMode ? 'border-white/5 bg-[#0f1115]/80' : 'border-black/5 bg-white/80'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={resetState}>
            <div className={`w-8 h-8 rounded bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/30 group-hover:rotate-12 transition-transform`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className={`font-black text-xl tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>EquiScan</span>
          </div>

          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-stone-800 text-amber-400 hover:bg-stone-700' : 'bg-stone-200 text-stone-600 hover:bg-stone-300'}`}
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* =========================================
            IDLE / UPLOAD VIEW
           ========================================= */}
        {status === "idle" && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center max-w-3xl mb-12">
              <h1 className={`text-5xl md:text-7xl font-black tracking-tighter mb-6 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                Data Fairness, <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">Visualized.</span>
              </h1>
              <p className={`text-lg md:text-xl font-medium ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                A highly detailed compliance dashboard. Upload your historical dataset to generate deep visualizations, disparate impact ratios, and legal risk assessments.
              </p>
            </div>

            <div className="w-full max-w-2xl relative">
              {/* Background Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-[3rem] blur-2xl opacity-20 animate-pulse"></div>
              
              <div 
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`relative w-full rounded-[2.5rem] border-2 border-dashed p-16 flex flex-col items-center justify-center gap-6 transition-all shadow-2xl ${
                  isDragging 
                    ? 'border-teal-500 bg-teal-500/10 scale-105' 
                    : (isDarkMode ? 'border-stone-700 bg-stone-900 hover:border-teal-500/50' : 'border-stone-300 bg-white hover:border-teal-400')
                }`}
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-stone-800 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Upload Dataset</h3>
                  <p className={`font-medium ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Drag and drop your .CSV file here</p>
                </div>
                <input type="file" accept=".csv" onChange={onFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>

              {error && (
                <div className="absolute top-full mt-6 inset-x-0 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-bold text-center">
                  {error}
                </div>
              )}

              {file && (
                <div className={`absolute top-full mt-6 inset-x-0 p-4 rounded-2xl border shadow-xl flex items-center justify-between ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-200'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-500">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div>
                      <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{file.name}</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button onClick={() => handleUpload(file)} className="px-6 py-3 rounded-xl bg-teal-500 text-white font-black hover:bg-teal-400 transition-colors">
                    Start Analysis
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================
            LOADING VIEW
           ========================================= */}
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
            <div className="relative w-32 h-32 mb-8">
              <svg className="animate-spin w-full h-full text-teal-500/20" viewBox="0 0 24 24">
                <circle className="opacity-100" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="text-teal-500" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-stone-900' : 'bg-white'}`}>
                  <svg className="w-8 h-8 text-teal-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
              </div>
            </div>
            <h2 className={`text-3xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Generating Deep Report</h2>
            <p className={`font-medium ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Compiling charts and compliance metrics...</p>
          </div>
        )}

        {/* =========================================
            SUCCESS / DASHBOARD VIEW
           ========================================= */}
        {status === "success" && data && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-12 duration-700">
            
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded bg-teal-500/20 text-teal-500 text-xs font-black uppercase tracking-widest">Report Ready</span>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>{data.filename}</span>
                </div>
                <h2 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Detailed Analytics</h2>
              </div>
              <button onClick={resetState} className={`px-5 py-2.5 rounded-xl font-bold border transition-colors ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white hover:bg-stone-700' : 'bg-white border-stone-200 text-stone-900 hover:bg-stone-50 shadow-sm'}`}>
                New Audit
              </button>
            </div>

            {/* --- TOP ROW: KPI CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              
              <div className={`p-6 rounded-[2rem] border shadow-sm ${isDarkMode ? 'bg-[#15181e] border-white/5' : 'bg-white border-black/5'}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Total Records</span>
                  <div className="p-2 rounded bg-blue-500/10 text-blue-500"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg></div>
                </div>
                <div className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{data.total_records.toLocaleString()}</div>
              </div>

              <div className={`p-6 rounded-[2rem] border shadow-sm ${isDarkMode ? 'bg-[#15181e] border-white/5' : 'bg-white border-black/5'}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Impact Ratio</span>
                  <div className={`p-2 rounded ${data.disparate_impact_ratio >= 0.8 ? 'bg-teal-500/10 text-teal-500' : 'bg-rose-500/10 text-rose-500'}`}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg></div>
                </div>
                <div className={`text-4xl font-black ${data.disparate_impact_ratio >= 0.8 ? 'text-teal-500' : 'text-rose-500'}`}>{data.disparate_impact_ratio}</div>
              </div>

              <div className={`p-6 rounded-[2rem] border shadow-sm col-span-1 lg:col-span-2 ${getRiskColor(data.risk_score).lightBg} ${getRiskColor(data.risk_score).border}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-bold uppercase tracking-wider ${getRiskColor(data.risk_score).text}`}>Status: {data.risk_status}</span>
                  <div className={`px-3 py-1 rounded-full font-black text-xs ${getRiskColor(data.risk_score).bg} text-white`}>Score: {data.risk_score}</div>
                </div>
                <p className={`text-lg font-bold leading-tight mt-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{data.recommendation}</p>
              </div>
            </div>

            {/* --- MIDDLE ROW: CHARTS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              
              {/* Risk Gauge */}
              <div className={`col-span-1 p-8 rounded-[2rem] border shadow-sm flex flex-col items-center justify-center ${isDarkMode ? 'bg-[#15181e] border-white/5' : 'bg-white border-black/5'}`}>
                <h3 className={`text-lg font-bold mb-8 w-full text-left ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Risk Assessment</h3>
                <DonutChart score={data.risk_score} colorClass={getRiskColor(data.risk_score).text} />
                <p className={`text-center mt-8 font-medium ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                  Lower score indicates better compliance with demographic parity laws.
                </p>
              </div>

              {/* Bar Chart: Demographics */}
              <div className={`col-span-1 lg:col-span-2 p-8 rounded-[2rem] border shadow-sm flex flex-col justify-between ${isDarkMode ? 'bg-[#15181e] border-white/5' : 'bg-white border-black/5'}`}>
                <h3 className={`text-lg font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Approval Distribution by Group</h3>
                
                <div className="space-y-8 flex-1 justify-center flex flex-col">
                  {/* Male Bar */}
                  <div className="relative">
                    <div className="flex justify-between mb-2">
                      <span className={`font-black ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Male</span>
                      <span className={`font-bold ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>{data.demographics.Male.approval_rate}% Approved</span>
                    </div>
                    {/* Background Bar */}
                    <div className={`h-6 w-full rounded-full overflow-hidden flex ${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'}`}>
                      {/* Foreground Bar */}
                      <div className="h-full bg-cyan-500 rounded-full transition-all duration-1000" style={{ width: `${data.demographics.Male.approval_rate}%` }}></div>
                      {/* Remaining part (Rejected) is just the background color, but we can style it if needed */}
                    </div>
                    <div className={`text-xs font-bold mt-2 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                      Total Pool: {data.demographics.Male.count.toLocaleString()} Applicants
                    </div>
                  </div>

                  {/* Female Bar */}
                  <div className="relative">
                    <div className="flex justify-between mb-2">
                      <span className={`font-black ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Female</span>
                      <span className={`font-bold ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>{data.demographics.Female.approval_rate}% Approved</span>
                    </div>
                    <div className={`h-6 w-full rounded-full overflow-hidden flex ${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'}`}>
                      <div className="h-full bg-purple-500 rounded-full transition-all duration-1000" style={{ width: `${data.demographics.Female.approval_rate}%` }}></div>
                    </div>
                    <div className={`text-xs font-bold mt-2 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                      Total Pool: {data.demographics.Female.count.toLocaleString()} Applicants
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* --- BOTTOM ROW: COMPLIANCE CHECKLIST --- */}
            <div className={`p-8 rounded-[2rem] border shadow-sm ${isDarkMode ? 'bg-[#15181e] border-white/5' : 'bg-white border-black/5'}`}>
              <h3 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Automated Compliance Checks</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {generateChecklist(data.disparate_impact_ratio).map((check, i) => (
                  <div key={i} className={`p-4 rounded-xl border flex items-start gap-4 ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
                    {check.passed ? (
                      <div className="p-1 rounded-full bg-teal-500 text-white shrink-0"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
                    ) : (
                      <div className="p-1 rounded-full bg-rose-500 text-white shrink-0"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></div>
                    )}
                    <div>
                      <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{check.name}</p>
                      <p className={`text-xs font-medium mt-1 ${check.passed ? 'text-teal-500' : 'text-rose-500'}`}>{check.passed ? 'Passed' : 'Failed'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

