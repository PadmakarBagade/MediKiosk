import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { History, Calendar, CheckCircle2, Clock, FileText, ChevronRight } from 'lucide-react';

const ConsultationHistory = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const res = await api.get('/consultations/my');
        if (res.data.success) {
          setConsultations(res.data.consultations);
          if (res.data.consultations.length > 0) {
            setSelectedConsultation(res.data.consultations[0]);
          }
        }
      } catch (e) {
        console.error('Failed to load consultation history:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchConsultations();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-8 h-8 text-emerald-600" />
          Consultation History
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your completed MediKiosk intake sessions, generated AI summaries, and clinician notes.
        </p>
      </div>

      <DisclaimerBanner compact={true} />

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">Loading your consultation records...</div>
      ) : consultations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <p className="text-slate-500 text-sm">No previous consultations found on record.</p>
          <Link
            to="/consultation"
            className="inline-block px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-sm"
          >
            Start New Consultation
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {consultations.map((c) => (
              <button
                key={c._id}
                onClick={() => setSelectedConsultation(c)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedConsultation?._id === c._id
                    ? 'bg-emerald-50/80 border-emerald-500 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                      c.status === 'reviewed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {c.status === 'reviewed' ? 'Reviewed' : 'Pending'}
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-sm line-clamp-1">
                  {c.chiefComplaint?.problem || 'Consultation Intake'}
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                  <span>Severity: {c.chiefComplaint?.severityScore || 'N/A'}/10</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selectedConsultation ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Consultation Record</span>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                      {selectedConsultation.chiefComplaint?.problem}
                    </h3>
                    <div className="text-xs text-slate-500 mt-1">
                      Submitted on: {new Date(selectedConsultation.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      selectedConsultation.status === 'reviewed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedConsultation.status === 'reviewed' ? '✓ Clinician Reviewed' : 'Pending Review'}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Pre-Consultation Summary
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                    {selectedConsultation.aiSummary?.doctorFacingText || 'Summary generated.'}
                  </div>
                </div>

                {selectedConsultation.doctorNotes?.clinicalNotes && (
                  <div className="space-y-2 bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Doctor Clinical Notes & Observations
                    </h4>
                    <p className="text-xs text-slate-800 leading-relaxed font-sans">
                      {selectedConsultation.doctorNotes.clinicalNotes}
                    </p>
                    {selectedConsultation.doctorNotes.recommendedNextSteps && (
                      <div className="pt-2 text-xs text-emerald-900 font-medium">
                        <span className="font-bold">Next Steps: </span>
                        {selectedConsultation.doctorNotes.recommendedNextSteps}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
                Select a consultation from the left to view the pre-consultation summary and doctor notes.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationHistory;
