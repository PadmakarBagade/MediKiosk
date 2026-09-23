import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DisclaimerBanner from '../components/DisclaimerBanner';
import {
  Activity,
  Monitor,
  Mic,
  FileText,
  Cpu,
  Stethoscope,
  Globe,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Users
} from 'lucide-react';

const Landing = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (email, password, redirectPath) => {
    try {
      await login(email, password);
      navigate(redirectPath);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-emerald-50/60 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-extrabold tracking-wide uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              MERN Stack Healthcare Pre-Consultation System
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Prepare your medical history <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">before you meet your doctor.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              MediKiosk captures patient history through touch and voice, extracts lab parameters from previous reports with OCR, and compiles a concise clinician summary to save valuable consultation time.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/kiosk"
                className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg shadow-lg shadow-emerald-200 hover:shadow-xl transition-all active:scale-95 flex items-center gap-3"
              >
                <Monitor className="w-6 h-6" />
                <span>Launch Patient Kiosk</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/login"
                className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-extrabold text-lg border-2 border-slate-200 shadow-sm transition-all flex items-center gap-2"
              >
                <span>Sign In / Demo Accounts</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Notice Banner */}
      <div className="max-w-6xl mx-auto px-4 w-full">
        <DisclaimerBanner />
      </div>

      {/* Workflow Diagram */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-xs font-black tracking-widest uppercase text-emerald-600">
            End-To-End Clinical Workflow
          </h2>
          <p className="text-3xl font-extrabold text-slate-900">
            How MediKiosk Transforms the Intake Experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 relative">
          {[
            {
              step: '01',
              title: 'Patient Intake',
              desc: 'Enters basic demographics & contact details.',
              icon: Users,
              color: 'bg-blue-50 text-blue-600 border-blue-200',
            },
            {
              step: '02',
              title: 'Touch & Voice',
              desc: 'Answers guided questionnaire in EN, हिन्दी, or मराठी.',
              icon: Mic,
              color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
            },
            {
              step: '03',
              title: 'Report Upload',
              desc: 'Uploads previous blood reports or diagnostic scans.',
              icon: FileText,
              color: 'bg-teal-50 text-teal-600 border-teal-200',
            },
            {
              step: '04',
              title: 'OCR & AI Engine',
              desc: 'Extracts lab findings & organizes structured JSON.',
              icon: Cpu,
              color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
            },
            {
              step: '05',
              title: 'Clinical Summary',
              desc: 'Generates doctor-facing pre-consultation summary.',
              icon: Activity,
              color: 'bg-purple-50 text-purple-600 border-purple-200',
            },
            {
              step: '06',
              title: 'Doctor Exam',
              desc: 'Doctor reviews summary & makes treatment decisions.',
              icon: Stethoscope,
              color: 'bg-amber-50 text-amber-600 border-amber-200',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition relative group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-widest text-slate-400">
                      STEP {item.step}
                    </span>
                    <div className={`p-2 rounded-xl border ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-600 transition">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Built for Real Clinical Utility
            </h3>
            <p className="text-slate-500 text-sm">
              Designed with simplicity for elderly patients, high precision for doctors, and rigorous non-diagnostic clinical boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Mic className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Multilingual Voice Input</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Patients can speak naturally in English, Hindi, or Marathi. Speech is converted to text with replay, clear, retry, and typing fallback.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">OCR Report Intelligence</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Automatically extracts key numerical values from CBC, Glucose, and Lipid reports. Patients and doctors can review and correct extracted text anytime.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Non-Diagnostic Safety</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                MediKiosk never independently diagnoses or prescribes medication. It highlights critical flags, allergies, and gaps for the clinician.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 1-Click Interactive Demo Testing Suite */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                Evaluation & Demonstration Suite
              </span>
              <h3 className="text-2xl sm:text-3xl font-black mt-1">
                Instant 1-Click Persona Sign In
              </h3>
              <p className="text-slate-300 text-sm mt-1">
                Explore both Doctor and Patient experiences with pre-seeded clinical cases.
              </p>
            </div>

            <Link
              to="/kiosk"
              className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition shadow-md flex items-center gap-2"
            >
              <Monitor className="w-4 h-4" />
              Open Standalone Kiosk Mode
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Doctor Card */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-emerald-500/40 hover:border-emerald-400 transition flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-slate-950">
                    Doctor Portal
                  </span>
                  <Stethoscope className="w-5 h-5 text-emerald-400" />
                </div>
                <h4 className="font-extrabold text-lg text-white">Dr. Sarah Sharma</h4>
                <p className="text-xs text-slate-400 mt-1">Internal Medicine & Physician</p>
                <div className="text-xs text-slate-300 mt-3 space-y-1">
                  <div>Queue: <span className="text-emerald-400 font-bold">2 Pending Reviews</span></div>
                  <div>Tools: AI Summary, Reports & Notes</div>
                </div>
              </div>
              <button
                onClick={() => handleQuickLogin('doctor@medikiosk.com', 'Doctor@123', '/doctor/dashboard')}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm"
              >
                Log In as Doctor →
              </button>
            </div>

            {/* Patient 1 */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 hover:border-slate-500 transition flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-700 text-slate-200">
                    Patient 1
                  </span>
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <h4 className="font-extrabold text-lg text-white">Rahul Verma (45M)</h4>
                <p className="text-xs text-slate-400 mt-1">Complaint: Fever & Cough</p>
                <div className="text-xs text-slate-300 mt-3 space-y-1">
                  <div>History: Hypertension</div>
                  <div>Report: CBC (Hb 10.2, WBC 11.5k)</div>
                </div>
              </div>
              <button
                onClick={() => handleQuickLogin('rahul@medikiosk.com', 'Patient@123', '/patient/dashboard')}
                className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
              >
                Log In as Rahul →
              </button>
            </div>

            {/* Patient 2 */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 hover:border-slate-500 transition flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-700 text-slate-200">
                    Patient 2
                  </span>
                  <Users className="w-5 h-5 text-teal-400" />
                </div>
                <h4 className="font-extrabold text-lg text-white">Sunita Patel (62F)</h4>
                <p className="text-xs text-slate-400 mt-1">Complaint: Knee Pain</p>
                <div className="text-xs text-slate-300 mt-3 space-y-1">
                  <div>History: Type 2 Diabetes</div>
                  <div>Report: Glucose & Knee X-Ray</div>
                </div>
              </div>
              <button
                onClick={() => handleQuickLogin('sunita@medikiosk.com', 'Patient@123', '/patient/dashboard')}
                className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
              >
                Log In as Sunita →
              </button>
            </div>

            {/* Patient 3 */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 hover:border-slate-500 transition flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-700 text-slate-200">
                    Patient 3
                  </span>
                  <Users className="w-5 h-5 text-indigo-400" />
                </div>
                <h4 className="font-extrabold text-lg text-white">Amit Joshi (29M)</h4>
                <p className="text-xs text-slate-400 mt-1">Complaint: Headache</p>
                <div className="text-xs text-slate-300 mt-3 space-y-1">
                  <div>Status: Reviewed by Doctor</div>
                  <div>Allergies: Penicillin allergy</div>
                </div>
              </div>
              <button
                onClick={() => handleQuickLogin('amit@medikiosk.com', 'Patient@123', '/patient/dashboard')}
                className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
              >
                Log In as Amit →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
