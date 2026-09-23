require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const Consultation = require('../models/Consultation');
const MedicalReport = require('../models/MedicalReport');
const AuditLog = require('../models/AuditLog');
const { extractStructuredMedicalInformation } = require('../services/ai/extractionService');
const { generateDoctorFacingSummary } = require('../services/ai/summaryService');
const { checkRedFlags } = require('../services/clinical/redFlagService');
const { seedClinicalGuidelines } = require('./seedGuidelines');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create sample text-based mockup reports if not existing
const sampleCbcPath = path.join(uploadsDir, 'sample_cbc_rahul.txt');
fs.writeFileSync(
  sampleCbcPath,
  `METROPOLIS DIAGNOSTIC HEALTHCARE
PATIENT: Rahul Verma | AGE: 45 | GENDER: Male
DATE: 08-Sep-2026 | REF BY: Self
--------------------------------------------------
COMPLETE BLOOD COUNT (CBC)
Investigation                  Result     Unit       Reference Range
Hemoglobin:                    10.2       g/dL       13.0 - 17.0
Total Leukocyte Count (WBC):   11,500     /µL        4,000 - 11,000
Platelet Count:                2.1 lakh   /µL        1.5 - 4.5 lakh
RBC Count:                     4.1        mil/µL     4.5 - 5.5
Blood Pressure:                142/92     mmHg       120/80
--------------------------------------------------
Impression: Mild normocytic anemia with slight leukocytosis. Clinical correlation suggested.`
);

const sampleXrayPath = path.join(uploadsDir, 'sample_diabetes_sunita.txt');
fs.writeFileSync(
  sampleXrayPath,
  `APEX CLINICAL LABORATORIES & IMAGING
PATIENT: Sunita Patel | AGE: 62 | GENDER: Female
DATE: 07-Sep-2026
--------------------------------------------------
GLYCEMIC & RADIOLOGY SUMMARY
Investigation                  Result     Unit       Reference Range
Fasting Blood Sugar:           168        mg/dL      70 - 100
HbA1c:                         8.2        %          4.0 - 5.7
Serum Creatinine:              1.0        mg/dL      0.6 - 1.2
X-Ray Right Knee: Joint space narrowing of medial compartment, marginal osteophytosis.
--------------------------------------------------
Impression: Uncontrolled glycemic status. Moderate osteoarthritic changes right knee.`
);

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medikiosk';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await PatientProfile.deleteMany({});
    await Consultation.deleteMany({});
    await MedicalReport.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('[Seed] Cleared existing database records.');

    // Ingest and embed WHO/ICMR clinical guidelines for RAG
    await seedClinicalGuidelines();

    // 1. Create Doctor
    const doctor = await User.create({
      name: 'Dr. Sarah Sharma',
      email: 'doctor@medikiosk.com',
      password: 'Doctor@123',
      role: 'doctor',
      phone: '+91 98201 12345',
      dateOfBirth: new Date('1985-05-14'),
      gender: 'Female',
      medicalSpecialization: 'Internal Medicine & General Physician',
      medicalLicenseNumber: 'MCI-2018-84729',
    });
    console.log('[Seed] Created Doctor: doctor@medikiosk.com');

    // 2. Create Patient 1: Rahul Verma
    const p1 = await User.create({
      name: 'Rahul Verma',
      email: 'rahul@medikiosk.com',
      password: 'Patient@123',
      role: 'patient',
      phone: '+91 98765 43210',
      dateOfBirth: new Date('1981-03-22'),
      gender: 'Male',
      emergencyContact: {
        name: 'Pooja Verma',
        relation: 'Spouse',
        phone: '+91 98765 43211',
      },
    });

    await PatientProfile.create({
      userId: p1._id,
      bloodGroup: 'B+',
      height: 172,
      weight: 78,
      allergies: [],
      conditions: [
        { name: 'Hypertension', diagnosedYear: '2021', status: 'Managed', notes: 'Takes daily morning medicine' },
      ],
      medications: [
        { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily (Morning)', purpose: 'Blood pressure control' },
      ],
      surgeries: [],
      familyHistory: [{ condition: 'Heart Disease', relation: 'Father' }],
      lifestyle: {
        smoking: 'Former smoker (quit 2 years ago)',
        alcohol: 'Occasional social',
        exercise: 'Walks 2-3 times a week',
        sleepHours: '6 hours',
        diet: 'Vegetarian',
        occupation: 'Bank Manager',
      },
    });

    const report1 = await MedicalReport.create({
      patientId: p1._id,
      fileName: 'sample_cbc_rahul.txt',
      originalName: 'CBC_Report_Rahul.pdf',
      filePath: sampleCbcPath,
      fileType: 'application/pdf',
      fileSize: 1024,
      extractedText: fs.readFileSync(sampleCbcPath, 'utf8'),
      extractedData: {
        testCategory: 'Complete Blood Count (CBC)',
        findings: [
          { testName: 'Hemoglobin', value: '10.2', unit: 'g/dL', referenceRange: '13.0 - 17.0 g/dL', status: 'Low' },
          { testName: 'WBC (Total Leukocyte Count)', value: '11500', unit: '/µL', referenceRange: '4,000 - 11,000 /µL', status: 'High' },
          { testName: 'Platelet Count', value: '210000', unit: '/µL', referenceRange: '150,000 - 450,000 /µL', status: 'Normal' },
          { testName: 'Blood Pressure', value: '142/92', unit: 'mmHg', referenceRange: '120/80 mmHg', status: 'High' },
        ],
        clinicalSummary: 'Mild anemia and elevated white blood cell count indicative of possible reactive inflammatory response.',
      },
      processingStatus: 'Extracted',
    });

    const p1ConsultationPayload = {
      chiefComplaint: {
        problem: 'Persistent fever and productive cough, feeling breathless with acute chest pain',
        onsetDuration: '4 days',
        progression: 'worse',
        severityScore: 8,
        aggravatingFactors: 'Cough worsens at night and while lying down',
        relievingFactors: 'Warm fluids provide mild temporary relief',
      },
      medicalHistory: [
        { conditionName: 'Hypertension', hasCondition: 'Yes', details: 'Diagnosed 5 years ago' },
        { conditionName: 'Diabetes', hasCondition: 'No', details: '' },
        { conditionName: 'Asthma', hasCondition: 'No', details: '' },
        { conditionName: 'Heart Disease', hasCondition: 'No', details: '' },
      ],
      medications: [
        { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily in morning', reason: 'High blood pressure', isUnknown: false },
        { name: 'Paracetamol', dosage: '650mg', frequency: 'SOS when fever spikes', reason: 'Fever', isUnknown: false },
      ],
      allergies: [],
      familyHistory: [{ condition: 'Hypertension', relation: 'Father' }],
      lifestyle: {
        smoking: 'Former smoker',
        alcohol: 'Occasional',
        exercise: 'Light walking',
        sleepHours: '6 hours',
        diet: 'Non-vegetarian',
        occupation: 'Banking Operations',
      },
    };

    const p1Structured = await extractStructuredMedicalInformation(p1ConsultationPayload, [report1]);
    const p1Summary = await generateDoctorFacingSummary(p1, p1ConsultationPayload, p1Structured, [report1]);
    const p1RedFlag = checkRedFlags(p1ConsultationPayload.chiefComplaint.problem);

    const c1 = await Consultation.create({
      patientId: p1._id,
      status: 'pending_review',
      kioskSession: true,
      redFlag: p1RedFlag.isRedFlag,
      redFlagReasons: p1RedFlag.matchedRules,
      ...p1ConsultationPayload,
      uploadedReports: [report1._id],
      aiSummary: p1Summary,
      sourceProvenance: [
        { field: 'chiefComplaint', sourceType: 'patient_entered', sourceDetail: 'Kiosk Touch & Voice Input' },
        { field: 'medicalHistory', sourceType: 'patient_entered', sourceDetail: 'Kiosk Guided Steps' },
        { field: 'reports', sourceType: 'ocr_extracted', sourceDetail: 'CBC Report OCR' },
        { field: 'aiSummary', sourceType: 'ai_extracted', sourceDetail: 'MediKiosk Clinical Synthesizer' },
      ],
    });
    report1.consultationId = c1._id;
    await report1.save();
    console.log('[Seed] Created Patient 1 (Rahul Verma) with pending consultation.');

    // 3. Create Patient 2: Sunita Patel
    const p2 = await User.create({
      name: 'Sunita Patel',
      email: 'sunita@medikiosk.com',
      password: 'Patient@123',
      role: 'patient',
      phone: '+91 98111 22233',
      dateOfBirth: new Date('1964-11-09'),
      gender: 'Female',
      emergencyContact: {
        name: 'Ramesh Patel',
        relation: 'Son',
        phone: '+91 98111 22244',
      },
    });

    await PatientProfile.create({
      userId: p2._id,
      bloodGroup: 'O+',
      height: 158,
      weight: 84,
      allergies: [
        { allergen: 'Sulfa drugs', category: 'Medicine', severity: 'Severe', reaction: 'Urticaria and facial swelling' },
      ],
      conditions: [
        { name: 'Type 2 Diabetes Mellitus', diagnosedYear: '2018', status: 'Active', notes: 'High HbA1c' },
      ],
      medications: [
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals', purpose: 'Blood sugar control' },
      ],
      surgeries: [{ procedure: 'Cholecystectomy (Gallbladder removal)', year: '2016', hospital: 'City Care Hospital' }],
      familyHistory: [{ condition: 'Type 2 Diabetes', relation: 'Mother' }],
      lifestyle: {
        smoking: 'Never',
        alcohol: 'Never',
        exercise: 'Sedentary due to knee pain',
        sleepHours: '7 hours',
        diet: 'Vegetarian',
        occupation: 'Homemaker',
      },
    });

    const report2 = await MedicalReport.create({
      patientId: p2._id,
      fileName: 'sample_diabetes_sunita.txt',
      originalName: 'Diabetic_Profile_XRay.pdf',
      filePath: sampleXrayPath,
      fileType: 'application/pdf',
      fileSize: 1024,
      extractedText: fs.readFileSync(sampleXrayPath, 'utf8'),
      extractedData: {
        testCategory: 'Biochemistry / Glycemic Profile & Radiology',
        findings: [
          { testName: 'Fasting Blood Sugar (Glucose)', value: '168', unit: 'mg/dL', referenceRange: '70 - 100 mg/dL', status: 'High' },
          { testName: 'HbA1c (Glycated Hemoglobin)', value: '8.2', unit: '%', referenceRange: '4.0 - 5.7 %', status: 'High' },
          { testName: 'Serum Creatinine', value: '1.0', unit: 'mg/dL', referenceRange: '0.6 - 1.2 mg/dL', status: 'Normal' },
        ],
        clinicalSummary: 'Significant hyperglycemia and elevated HbA1c requiring glycemic management review. X-ray indicates degenerative joint changes.',
      },
      processingStatus: 'Extracted',
    });

    const p2ConsultationPayload = {
      chiefComplaint: {
        problem: 'Severe right knee pain, swelling, and morning stiffness lasting over 45 minutes',
        onsetDuration: '3 weeks',
        progression: 'worse',
        severityScore: 8,
        aggravatingFactors: 'Walking up stairs, prolonged standing',
        relievingFactors: 'Rest, warm compress, sitting elevation',
      },
      medicalHistory: [
        { conditionName: 'Diabetes', hasCondition: 'Yes', details: 'Type 2 for 8 years' },
        { conditionName: 'Hypertension', hasCondition: 'No', details: '' },
        { conditionName: 'Major Surgeries', hasCondition: 'Yes', details: 'Gallbladder removal in 2016' },
      ],
      medications: [
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', reason: 'Diabetes', isUnknown: false },
        { name: 'Over the counter pain relief ointment', dosage: 'Not sure', frequency: 'When pain is severe', reason: 'Knee pain', isUnknown: true },
      ],
      allergies: [
        { allergen: 'Sulfa Drugs', category: 'Medicine', reaction: 'Swelling and skin rash' },
      ],
      familyHistory: [{ condition: 'Diabetes', relation: 'Mother' }, { condition: 'Osteoarthritis', relation: 'Maternal Aunt' }],
      lifestyle: {
        smoking: 'Never',
        alcohol: 'Never',
        exercise: 'Restricted due to pain',
        sleepHours: '7 hours',
        diet: 'Vegetarian',
        occupation: 'Homemaker',
      },
    };

    const p2Structured = await extractStructuredMedicalInformation(p2ConsultationPayload, [report2]);
    const p2Summary = await generateDoctorFacingSummary(p2, p2ConsultationPayload, p2Structured, [report2]);
    const p2RedFlag = checkRedFlags(p2ConsultationPayload.chiefComplaint.problem);

    const c2 = await Consultation.create({
      patientId: p2._id,
      status: 'pending_review',
      kioskSession: true,
      redFlag: p2RedFlag.isRedFlag,
      redFlagReasons: p2RedFlag.matchedRules,
      ...p2ConsultationPayload,
      uploadedReports: [report2._id],
      aiSummary: p2Summary,
      sourceProvenance: [
        { field: 'chiefComplaint', sourceType: 'patient_entered', sourceDetail: 'Kiosk Touch & Voice Input' },
        { field: 'allergies', sourceType: 'patient_entered', sourceDetail: 'High-Alert Allergy Screen' },
        { field: 'reports', sourceType: 'ocr_extracted', sourceDetail: 'Diabetic Report OCR' },
        { field: 'aiSummary', sourceType: 'ai_extracted', sourceDetail: 'MediKiosk Clinical Synthesizer' },
      ],
    });
    report2.consultationId = c2._id;
    await report2.save();
    console.log('[Seed] Created Patient 2 (Sunita Patel) with pending consultation.');

    // 4. Create Patient 3: Amit Joshi (Reviewed consultation)
    const p3 = await User.create({
      name: 'Amit Joshi',
      email: 'amit@medikiosk.com',
      password: 'Patient@123',
      role: 'patient',
      phone: '+91 97654 11223',
      dateOfBirth: new Date('1997-08-18'),
      gender: 'Male',
      emergencyContact: {
        name: 'Sunil Joshi',
        relation: 'Brother',
        phone: '+91 97654 11224',
      },
    });

    await PatientProfile.create({
      userId: p3._id,
      bloodGroup: 'A+',
      height: 180,
      weight: 74,
      allergies: [
        { allergen: 'Penicillin', category: 'Medicine', severity: 'Severe', reaction: 'Hives and itching' },
      ],
      conditions: [],
      medications: [],
      surgeries: [],
      familyHistory: [{ condition: 'Migraine', relation: 'Mother' }],
      lifestyle: {
        smoking: 'Never',
        alcohol: 'Occasional',
        exercise: 'Gym 4 days a week',
        sleepHours: '5-6 hours (irregular due to screen time)',
        diet: 'Balanced',
        occupation: 'Software Engineer',
      },
    });

    const p3ConsultationPayload = {
      chiefComplaint: {
        problem: 'Throbbing bilateral headache around forehead and temples, eye strain after continuous screen work',
        onsetDuration: '2 days',
        progression: 'same',
        severityScore: 6,
        aggravatingFactors: 'Bright screens, noise, lack of sleep',
        relievingFactors: 'Dark room, cold pack on forehead',
      },
      medicalHistory: [
        { conditionName: 'Hypertension', hasCondition: 'No', details: '' },
        { conditionName: 'Diabetes', hasCondition: 'No', details: '' },
      ],
      medications: [],
      allergies: [{ allergen: 'Penicillin', category: 'Medicine', reaction: 'Hives and skin rash' }],
      familyHistory: [{ condition: 'Tension headache / Migraine', relation: 'Mother' }],
      lifestyle: {
        smoking: 'Never',
        alcohol: 'Never',
        exercise: 'Moderate',
        sleepHours: '5 hours',
        diet: 'Regular',
        occupation: 'Software Developer',
      },
    };

    const p3Structured = await extractStructuredMedicalInformation(p3ConsultationPayload, []);
    const p3Summary = await generateDoctorFacingSummary(p3, p3ConsultationPayload, p3Structured, []);
    const p3RedFlag = checkRedFlags(p3ConsultationPayload.chiefComplaint.problem);

    const c3 = await Consultation.create({
      patientId: p3._id,
      doctorId: doctor._id,
      status: 'reviewed',
      kioskSession: true,
      redFlag: p3RedFlag.isRedFlag,
      redFlagReasons: p3RedFlag.matchedRules,
      ...p3ConsultationPayload,
      uploadedReports: [],
      aiSummary: p3Summary,
      sourceProvenance: [
        { field: 'chiefComplaint', sourceType: 'patient_entered', sourceDetail: 'Kiosk Intake' },
        { field: 'allergies', sourceType: 'patient_entered', sourceDetail: 'Patient Intake' },
        { field: 'aiSummary', sourceType: 'ai_extracted', sourceDetail: 'MediKiosk Clinical Synthesizer' },
        { field: 'doctorNotes', sourceType: 'doctor_verified', sourceDetail: 'Reviewed by Dr. Sarah Sharma' },
      ],
      doctorNotes: {
        clinicalNotes: 'Fundoscopy normal. No focal neurological deficits. Neck supple. Clinical presentation consistent with tension headache secondary to digital eye strain and sleep deprivation.',
        differentialDiagnosisConsiderations: 'Tension-type headache vs. Refractive error / Computer Vision Syndrome.',
        recommendedNextSteps: 'Hydration, ergonomic screen breaks (20-20-20 rule), sleep schedule optimization. Return if red-flag symptoms arise.',
        reviewedAt: new Date(),
        reviewedBy: doctor._id,
      },
    });
    console.log('[Seed] Created Patient 3 (Amit Joshi) with reviewed consultation.');

    console.log('\n==========================================');
    console.log('  MEDIKIOSK DATABASE SEEDED SUCCESSFULLY! ');
    console.log('==========================================');
    console.log('Doctor Account:');
    console.log('  Email:    doctor@medikiosk.com');
    console.log('  Password: Doctor@123');
    console.log('  Role:     Doctor (Internal Medicine)');
    console.log('\nDemo Patients (Password for all: Patient@123):');
    console.log('  1) rahul@medikiosk.com   (Rahul Verma, 45, Fever & Cough, Pending Review)');
    console.log('  2) sunita@medikiosk.com  (Sunita Patel, 62, Knee Pain & Diabetes, Pending Review)');
    console.log('  3) amit@medikiosk.com    (Amit Joshi, 29, Headache, Reviewed)');
    console.log('==========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedDB();
