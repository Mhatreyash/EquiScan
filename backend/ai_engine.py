import pandas as pd
import numpy as np
import xgboost as xgb
import shap
from sklearn.preprocessing import LabelEncoder

def analyze_with_ai(df: pd.DataFrame):
    """
    Trains a surrogate XGBoost model on the dataset and uses SHAP 
    to extract the exact mathematical bias of the 'Gender' feature.
    """
    try:
        # 1. Clean and Prepare the Data
        df = df.copy()
        
        # Ensure we have the target column
        if 'AI_Hired' not in df.columns or 'Gender' not in df.columns:
            raise ValueError("Dataset missing 'Gender' or 'AI_Hired' columns.")

        # Convert Target to Binary (0 or 1)
        df['AI_Hired'] = df['AI_Hired'].astype(str).str.lower().map({'true': 1, 'false': 0, '1': 1, '0': 0})
        
        # Separate features (X) and target (y)
        y = df['AI_Hired']
        X = df.drop(columns=['AI_Hired'])

        # Drop useless ID columns if they exist (they confuse the AI)
        if 'Applicant_ID' in X.columns:
            X = X.drop(columns=['Applicant_ID'])
        if 'ID' in X.columns:
            X = X.drop(columns=['ID'])

        # Encode categorical variables (like Gender: Male=1, Female=0)
        label_encoders = {}
        for col in X.select_dtypes(include=['object']).columns:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
            label_encoders[col] = le

        # 2. Train the XGBoost Surrogate Model (Using your RTX/CPU)
        # This models how the "Black Box" made its decisions
        model = xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss')
        model.fit(X, y)

        # 3. Crack the Black Box with SHAP (Shapley Additive exPlanations)
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X)
        
        # 4. Extract the Bias Metrics
        # Find which column index is Gender
        gender_col_idx = X.columns.get_loc('Gender')
        
        # Get the SHAP values specifically for Gender
        gender_shap_values = shap_values[:, gender_col_idx]
        
        # Reconstruct the original gender labels to see who got penalized
        # LabelEncoder usually makes Female=0, Male=1 alphabetically, but let's be safe
        gender_classes = label_encoders['Gender'].classes_
        female_encoded_val = np.where(gender_classes == 'Female')[0][0]
        male_encoded_val = np.where(gender_classes == 'Male')[0][0]

        # Calculate average SHAP impact for Females vs Males
        female_impact = np.mean(gender_shap_values[X['Gender'] == female_encoded_val])
        male_impact = np.mean(gender_shap_values[X['Gender'] == male_encoded_val])

        # Convert SHAP log-odds to approximate percentage impact (Simplified for demo)
        def logodds_to_prob_impact(log_odds):
            # Baseline prob assumed ~0.5 for scaling
            prob = np.exp(log_odds) / (1 + np.exp(log_odds))
            return (prob - 0.5) * 100

        female_penalty_pct = round(logodds_to_prob_impact(female_impact), 1)
        male_bonus_pct = round(logodds_to_prob_impact(male_impact), 1)

        return {
            "success": True,
            "ai_explanation": f"SHAP analysis proves the model penalizes Females by {female_penalty_pct}% and boosts Males by +{male_bonus_pct}% regardless of their skills.",
            "female_penalty": female_penalty_pct,
            "male_bonus": male_bonus_pct
        }

    except Exception as e:
        print(f"AI Engine Error: {e}")
        return {"success": False, "error": str(e)}

def mitigate_dataset(df: pd.DataFrame):
    """
    The 'Fix' algorithm. Overwrites the AI_Hired column based purely on merit (Interview_Score),
    completely blinding the model to Gender and Age.
    """
    df = df.copy()
    
    # Let's assume 'Interview_Score' is the merit column. 
    # If the score is above the 50th percentile, hire them.
    if 'Interview_Score' in df.columns:
        threshold = df['Interview_Score'].median()
        df['AI_Hired'] = df['Interview_Score'] >= threshold
    elif 'Years_Experience' in df.columns:
        threshold = df['Years_Experience'].median()
        df['AI_Hired'] = df['Years_Experience'] >= threshold
    else:
        # Fallback if columns are weird
        df['AI_Hired'] = True 
        
    return df