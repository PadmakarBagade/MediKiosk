import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getConsultationById } from '../services/consultationService';
import { reviewConsultation, getPatientFullHistory } from '../services/doctorService';
import DisclaimerBanner from '../components/DisclaimerBanner';
import SourceBadge from '../components/SourceBadge';
import {
  User,
  Activity,
  Heart,
  Pill,
  ShieldAlert,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  Save,
  Clock,
  AlertTriangle,
  Eye,
  Edit3,
  Stethoscope,
  X
} from 'lucide-react';

const DoctorPatientView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [consultation, setConsultation] = useState(null);
  const [patientHistory, setPatientHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  // Doctor review form
  const [doctorNotes, setDoctorNotes] = useState('');
  const [differential, setDifferential] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Modals
  const [activeModal, setActiveModal] = useState(null); // 'report' | 'answers' | 'ocr'
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getConsultationById(id);
        if (res.success) {
          setConsultation(res.consultation);
          if (res.consultation.doctorNotes) {
            setDoctorNotes(res.consultation.doctorNotes.clinicalNotes || '');
            setDifferential(res.consultation.doctorNotes.differentialDiagnosisConsiderations || '');
            setNextSteps(res.consultation.doctorNotes.recommendedNextSteps || '');
          }

          // Fetch full patient medical history
          if (res.consultation.patientId?._id) {
            const histRes = await getPatientFullHistory(res.consultation.patientId._id);
            if (histRes.success) setPatientHistory(histRes);
          }
        }
      } catch (e) {
        console.error('Error loading consultation details:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSaveReview = async () => {
    setSubmittingReview(true);
    try {
      const res = await reviewConsultation(id, {
        clinicalNotes: doctorNotes,
        differentialDiagnosisConsiderations: differential,
        recommendedNextSteps: nextSteps,
      });
      if (res.success) {
        setConsultation(res.consultation);
        setReviewSuccess(true);
        setTimeout(() => setReviewSuccess(false), 4000);
      }
    } catch (e) {
      console.error('Failed to save review:', e);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading patient clinical consultation...
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-rose-600 font-bold">Consultation record not found.</p>
        <button
          onClick={() => navigate('/doctor/dashboard')}
          className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const patient = consultation.patientId || {};
  const patientProfile = patientHistory?.profile || {};
  const age = patient.dateOfBirth
    ? Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
    : 'N/A';

  // Gather lab abnormal findings
  const allFindings = (consultation.uploadedReports || []).flatMap(
    (r) => r.extractedData?.findings || []
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/doctor/dashboard"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {patient.name || 'Patient'}
              </h1>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                  consultation.status === 'reviewed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {consultation.status === 'reviewed' ? '✓ Reviewed' : 'Pending Review'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Intake recorded: {new Date(consultation.createdAt).toLocaleString()} • MediKiosk Station
            </p>
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveModal('answers')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            <span>Raw Patient Answers</span>
          </button>

          {consultation.uploadedReports && consultation.uploadedReports.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelectedReport(consultation.uploadedReports[0]);
                setActiveModal('report');
              }}
              className="px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs border border-purple-200 transition flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>View Original Report ({consultation.uploadedReports.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveReview}
            disabled={submittingReview}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{consultation.status === 'reviewed' ? 'Update Clinical Review' : 'Mark as Reviewed'}</span>
          </button>
        </div>
      </div>

      {reviewSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Consultation marked as reviewed and physician clinical notes recorded!</span>
        </div>
      )}

      {/* Red-Flag Emergency Clinical Banner */}
      {consultation.redFlag && (
        <div className="bg-rose-50 border-2 border-rose-500 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-rose-950 shadow-md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5 sm:mt-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm uppercase tracking-wider text-rose-900">
                  Clinical Red-Flag Alert
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-600 text-white">
                  High Risk
                </span>
              </div>
              <p className="text-xs text-rose-800 font-medium">
                Chief complaint matched clinical screening criteria requiring immediate physician attention:
              </p>
              {consultation.redFlagReasons && consultation.redFlagReasons.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {consultation.redFlagReasons.map((reason, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg bg-rose-200 text-rose-900 border border-rose-300"
                    >
                      <AlertTriangle className="w-3 h-3 text-rose-700" />
                      {reason}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <span className="text-xs font-bold text-rose-700 bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 self-stretch sm:self-auto text-center">
            Physician Priority #1
          </span>
        </div>
      )}

      {/* Safety Banner */}
      <DisclaimerBanner compact={true} />

      {/* 3-COLUMN PROFESSIONAL MEDICAL WORKSTATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: Patient Profile (3 cols) ================= */}
        <div className="lg:col-span-3 space-y-5">
          {/* Demographics Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-emerald-600" />
              Patient Profile
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Age / Gender</span>
                <span className="font-bold text-slate-800">{age} yrs • {patient.gender}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Phone</span>
                <span className="font-bold text-slate-800">{patient.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Blood Group</span>
                <span className="font-black text-rose-700">{patientProfile.bloodGroup || 'Unknown'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Height / Weight</span>
                <span className="font-bold text-slate-800">
                  {patientProfile.height ? `${patientProfile.height} cm` : 'N/A'} • {patientProfile.weight ? `${patientProfile.weight} kg` : 'N/A'}
                </span>
              </div>
            </div>

            {/* Emergency Contact */}
            {patient.emergencyContact?.name && (
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Emergency Contact
                </span>
                <div className="text-xs font-semibold text-slate-800">
                  {patient.emergencyContact.name} ({patient.emergencyContact.relation})
                </div>
                <div className="text-xs text-slate-500">{patient.emergencyContact.phone}</div>
              </div>
            )}
          </div>

          {/* Past Consultations Timeline */}
          {patientHistory?.previousConsultations && patientHistory.previousConsultations.length > 1 && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Previous Visits ({patientHistory.previousConsultations.length})
              </div>

              <div className="space-y-2 text-xs">
                {patientHistory.previousConsultations
                  .filter((p) => p._id !== consultation._id)
                  .slice(0, 3)
                  .map((prev) => (
                    <Link
                      key={prev._id}
                      to={`/doctor/consultation/${prev._id}`}
                      className="block p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 transition"
                    >
                      <div className="font-bold text-slate-900 line-clamp-1">
                        {prev.chiefComplaint?.problem}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(prev.createdAt).toLocaleDateString()} • {prev.status}
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* ================= CENTER COLUMN: AI Pre-Consultation Summary (6 cols) ================= */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main Clinical Summary Box */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">
                    Pre-Consultation Summary
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Compiled for clinician review • Non-diagnostic synthesis
                  </span>
                </div>
              </div>

              <span className="text-xs font-mono text-slate-400">
                Generated: {new Date(consultation.aiSummary?.generatedAt || Date.now()).toLocaleTimeString()}
              </span>
            </div>

            {/* Structured Summary Text with Clinical Monospace Format */}
            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 font-mono text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[550px] overflow-y-auto">
              {consultation.aiSummary?.doctorFacingText || 'AI Summary generation completed.'}
            </div>

            {/* Doctor Clinical Notes Panel */}
            <div className="bg-emerald-50/50 rounded-2xl p-6 border-2 border-emerald-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-700" />
                  Doctor Clinical Examination & Notes
                </h4>
                <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded">
                  Clinician Record
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Physical Examination Findings & Notes
                  </label>
                  <textarea
                    rows={3}
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="Enter clinical examination observations, chest auscultation, vitals check..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none mt-1 font-sans bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Differential Diagnosis Considerations
                  </label>
                  <input
                    type="text"
                    value={differential}
                    onChange={(e) => setDifferential(e.target.value)}
                    placeholder="e.g. Viral URI vs Bronchitis, Osteoarthritis"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none mt-1 font-sans bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Recommended Next Steps / Prescription
                  </label>
                  <input
                    type="text"
                    value={nextSteps}
                    onChange={(e) => setNextSteps(e.target.value)}
                    placeholder="e.g. Prescribe symptomatic relief, order chest X-ray"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none mt-1 font-sans bg-white"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleSaveReview}
                    disabled={submittingReview}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition active:scale-95 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{submittingReview ? 'Saving...' : 'Save Notes & Complete Review'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: High Priority Clinical Indicators (3 cols) ================= */}
        <div className="lg:col-span-3 space-y-5">
          {/* Allergies Alert (Red) */}
          <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-rose-200/60 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Allergies Flag
              </span>
              <SourceBadge type="patient_entered" />
            </div>

            {consultation.allergies && consultation.allergies.length > 0 ? (
              <div className="space-y-2">
                {consultation.allergies.map((alg, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-rose-200 text-xs space-y-0.5">
                    <div className="font-extrabold text-rose-700">
                      {alg.allergen} ({alg.category})
                    </div>
                    <div className="text-slate-600">
                      Reaction: {alg.reaction || 'Unspecified'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No drug or food allergies reported.</p>
            )}
          </div>

          {/* Current Prescription Medications */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-indigo-600" />
                Current Medications
              </span>
              <SourceBadge type="patient_entered" />
            </div>

            {consultation.medications && consultation.medications.length > 0 ? (
              <div className="space-y-2">
                {consultation.medications.map((med, idx) => (
                  <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                    <div className="font-bold text-slate-900">{med.name}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Dose: {med.dosage || 'N/A'} • Freq: {med.frequency || 'N/A'}
                    </div>
                    {med.reason && (
                      <div className="text-slate-400 text-[10px]">Reason: {med.reason}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No regular medications recorded.</p>
            )}
          </div>

          {/* Diagnostic Lab Abnormalities (OCR Extracted) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-purple-600" />
                OCR Lab Parameters
              </span>
              <SourceBadge type="ocr_extracted" />
            </div>

            {allFindings.length > 0 ? (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {allFindings.map((f, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                      f.status !== 'Normal'
                        ? 'border-amber-300 bg-amber-50/40'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-800 truncate max-w-[130px]">
                        {f.testName}
                      </div>
                      <div className="text-[10px] text-slate-400">Ref: {f.referenceRange}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-900">
                        {f.value} <span className="text-[10px] font-normal">{f.unit}</span>
                      </div>
                      {f.status !== 'Normal' && (
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                            f.status === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {f.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No lab reports attached to session.</p>
            )}
          </div>
        </div>
      </div>

      {/* ================= MODAL: Original Report Viewer ================= */}
      {activeModal === 'report' && selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-lg">
                  Original Report: {selectedReport.originalName}
                </h3>
                <span className="text-xs text-slate-500">
                  Uploaded {new Date(selectedReport.uploadedAt).toLocaleString()} • Category: {selectedReport.extractedData?.testCategory}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap">
                {selectedReport.extractedText || 'No machine-readable text found.'}
              </div>

              {selectedReport.extractedData?.findings && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase">
                    Structured Findings
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {selectedReport.extractedData.findings.map((f, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="font-bold text-slate-800">{f.testName}</div>
                        <div className="text-sm font-black text-emerald-700">
                          {f.value} {f.unit}
                        </div>
                        <div className="text-[10px] text-slate-400">Ref: {f.referenceRange}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close Report Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: Raw Patient Questionnaire Answers ================= */}
      {activeModal === 'answers' && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-lg">
                  Raw Patient Questionnaire Answers
                </h3>
                <span className="text-xs text-slate-500">
                  Exact answers submitted by patient via Kiosk touch & voice
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 uppercase">Chief Complaint</span>
                <p className="text-slate-700">{consultation.chiefComplaint?.problem}</p>
                <div className="text-slate-500">
                  Duration: {consultation.chiefComplaint?.onsetDuration} • Severity: {consultation.chiefComplaint?.severityScore}/10 • Progression: {consultation.chiefComplaint?.progression}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 uppercase">Medical History Conditions</span>
                <div className="space-y-1">
                  {consultation.medicalHistory?.map((m, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-slate-700">{m.conditionName}</span>
                      <span className={`font-bold ${m.hasCondition === 'Yes' ? 'text-amber-700' : 'text-slate-500'}`}>
                        {m.hasCondition} {m.details ? `(${m.details})` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 uppercase">Lifestyle Responses</span>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>Smoking: <span className="font-bold">{consultation.lifestyle?.smoking}</span></div>
                  <div>Alcohol: <span className="font-bold">{consultation.lifestyle?.alcohol}</span></div>
                  <div>Exercise: <span className="font-bold">{consultation.lifestyle?.exercise}</span></div>
                  <div>Sleep: <span className="font-bold">{consultation.lifestyle?.sleepHours}</span></div>
                  <div className="col-span-2">Occupation: <span className="font-bold">{consultation.lifestyle?.occupation || 'Unspecified'}</span></div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close Raw Answers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatientView;
