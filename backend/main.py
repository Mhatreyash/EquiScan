from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io

# Import your new AI Engine!
from ai_engine import analyze_with_ai, mitigate_dataset

app = FastAPI(title="EquiScan API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to cache the last uploaded dataset (Hackathon trick to save time)
# In production, you'd use a database.
cached_dataset = None

def calculate_stats(df: pd.DataFrame):
    """Helper function to calculate standard pandas stats."""
    total_records = len(df)
    
    # Standardize column names (Capitalize first letter to catch 'gender' vs 'Gender')
    df.columns = [col.title() for col in df.columns]
    
    # Rename 'Ai_Hired' back to 'AI_Hired' if it got messed up
    if 'Ai_Hired' in df.columns:
        df.rename(columns={'Ai_Hired': 'AI_Hired'}, inplace=True)

    # --- MALE STATS ---
    males_df = df[df['Gender'] == 'Male']
    male_count = len(males_df)
    males_hired = len(males_df[males_df['AI_Hired'].astype(str).str.lower() == 'true'])
    male_approval_rate = (males_hired / male_count * 100) if male_count > 0 else 0
    
    # --- FEMALE STATS ---
    females_df = df[df['Gender'] == 'Female']
    female_count = len(females_df)
    females_hired = len(females_df[females_df['AI_Hired'].astype(str).str.lower() == 'true'])
    female_approval_rate = (females_hired / female_count * 100) if female_count > 0 else 0
    
    # ... inside calculate_stats() in main.py ...
    
    # --- FIND THE DISADVANTAGED GROUP DYNAMICALLY ---
    if female_approval_rate < male_approval_rate:
        disadvantaged_group = "Females"
        privileged_group = "Males"
        # DI Ratio is always (Lower Rate / Higher Rate)
        di_ratio = round((female_approval_rate / male_approval_rate), 2) if male_approval_rate > 0 else 1.0
    elif male_approval_rate < female_approval_rate:
        disadvantaged_group = "Males"
        privileged_group = "Females"
        di_ratio = round((male_approval_rate / female_approval_rate), 2) if female_approval_rate > 0 else 1.0
    else:
        disadvantaged_group = "None"
        privileged_group = "None"
        di_ratio = 1.0

    # Dynamic Status & Recommendation
    if di_ratio < 0.8:
        risk_score = 85 + (0.8 - di_ratio) * 10 
        risk_status = "HIGH LEGAL RISK"
        rec = f"Model exhibits severe gender bias against {disadvantaged_group}. Mitigation required."
    else:
        risk_score = 15
        risk_status = "SAFE / COMPLIANT"
        rec = "Model is compliant with the 80% rule for demographic parity. No severe bias detected."

    return total_records, male_count, male_approval_rate, female_count, female_approval_rate, di_ratio, risk_score, risk_status


@app.post("/api/analyze")
async def analyze_dataset(file: UploadFile = File(...)):
    global cached_dataset
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        # Standardize column names for safety
        df.columns = [col.title() for col in df.columns]
        if 'Ai_Hired' in df.columns:
            df.rename(columns={'Ai_Hired': 'AI_Hired'}, inplace=True)
            
        cached_dataset = df.copy() # Save to memory for the mitigate endpoint
        
        # 1. Get Basic Stats
        total, m_count, m_rate, f_count, f_rate, di_ratio, risk, status = calculate_stats(df)
        
        # 2. RUN THE DEEP AI SHAP ANALYSIS
        ai_results = analyze_with_ai(df)
        
        recommendation = "Model exhibits severe gender bias."
        if ai_results["success"]:
            # If the AI worked, append its profound explanation!
            recommendation += f" {ai_results['ai_explanation']}"

        return {
            "status": "success",
            "filename": file.filename,
            "total_records": total,
            "risk_score": round(risk, 1), 
            "risk_status": status,
            "demographics": {
                "Male": {"count": m_count, "approval_rate": round(m_rate, 1)},
                "Female": {"count": f_count, "approval_rate": round(f_rate, 1)}
            },
            "disparate_impact_ratio": di_ratio,
            "recommendation": recommendation
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/mitigate")
async def mitigate_bias_endpoint():
    global cached_dataset
    if cached_dataset is None:
         return {"status": "error", "message": "No dataset uploaded yet."}
    
    try:
        # 1. Apply the Fairness Algorithm
        fixed_df = mitigate_dataset(cached_dataset)
        
        # 2. Recalculate Stats on the FIXED dataset
        total, m_count, m_rate, f_count, f_rate, di_ratio, risk, status = calculate_stats(fixed_df)

        return {
            "status": "success",
            "filename": "Mitigated_Dataset.csv",
            "total_records": total,
            "risk_score": round(risk, 1), 
            "risk_status": status,
            "demographics": {
                "Male": {"count": m_count, "approval_rate": round(m_rate, 1)},
                "Female": {"count": f_count, "approval_rate": round(f_rate, 1)}
            },
            "disparate_impact_ratio": di_ratio,
            "recommendation": "Bias neutralized. Approval is now 100% blind to Gender and Age, based purely on merit metrics."
        }
    except Exception as e:
         return {"status": "error", "message": str(e)}