<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/XGBoost-SHAP-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Gemini_2.0-Flash-8E75B2?style=for-the-badge&logo=google" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

# EquiScan — AI Bias Auditing Platform

**EquiScan** is an enterprise-grade legal-tech dashboard that detects, quantifies, and mitigates algorithmic bias in HR hiring systems. Upload a CSV dataset and get instant compliance analysis powered by **XGBoost + SHAP** explainability and **Google Gemini 2.0** legal summaries.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **SHAP Bias Detection** | Trains an XGBoost surrogate model on your hiring data and uses SHAP (SHapley Additive exPlanations) to mathematically prove which demographic features cause bias |
| **Disparate Impact Analysis** | Automatically calculates the EEOC Four-Fifths (80%) Rule ratio and flags legal risk |
| **Google Gemini Integration** | Sends bias metrics to Gemini 2.0 Flash for an AI-generated executive legal warning |
| **One-Click Mitigation** | Applies a fairness algorithm that re-evaluates candidates purely on merit, blinding the model to gender and age |
| **PDF Export** | Export the full compliance dashboard as a professional PDF audit report |
| **Dark / Light Mode** | Premium dual-theme UI with adaptive color palette (Sage, Gold, Terracotta) |
| **Animated Terminal** | Enterprise "scanning" terminal with typewriter effect during analysis |

---

## 🏗️ Architecture

```
EquiScan/
├── backend/                    # Python FastAPI server
│   ├── main.py                 # API endpoints (/api/analyze, /api/mitigate)
│   ├── ai_engine.py            # XGBoost + SHAP bias detection engine
│   ├── scripts/
│   │   └── generate_data.py    # Generates 4 test CSV datasets with different bias scenarios
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # GEMINI_API_KEY (you create this)
│
├── frontend/                   # Next.js 16 (App Router) dashboard
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx      # Root layout (Inter + JetBrains Mono fonts)
│   │   │   ├── page.tsx        # Main dashboard UI (all components in one file)
│   │   │   └── globals.css     # Dual-theme design system (CSS variables)
│   │   └── services/
│   │       └── api.ts          # Axios API client + TypeScript interfaces
│   └── package.json            # Node dependencies
│
└── data/                       # (Empty) Place your CSV datasets here
```

---

## 📋 Prerequisites

Before you begin, make sure you have:

- **Python 3.10+** → [python.org/downloads](https://www.python.org/downloads/)
- **Node.js 18+** → [nodejs.org](https://nodejs.org/) (LTS recommended)
- **npm** (comes with Node.js)
- **Git** → [git-scm.com](https://git-scm.com/)
- **Google Gemini API Key** (free) → [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

---

## 🚀 Setup & Run Locally

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Mhatreyash/EquiScan.git
cd EquiScan
```

---

### Step 2 — Backend Setup (FastAPI + Python)

Open a terminal and navigate to the backend:

```bash
cd backend
```

#### 2a. Create a Python virtual environment

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
```

#### 2b. Install Python dependencies

```bash
pip install -r requirements.txt
```

> This installs FastAPI, Uvicorn, Pandas, XGBoost, SHAP, scikit-learn, google-generativeai, and python-dotenv.

#### 2c. Create your `.env` file

Create a file named `.env` inside the `backend/` folder:

```env
GEMINI_API_KEY="your-gemini-api-key-here"
```

> 🔑 Get a free Gemini API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

#### 2d. Generate test datasets (optional but recommended)

```bash
cd scripts
python generate_data.py
cd ..
```

This creates **4 test CSV files** in the `scripts/` folder:

| File | Scenario |
|---|---|
| `test_1_anti_female_bias.csv` | Severe bias against females (DI Ratio ≈ 0.23) |
| `test_2_anti_male_bias.csv` | Severe bias against males |
| `test_3_perfectly_fair.csv` | Merit-only, no bias (DI Ratio ≈ 1.0) |
| `test_4_borderline.csv` | Subtle bias that may pass the 80% rule |

#### 2e. Start the backend server

```bash
uvicorn main:app --reload
```

✅ Backend is now running at **http://localhost:8000**

> The `--reload` flag enables hot-reloading during development.

---

### Step 3 — Frontend Setup (Next.js)

Open a **new terminal** and navigate to the frontend:

```bash
cd frontend
```

#### 3a. Install Node dependencies

```bash
npm install
```

#### 3b. Start the development server

```bash
npm run dev
```

✅ Frontend is now running at **http://localhost:3000**

---

### Step 4 — Use the App

1. Open **http://localhost:3000** in your browser
2. Drag and drop a CSV file (or use one of the test CSVs from Step 2d)
3. Watch the animated scanning terminal
4. Explore the dashboard:
   - **KPI Cards** — Total records, Disparate Impact Ratio, Risk Score
   - **Gemini Legal Analysis** — AI-generated compliance warning (requires valid API key)
   - **XAI Console** — SHAP-powered bias explanation with neural mitigation button
   - **Risk Donut Chart** — Visual risk assessment
   - **Approval Distribution** — Male vs Female approval rate comparison
   - **Compliance Checklist** — Four-Fifths Rule, Demographic Parity, etc.
5. Click **"Export Official Audit (PDF)"** to download a compliance report
6. Toggle **☀️ / 🌙** in the navbar to switch themes

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | Upload a CSV file for bias analysis. Returns demographics, DI ratio, SHAP explanation, risk score, and Gemini summary |
| `POST` | `/api/mitigate` | Re-runs analysis on the last uploaded dataset after applying a fairness algorithm |

### Example CSV Format

Your CSV must contain at minimum these columns:

| Column | Type | Description |
|---|---|---|
| `Gender` | string | `"Male"` or `"Female"` |
| `AI_Hired` | boolean | `True` / `False` (the hiring decision) |
| `Interview_Score` | integer | Candidate's interview score (used for mitigation) |

Optional but supported: `Applicant_ID`, `Years_Experience`

---

## 🧰 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | High-performance async Python API |
| **XGBoost** | Surrogate model to replicate the "black box" hiring AI |
| **SHAP** | Explains which features (especially Gender) drive predictions |
| **Google Gemini 2.0** | Generates executive legal compliance summaries |
| **Pandas** | Data manipulation and statistical analysis |

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 16** | React framework with App Router |
| **Tailwind CSS v4** | Utility-first styling with CSS variable theming |
| **Framer Motion** | Smooth page transitions, animations, and micro-interactions |
| **react-countup** | Animated number counters for KPI cards |
| **react-to-pdf** | Client-side PDF export of the dashboard |
| **lucide-react** | Premium SVG icon library |
| **Axios** | HTTP client for API communication |

---

## 🎨 Design System

EquiScan uses a custom dual-theme design system via CSS variables:

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--color-safe` | `#5a9a7a` (Sage) | `#6db990` | Passed checks, compliant |
| `--color-warn` | `#b8883b` (Gold) | `#cda04e` | Moderate risk |
| `--color-danger` | `#c0605a` (Terracotta) | `#d4746e` | High risk, failed |
| `--bg-primary` | `#faf8f5` (Linen) | `#141418` (Charcoal) | Page background |

---

## 🐛 Troubleshooting

| Problem | Solution |
|---|---|
| `ModuleNotFoundError: No module named 'xgboost'` | Run `pip install -r requirements.txt` inside the activated venv |
| `CORS error` in browser console | Make sure the backend is running on `localhost:8000` |
| Gemini card doesn't appear | Check your `GEMINI_API_KEY` in `backend/.env`. The app still works without it (shows fallback text) |
| `Cannot read properties of undefined (reading 'Male')` | Your CSV is missing the `Gender` column or the backend returned an error. Check the terminal running `uvicorn` for details |
| PDF export does nothing | Clear browser cache and retry. The PDF library requires the dashboard to be fully rendered |

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

**© 2026 Yash Mhatre**
