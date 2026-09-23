import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import DisclaimerBanner from '../components/DisclaimerBanner';
import api from '../services/api';
import {
  Monitor,
  User,
  FileText,
  History,
  AlertTriangle,
  Heart,
  Plus,
  ArrowRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Calendar
} from 'lucide-react';

const PatientDashboard = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  const [recentConsultations, setRecentConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await api.get('/consultations/my');
        if (res.data.success) {
          setRecentConsultations(res.data.consultations.slice(0, 3));
        }
      } catch (e) {
        console.error('Error fetching consultations:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  const severeAllergies = profile?.allergies || [];
  const chronicConditions = profile?.conditions || [];
  const medications = profile?.medications || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
            <span>Patient Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Hello, {user?.name || 'Patient'}
          </h1>
          <p className="text-emerald-100 text-sm max-w-xl leading-relaxed">
            Welcome to MediKiosk. Complete your pre-consultation intake or manage your medical profile before consulting the doctor.
          </p>
        </div>

        <Link
          to="/consultation"
          className="px-6 py-4 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 font-extrabold text-base shadow-lg transition-all active:scale-95 flex items-center gap-3 flex-shrink-0"
        >
          <Monitor className="w-5 h-5 text-emerald-600" />
          <span>Start New Consultation</span>
          <ArrowRight className="w-4 h-4 text-emerald-600" />
        </Link>
      </div>

      <DisclaimerBanner compact={true} />

      {/* Primary Dashboard Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Start New Consultation */}
        <Link
          to="/consultation"
          className="bg-emerald-600 text-white rounded-3xl p-6 shadow-md hover:shadow-xl hover:bg-emerald-700 transition group flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
              Kiosk Intake
            </span>
          </div>
          <div>
            <h3 className="text-xl font-black">Start Consultation</h3>
            <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
              Answer 9 quick questions with touch or voice before your doctor exam.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:translate-x-1 transition-transform">
            <span>Begin Session</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Card 2: Medical Profile */}
        <Link
          to="/patient/profile"
          className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition group flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
              Baseline
            </span>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Medical Profile</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Manage chronic conditions, regular prescriptions, and surgeries.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
            <span>View & Edit</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Card 3: Upload Reports */}
        <Link
          to="/patient/reports"
          className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition group flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
              OCR Files
            </span>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Upload Reports</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Upload blood tests and scan documents. Automatic OCR extraction.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
            <span>Upload & Inspect</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Card 4: Consultation History */}
        <Link
          to="/patient/history"
          className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition group flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <History className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
              Past Visits
            </span>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Visit History</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              View past AI clinical summaries and doctor verification notes.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
            <span>Review Past Logs</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Split Section: Emergency Information Card & Recent Consultations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Emergency Information Card */}
        <div className="lg:col-span-1 bg-white rounded-3xl border-2 border-rose-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-rose-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Emergency Information
              </h3>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
              High Priority
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-600">Blood Group</span>
            <span className="text-lg font-black text-rose-700">
              {profile?.bloodGroup || 'Unknown'}
            </span>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              Known Allergies ({severeAllergies.length})
            </span>
            {severeAllergies.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {severeAllergies.map((a, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-bold bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-1 rounded-lg"
                  >
                    {a.allergen} ({a.reaction || 'Reaction'})
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No known allergies registered.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Current Medications ({medications.length})
            </span>
            {medications.length > 0 ? (
              <ul className="text-xs space-y-1 text-slate-700">
                {medications.map((m, idx) => (
                  <li key={idx} className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex justify-between">
                    <span className="font-semibold">{m.name}</span>
                    <span className="text-slate-500">{m.dosage || m.frequency}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No daily medications recorded.</p>
            )}
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Emergency Contact
            </span>
            {user?.emergencyContact?.name ? (
              <div className="text-xs text-slate-700 space-y-0.5">
                <div className="font-bold">{user.emergencyContact.name} ({user.emergencyContact.relation || 'Contact'})</div>
                <div className="text-slate-500">{user.emergencyContact.phone || 'No phone'}</div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No emergency contact provided.</p>
            )}
          </div>
        </div>

        {/* Recent Consultations List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Recent Consultations
              </h3>
              <Link
                to="/patient/history"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                View All →
              </Link>
            </div>

            {loading ? (
              <div className="text-sm text-slate-500 py-6 text-center">Loading visits...</div>
            ) : recentConsultations.length > 0 ? (
              <div className="space-y-3">
                {recentConsultations.map((c) => (
                  <div
                    key={c._id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition space-y-2"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-500">
                          {new Date(c.createdAt).toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                          c.status === 'reviewed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.status === 'reviewed' ? 'Reviewed by Doctor' : 'Pending Doctor Review'}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-slate-800">
                      Complaint: {c.chiefComplaint?.problem || 'Consultation Intake'}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span>Severity: {c.chiefComplaint?.severityScore || 'N/A'}/10</span>
                      {c.doctorId && (
                        <span className="text-emerald-700 font-semibold">
                          Doctor: {c.doctorId.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 space-y-3">
                <p className="text-sm text-slate-500">
                  You haven't completed any pre-consultation intakes yet.
                </p>
                <Link
                  to="/consultation"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  <Plus className="w-4 h-4" />
                  Start Your First Intake
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
