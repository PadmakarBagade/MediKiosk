# MediKiosk: AI-Assisted Patient Pre-Consultation System (MERN Stack)

MediKiosk is an AI-assisted healthcare pre-consultation kiosk web application designed to reduce the intake time doctors spend collecting basic patient history.

Patients interact with MediKiosk via touchscreen or multilingual voice input before meeting the physician. The system gathers patient complaints, medical history, medications, allergies, and lifestyle factors, accepts uploads of previous diagnostic reports (PDF/images), extracts clinical findings with OCR, organizes structured data, and compiles a concise **doctor-facing pre-consultation summary**.

> [!IMPORTANT]
> **Clinical Safety Principle**: MediKiosk does **not** diagnose medical conditions or prescribe medications. AI-synthesized summaries are explicitly presented as clinical decision-support tools for registered healthcare professionals, who remain solely responsible for diagnosis, examination, and treatment.

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) running locally on `mongodb://127.0.0.1:27017`

### 1. Install Dependencies
Run from the root directory:
```bash
npm run install:all
```
*(Or install in `server` and `client` individually via `npm install` in each directory)*

### 2. Configure Environment Variables
Copy `.env.example` to `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/medikiosk
JWT_SECRET=medikiosk_super_secure_jwt_secret_key_2026_dev
CLIENT_URL=http://localhost:5173

# Optional: Set Gemini API key for external LLM inference.
# If omitted, MediKiosk automatically runs its built-in clinical NLP extraction & summarizer engine.
GEMINI_API_KEY=
```

### 3. Seed Demo Data
Populate the database with realistic test cases (1 doctor and 3 patients with clinical histories, lab reports, and consultations):
```bash
npm run seed
```

### 4. Run Development Servers
Start both backend (Express on port `5000`) and frontend (Vite on port `5173`) concurrently:
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 👥 Demo Accounts (1-Click Login Available)

| Role | Name | Email | Password | Case Details |
| :--- | :--- | :--- | :--- | :--- |
| **Doctor** | Dr. Sarah Sharma | `doctor@medikiosk.com` | `Doctor@123` | Internal Medicine Physician (Reg #MCI-2018-84729) |
| **Patient 1** | Rahul Verma (45M) | `rahul@medikiosk.com` | `Patient@123` | Fever & cough, Hypertension, CBC lab report (Pending Review) |
| **Patient 2** | Sunita Patel (62F) | `sunita@medikiosk.com` | `Patient@123` | Knee pain, Type 2 Diabetes, Glycemic & X-ray report (Pending Review) |
| **Patient 3** | Amit Joshi (29M) | `amit@medikiosk.com` | `Patient@123` | Headache, Penicillin allergy (Reviewed with Doctor Notes) |

*Note: The login page includes quick 1-click buttons that automatically populate credentials for instant testing.*

---

## 🖥️ Key Application Workflows

### 1. Standalone Kiosk Mode (`/kiosk`)
- Designed for tablet or touchscreen kiosks in clinic waiting rooms.
- High-contrast UI, extra-large touch buttons, minimal navigation distractions.
- **Multilingual Support**: Switch seamlessly between **English**, **Hindi (हिन्दी)**, and **Marathi (मराठी)**.
- **Voice Dictation**: Web Speech API integration with active pulsing animation, live preview, retry, and keyboard fallback.
- **Inactivity Protection**: 75-second idle detector with a 15-second visual countdown modal that purges patient state to prevent data leakage between patients.

### 2. Guided 9-Step Intake Flow
1. **Personal Information**: Identity & emergency contact confirmation.
2. **Main Complaint**: Chief problem (voice enabled), duration, course (better/worse/same), severity slider (1-10), relieving/aggravating factors.
3. **Medical History**: Structured conditions (Diabetes, BP, Heart, Asthma, Kidney, Surgeries, Hospitalizations) with `Yes`/`No`/`Not sure` and conditional detail prompts.
4. **Medications**: Name, dosage, frequency, reason, with a `"I don't know my medicines"` button.
5. **Allergies**: Drug, food, and environmental allergy tracking with reaction descriptions.
6. **Lifestyle**: Smoking, alcohol, physical activity, sleep hours, diet, and occupation.
7. **Previous Reports**: Drag-and-drop file uploader (PDF, JPG, PNG) with instant OCR extraction of lab values.
8. **Review & Correct**: Patient reviews all answers and OCR numbers, with full editing capabilities.
9. **Handover**: Secure submission to clinician workstation with clear waiting room instructions.

### 3. Doctor Consultation Workstation (`/doctor/consultation/:id`)
- **Left Column**: Patient demographics, vitals, blood group, emergency contacts, and visit timeline.
- **Center Column**: AI-synthesized pre-consultation summary with clear clinical sections, verification flags, and source tags (`[Patient Reported]`, `[Report OCR]`, `[AI Structured]`, `[Doctor Verified]`).
- **Right Column**: High-priority alert panel (Allergies in red, Current prescription meds, Abnormal lab parameters).
- **Tools**:
  - View original report text and files.
  - View raw patient questionnaire answers.
  - Add physician examination findings, differential diagnosis considerations, and next steps.
  - One-click "Mark as Reviewed" status update.

---

## 🏛️ System Architecture

```
medikiosk/
├── package.json              # Monorepo root (concurrently dev & build scripts)
├── README.md                 # Setup guide & documentation
├── .env.example              # Environment variables template
├── server/
│   ├── src/
│   │   ├── config/db.js      # MongoDB Mongoose connection
│   │   ├── models/           # User, PatientProfile, Consultation, MedicalReport, AuditLog
│   │   ├── middleware/       # JWT auth, Multer file upload, Audit logging, Error handling
│   │   ├── services/
│   │   │   ├── ocr/          # PDF & Image text/lab extractor (pdf-parse & clinical parser)
│   │   │   └── ai/           # AI Provider (Gemini API + zero-downtime clinical NLP fallback)
│   │   ├── controllers/      # Auth, Patient, Doctor, Consultation, Report, AI
│   │   ├── routes/           # REST endpoints
│   │   └── seed/seedData.js  # Realistic clinical demo database seeder
│   └── uploads/              # Uploaded patient medical reports directory
└── client/
    ├── src/
    │   ├── i18n/             # English, Hindi, and Marathi dictionaries
    │   ├── context/          # AuthContext & LanguageContext
    │   ├── components/       # VoiceInput, ProgressBar, ReportUpload, DisclaimerBanner, etc.
    │   ├── pages/            # Landing, Login, Register, KioskMode, Dashboard, DoctorPatientView
    │   └── services/         # Axios API clients
```

---

## 🛡️ Privacy & Security Features
- **Authentication**: JWT bearer token authentication with role-based route guards (`patient`, `doctor`).
- **Password Security**: Passwords hashed using bcryptjs (salt rounds: 10) and excluded from all API responses.
- **Audit Logging**: Sensitive patient record accesses, consultations, and report uploads are logged in `AuditLog`.
- **File Validation**: Strict file type whitelisting (PDF, JPG, JPEG, PNG) with a 15MB size ceiling.
- **Kiosk Privacy**: Kiosk sessions automatically reset on completion or idle timeout to ensure subsequent patients cannot view prior data.

---

## 📜 License & Clinical Disclaimer
MediKiosk is designed as an educational, demonstration, and clinical assistance prototype. It does not replace certified clinical judgment, emergency medical triage, or qualified diagnostic consultations.
