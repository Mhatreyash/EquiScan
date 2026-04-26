
import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface DemographicData {
  count: number;
  approval_rate: number;
}

export interface AnalyzeResponse {
  status: string;
  total_records: number;
  risk_score: number;
  risk_status: string;
  demographics: {
    Male: DemographicData;
    Female: DemographicData;
  };
  disparate_impact_ratio: number;
  recommendation: string;
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

    return response.data;
  } catch (error: any) {
    console.error("API Error:", error);
    throw new Error("Failed to analyze file");
  }
};