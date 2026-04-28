
import axios from "axios";

// It will use Vercel's URL in production, or localhost when testing on your laptop
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";;

export interface DemographicData {
  count: number;
  approval_rate: number;
}

export interface AnalyzeResponse {
  status: string;
  filename: string; // <-- ADDED THIS (Fixes TS crash)
  total_records: number;
  risk_score: number;
  risk_status: string;
  demographics: {
    Male: DemographicData;
    Female: DemographicData;
  };
  disparate_impact_ratio: number;
  recommendation: string;
  ai_explanation?: string; // <-- ADDED THIS (Brings in your SHAP AI text)
  gemini_legal_summary?: string; // Gemini 1.5 legal compliance summary
}

export const analyzeFile = async (
  file: File
): Promise<AnalyzeResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(
      `${BASE_URL}/api/analyze`,
      formData
    );

    if (response.data.status === "error") {
      throw new Error(response.data.message || "Failed to analyze file");
    }

    return response.data;
  } catch (error: any) {
    console.error("API Error:", error);
    throw error;
  }
};

export const mitigateFile = async (): Promise<AnalyzeResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/api/mitigate`);
    if (response.data.status === "error") {
      throw new Error(response.data.message || "Failed to mitigate bias");
    }
    return response.data;
  } catch (error: any) {
    console.error("Mitigation Error:", error);
    throw error;
  }
};