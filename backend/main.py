from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io

app = FastAPI(title="EquiScan API")

# --- CRITICAL: CORS SETUP ---
# This allows the Next.js frontend to communicate with your backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, change this to your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "EquiScan Backend is running!"}

@app.post("/api/analyze")
async def analyze_dataset(file: UploadFile = File(...)):
    try:
        # 1. Read the uploaded file
        contents = await file.read()
        
        # 2. Load it into a Pandas DataFrame
        # We use io.BytesIO to read the file from memory without saving it to disk
        df = pd.read_csv(io.BytesIO(contents))
        
        # 3. Calculate Total Records
        total_records = len(df)
        
        # 4. Calculate Demographics & Approval Rates
        # (Assuming columns: 'Gender' and 'AI_Hired')
        
        # --- MALE STATS ---
        males_df = df[df['Gender'] == 'Male']
        male_count = len(males_df)
        # Handle string "True"/"False" or boolean True/False
        males_hired = len(males_df[males_df['AI_Hired'].astype(str).str.lower() == 'true'])
        male_approval_rate = (males_hired / male_count * 100) if male_count > 0 else 0
        
        # --- FEMALE STATS ---
        females_df = df[df['Gender'] == 'Female']
        female_count = len(females_df)
        females_hired = len(females_df[females_df['AI_Hired'].astype(str).str.lower() == 'true'])
        female_approval_rate = (females_hired / female_count * 100) if female_count > 0 else 0
        
        # 5. Calculate Disparate Impact Ratio (Female Rate / Male Rate)
        if male_approval_rate == 0:
            di_ratio = 1.0 # Prevent division by zero
        else:
            di_ratio = round((female_approval_rate / male_approval_rate), 2)
            
        # 6. Determine Risk Score (0-100) based on DI Ratio
        # If DI ratio is < 0.8 (Four-Fifths rule), it's biased!
        if di_ratio < 0.8:
            risk_score = 85 + (0.8 - di_ratio) * 10 # Just a formula to make it look scary
            risk_status = "HIGH LEGAL RISK"
            rec = "Model exhibits severe gender bias against Females. Mitigation required."
        else:
            risk_score = 15
            risk_status = "SAFE / COMPLIANT"
            rec = "Model is compliant with the 80% rule for demographic parity."

        # 7. Return the REAL dynamic JSON!
        return {
            "status": "success",
            "filename": file.filename,
            "total_records": total_records,
            "risk_score": round(risk_score, 1), 
            "risk_status": risk_status,
            "demographics": {
                "Male": {"count": male_count, "approval_rate": round(male_approval_rate, 1)},
                "Female": {"count": female_count, "approval_rate": round(female_approval_rate, 1)}
            },
            "disparate_impact_ratio": di_ratio,
            "recommendation": rec
        }
        
    except Exception as e:
        # If the CSV doesn't have the right columns, it will throw an error here
        return {"status": "error", "message": f"Failed to process CSV: {str(e)}"}
    
@app.post("/api/mitigate")
async def mitigate_bias(file: UploadFile = File(...)):
    """
    Returns the 'Fixed' dummy data for the second part of the demo.
    """
    return {
        "status": "success",
        "total_records": 500,
        "risk_score": 5, 
        "risk_status": "SAFE",
        "demographics": {
            "Male": {"count": 300, "approval_rate": 42.0},
            "Female": {"count": 200, "approval_rate": 40.0}
        },
        "disparate_impact_ratio": 0.95,
        "recommendation": "Bias neutralized. Approval is now based purely on Interview Score."
    }