"use client";

import { useState } from "react";
import { analyzeFile, AnalyzeResponse } from "@/services/api";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    setStatus("loading");
    setError(null);

    try {
      const result = await analyzeFile(file);
      setData(result);
      setStatus("success");
    } catch (err) {
      setError("Failed to analyze file");
      setStatus("idle");
    }
  };

  return (
    <div className="p-6 space-y-4">

      {/* IDLE */}
      {status === "idle" && (
        <>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              if (e.target.files) setFile(e.target.files[0]);
            }}
          />

          <button
            onClick={handleUpload}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Upload & Analyze
          </button>
        </>
      )}

      {/* LOADING */}
      {status === "loading" && (
        <div className="text-center">
          <p className="text-lg font-semibold">Analyzing with AI...</p>
        </div>
      )}

      {/* SUCCESS */}
      {status === "success" && data && (
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Results</h2>

          <p><b>Risk Score:</b> {data.risk_score}</p>
          <p><b>Status:</b> {data.risk_status}</p>
          <p><b>Total Records:</b> {data.total_records}</p>

          <div>
            <h3 className="font-semibold">Demographics</h3>
            <p>Male Approval: {data.demographics.Male.approval_rate}%</p>
            <p>Female Approval: {data.demographics.Female.approval_rate}%</p>
          </div>

          <p><b>DI Ratio:</b> {data.disparate_impact_ratio}</p>
          <p>{data.recommendation}</p>
        </div>
      )}

      {/* ERROR */}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}