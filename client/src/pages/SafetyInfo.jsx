import React from 'react';
import DisclaimerBanner from '../components/DisclaimerBanner';
import {
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  HeartCrack,
  AlertTriangle,
  Lock,
  PhoneCall
} from 'lucide-react';

const SafetyInfo = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Clinical Safety & AI Governance
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          MediKiosk is engineered as a clinical pre-consultation preparation assistant. It is strictly non-diagnostic and non-prescriptive.
        </p>
      </div>

      <DisclaimerBanner />

      {/* Emergency Red Flag Notice */}
      <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-200 text-rose-800 rounded-xl">
            <HeartCrack className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-rose-900">
            Emergency Medical Red Flags
          </h2>
        </div>
        <p className="text-sm text-rose-800 leading-relaxed">
          MediKiosk is intended for non-emergent outpatient clinical intake. If you or someone you are assisting is experiencing any of the following, <span className="font-extrabold underline">DO NOT USE THIS KIOSK</span> and immediately proceed to the emergency department or call emergency medical services (108 / 112 / 911):
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-rose-900 font-bold">
          <li className="flex items-center gap-2">• Severe crushing chest pain or pressure</li>
          <li className="flex items-center gap-2">• Sudden numbness, weakness, or facial droop</li>
          <li className="flex items-center gap-2">• Severe acute difficulty breathing or choking</li>
          <li className="flex items-center gap-2">• Uncontrolled bleeding or major physical trauma</li>
        </ul>
      </div>

      {/* Boundaries Comparison Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-xl font-black text-slate-900">
          Clear Boundaries: What MediKiosk Does vs Does NOT Do
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* What MediKiosk DOES */}
          <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200 space-y-3">
            <h4 className="font-extrabold text-emerald-800 text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              What MediKiosk Does
            </h4>
            <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Collects patient-reported chief complaints via touch and multi-language voice dictation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Extracts numerical laboratory parameters from uploaded medical reports using OCR.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Synthesizes intake questionnaires and old reports into a structured clinical summary.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Clearly flags known drug allergies and missing information requiring doctor verification.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Tags every piece of clinical data with its exact origin source for auditability.</span>
              </li>
            </ul>
          </div>

          {/* What MediKiosk DOES NOT DO */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              What MediKiosk Does NOT Do
            </h4>
            <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✗</span>
                <span>Never independently diagnoses any disease or medical condition.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✗</span>
                <span>Never prescribes medicines or suggests dosage modifications.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✗</span>
                <span>Never replaces a physical clinical examination performed by a licensed physician.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✗</span>
                <span>Never alters extracted lab findings without explicit clinician/patient verification.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✗</span>
                <span>Never retains unprotected session data across consecutive kiosk patients.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security & Confidentiality */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">
            Privacy & Session Confidentiality
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          MediKiosk implements strict role-based access control, cryptographic password hashing (bcrypt), and automated kiosk inactivity timers. In touch kiosk mode, all localized intake state is purged after session completion or period of inactivity to ensure that no patient's private medical details are accessible to subsequent users.
        </p>
      </div>
    </div>
  );
};

export default SafetyInfo;
