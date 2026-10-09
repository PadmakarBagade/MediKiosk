# MediKiosk: AI-Assisted Patient Pre-Consultation System (MERN Stack)

MediKiosk is an AI-assisted pre-consultation kiosk for busy hospital OPDs, where doctors often get only 2-5 minutes per patient. Patients record their medical history by touch or multilingual voice before meeting the doctor, upload old reports, and MediKiosk turns everything into a structured, source-tagged summary for the physician. Doctor access to a patient's full record is protected by OTP-based patient consent.

> **Clinical Safety Principle:** MediKiosk does not diagnose conditions or prescribe medications. AI-generated summaries are decision-support drafts for registered healthcare professionals, who remain solely responsible for diagnosis, examination, and treatment.

---

## Key Features

| Area | What it does |
|---|---|
| **Guided intake** | 9-step touch/voice questionnaire (complaint, history, medications, allergies, lifestyle, reports, review) |
| **Multilingual voice input** | English, Hindi, Marathi via the browser Web Speech API, with keyboard fallback |
| **Red-flag detection** | Rule-based emergency symptom detection (cardiac, stroke, bleeding, altered consciousness, airway, acute abdomen, psychiatric crisis). Flagged patients are sorted to the top of the doctor's queue and counted on the dashboard |
| **RAG-grounded follow-up questions** | Retrieves relevant WHO/ICMR-style clinical guideline snippets (vector search) and uses them to generate tailored follow-up questions. The UI shows which guideline grounded the questions |
| **Document digitization (OCR)** | PDFs parsed with `pdf-parse`; images preprocessed with `sharp` and read with `tesseract.js`. Lab values (Hb, WBC, platelets, FBS, HbA1c, creatinine, bilirubin, BP) are extracted and flagged Normal/High/Low |
| **Low-confidence handling** | Unreadable scans are marked "Failed" and the patient is asked to verify or correct values manually |
| **AI summary** | Structured pre-consultation summary with source tags: `[Patient Reported]`, `[Report OCR]`, `[AI Structured]`, `[Doctor Verified]`. Rule-based engine always runs; Gemini refines it when available |
| **Doctor-editable summary** | Doctors can edit the AI summary directly; edits are tagged `doctor_verified` |
| **OTP doctor-access gate** | A doctor must request and verify a one-time code (sent to the patient's phone) before viewing a full patient history. Access is a short-lived (10 min) scoped token |
| **ABHA login (ABDM sandbox, M1)** | Patients can create or log in to an ABHA (Ayushman Bharat Health Account) using Aadhaar OTP against the ABDM sandbox |
| **Audit logging** | Logins, record access, OTP requests/grants/denials, consultations, reviews, and uploads are logged |
| **Kiosk privacy** | 75-second idle detector with a 15-second countdown purges patient state between patients |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express 4 |
| Database | MongoDB (Atlas or local) via Mongoose 8 |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` |
| LLM & embeddings | Google Gemini (`text-embedding-004` for embeddings), with local fallbacks when no API key is set |
| Vector search | MongoDB Atlas `$vectorSearch`, falling back to in-memory cosine similarity |
| OCR | `tesseract.js` + `sharp` (images), `pdf-parse` (PDFs) |
| OTP / SMS | Twilio REST API, with simulated console-logged fallback |
| Identity | ABDM Sandbox APIs (ABHA, Milestone 1) |
| Voice | Browser Web Speech API |
| Uploads | `multer` |

---

## Quick Start (Local Setup)

### Prerequisites
- Node.js v18 or higher
- A MongoDB database: either a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (recommended) or a local MongoDB on `127.0.0.1:27017`

### 1. Install dependencies
From the root directory:
```bash
npm run install:all
```

### 2. Configure environment variables
Copy `.env.example` to `server/.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/medikiosk?retryWrites=true&w=majority
JWT_SECRET=change_this_to_a_long_random_string
CLIENT_URL=http://localhost:5173

# Optional: Gemini API key. If omitted, built-in rule-based engines are used.
GEMINI_API_KEY=

# Optional: Twilio SMS for OTP. If omitted, OTP is logged to the server console (simulated mode).
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
SMS_SENDER_ID=MEDIKIOSK

# ABDM sandbox credentials (use the variable names your abhaService expects)
ABDM_CLIENT_ID=
ABDM_CLIENT_SECRET=
```
**Never commit `server/.env`.** It is excluded by `.gitignore`.

For a local MongoDB, use `MONGO_URI=mongodb://127.0.0.1:27017/medikiosk`.

### 3. Seed data
```bash
npm run seed                          # demo doctor, patients, reports, consultations
npm run seed:guidelines --prefix server   # clinical guidelines + embeddings for RAG
```

### 4. (Recommended) Create the Atlas Vector Search index
Without this index, RAG still works through the in-memory fallback, but this enables true vector search.
- Atlas → your cluster → **Search** → **Create Search Index** → **Atlas Vector Search**
- Collection: `clinicalguidelines` · Field: `embedding` · Dimensions: `768` · Similarity: `cosine`
- Index name: `clinical_guidelines_vector_index`

When you submit a complaint, the server log shows which strategy served the request (Atlas `$vectorSearch` or in-memory fallback).

### 5. Run the app
```bash
npm run dev
```
Open `http://localhost:5173` (backend runs on port 5000).

---

## Demo Accounts (1-click login on the login page)

| Role | Name | Email | Password | Case |
|---|---|---|---|---|
| Doctor | Dr. Sarah Sharma | doctor@medikiosk.com | Doctor@123 | Internal Medicine (Reg #MCI-2018-84729) |
| Patient 1 | Rahul Verma (45M) | rahul@medikiosk.com | Patient@123 | Fever & cough, hypertension, CBC report (Pending Review) |
| Patient 2 | Sunita Patel (62F) | sunita@medikiosk.com | Patient@123 | Knee pain, Type 2 diabetes, glycemic & X-ray report (Pending Review) |
| Patient 3 | Amit Joshi (29M) | amit@medikiosk.com | Patient@123 | Headache, penicillin allergy (Reviewed) |

> **Testing the OTP gate without Twilio:** when Twilio is not configured, the OTP is printed in the backend console (and returned as `devOtp` outside production mode).

---

## Application Workflows

### 1. Standalone Kiosk Mode (`/kiosk`)
- Built for tablets and touchscreens in waiting rooms: high-contrast UI, large touch targets, minimal navigation.
- Languages: English, Hindi (हिन्दी), Marathi (मराठी).
- Voice dictation with live preview, retry, and keyboard fallback.
- 75-second idle detector with a 15-second countdown purges patient state to prevent data leakage between patients.

### 2. Guided 9-Step Intake
1. **Personal information:** identity and emergency contact
2. **Main complaint:** problem (voice enabled), duration, course, severity (1-10), relieving/aggravating factors. **Red-flag check runs here, and AI follow-up questions grounded in clinical guidelines are generated**
3. **Medical history:** structured conditions with Yes/No/Not sure
4. **Medications:** name, dose, frequency, reason, or "I don't know my medicines"
5. **Allergies:** drug, food, environmental
6. **Lifestyle:** smoking, alcohol, activity, sleep, diet, occupation
7. **Previous reports:** drag-and-drop PDF/JPG/PNG with real OCR extraction
8. **Review & correct:** edit all answers and OCR values
9. **Handover:** secure submission with waiting-room instructions

### 3. Doctor Workflow
1. Log in and open the dashboard (stats, search by name/complaint, **red-flag cases first**).
2. Open a patient and **request access**. A one-time code goes to the patient's phone.
3. Enter the code to unlock the record for 10 minutes. Failed and successful attempts are audit-logged.
4. Review the three-column workstation:
   - **Left:** demographics, vitals, blood group, emergency contacts, visit timeline
   - **Center:** AI summary with sections, verification flags, and source tags. **Doctors can edit and save the summary**
   - **Right:** priority alerts (allergies, current medications, abnormal labs)
5. Add examination findings, differential considerations, and next steps, then **Mark as Reviewed**.

### 4. ABHA Login (Patients)
Aadhaar number → Aadhaar OTP → ABHA number and address returned and linked to the patient account. Existing email/password login remains available. This uses the **ABDM sandbox** (Milestone 1: ABHA creation and verification).

---

## System Architecture

```
medikiosk/
├── package.json                  # Monorepo root (concurrent dev/build scripts)
├── README.md
├── .env.example
├── server/
│   ├── src/
│   │   ├── config/db.js          # MongoDB connection
│   │   ├── models/               # User, PatientProfile, Consultation, MedicalReport,
│   │   │                         # AuditLog, ClinicalGuideline, AccessOtp
│   │   ├── middleware/           # JWT auth, upload (Multer), audit logging, error handling
│   │   ├── services/
│   │   │   ├── ai/               # aiProvider (Gemini + fallbacks), extraction, summary,
│   │   │   │                     # followUpService, ragGuidelineService
│   │   │   ├── clinical/         # redFlagService (rule-based emergency detection)
│   │   │   ├── ocr/              # ocrService (pdf-parse, sharp, tesseract.js, lab parser)
│   │   │   ├── otp/              # otpService (Twilio + simulated fallback)
│   │   │   └── abdm/             # abhaService (ABDM sandbox: session, encryption, OTP)
│   │   ├── controllers/          # Auth, Patient, Doctor, Consultation, Report, AI
│   │   ├── routes/               # REST endpoints
│   │   └── seed/                 # seedData.js, seedGuidelines.js
│   └── uploads/                  # Uploaded patient reports (git-ignored)
└── client/
    └── src/
        ├── i18n/                 # English, Hindi, Marathi dictionaries
        ├── context/              # AuthContext, LanguageContext
        ├── components/           # VoiceInput, ReportUpload, ProgressBar, DisclaimerBanner...
        ├── pages/                # Landing, Login, Register, KioskMode, KioskConsultation,
        │                         # Dashboards, DoctorPatientView, Reports, SafetyInfo...
        └── services/             # Axios API clients
```

### AI pipeline with graceful fallbacks
Every AI feature has a fallback so the app never hard-fails:

| Feature | Primary | Fallback |
|---|---|---|
| Follow-up questions | RAG retrieval + Gemini | Symptom-keyword rule questions |
| Retrieval | Atlas `$vectorSearch` | In-memory cosine similarity |
| Embeddings | Gemini `text-embedding-004` | Deterministic hashed vector |
| Summary / extraction | Gemini refinement | Rule-based extraction and summary |
| OTP delivery | Twilio SMS | Simulated, console-logged OTP |
| OCR | Tesseract on preprocessed image | "Failed" status + manual correction |

---

## Main API Endpoints (overview)

| Endpoint | Purpose |
|---|---|
| `POST /api/auth/register`, `/login`, `GET /api/auth/me` | Email/password auth |
| `POST /api/auth/abha/request-otp`, `/abha/verify-otp` | ABHA login via ABDM sandbox |
| `POST /api/ai/follow-up` | RAG-grounded follow-up questions (auth required) |
| `POST /api/ai/extract`, `/api/ai/summarize` | Entity extraction and summary |
| `/api/consultations` | Create/update consultations (runs red-flag detection) |
| `/api/reports` | Upload, OCR, and correct reports |
| `GET /api/doctors/stats`, `/consultations` | Dashboard and queue (red-flag first) |
| `POST /api/doctors/patients/:id/request-access`, `/verify-access` | OTP access gate |
| `GET /api/doctors/patients/:id/...` | Patient record (requires `x-patient-access-token`) |
| `PUT /api/doctors/consultations/:id/summary` | Doctor edits AI summary |
| `POST /api/doctors/consultations/:id/review` | Add notes and mark reviewed |

---

## Privacy & Security

- **Authentication:** JWT bearer tokens with role-based route guards (patient, doctor).
- **Passwords:** hashed with `bcryptjs` (10 salt rounds) and excluded from all API responses.
- **Consent-based record access:** doctors need a patient-phone OTP and a short-lived, patient-scoped access token for each record.
- **Audit logging:** record access, OTP requests/grants/denials, consultations, reviews, and uploads.
- **Protected AI routes:** all `/api/ai/*` endpoints require authentication.
- **File validation:** PDF, JPG, JPEG, PNG only, 15 MB limit.
- **Kiosk privacy:** sessions reset on completion or idle timeout.
- **Secrets:** all credentials live in `server/.env`, which is git-ignored. Set them as environment variables on the hosting platform when deploying.
- **Production note:** the test-only `devOtp` field is returned only when `NODE_ENV` is not `production`.

---

## Scope & Limitations

- **ABDM integration is limited to Milestone 1** (ABHA creation/login against the sandbox). HIS integration, FHIR record exchange, and ABDM certification are out of scope and listed as future work.
- Doctor registration is self-service (no medical-council license verification) to keep the prototype simple.
- Handwritten prescription OCR is not reliable with Tesseract; unclear scans fall back to manual patient correction.
- Browser speech recognition requires Chrome/Edge and an internet connection.
- Intended as an educational and demonstration prototype, not a certified clinical system.

## Future Work
- FHIR-based record push to HIS and ABDM consent-manager flows (M2/M3)
- Doctor verification via the National Medical Register
- Whisper-based or Bhashini ASR for more Indian languages and offline use
- Handwriting-capable OCR
- AYUSH (Ayurvedic) history mode
- Docker packaging and cloud deployment

---

## License & Clinical Disclaimer
MediKiosk is an educational, demonstration, and clinical-assistance prototype. It does not replace certified clinical judgment, emergency medical triage, or qualified diagnostic consultations.
