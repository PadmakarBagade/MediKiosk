import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import KioskConsultation from './KioskConsultation';
import {
  Monitor,
  Activity,
  User,
  Phone,
  Clock,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  Heart,
  Sparkles
} from 'lucide-react';

const INACTIVITY_TIMEOUT_SECONDS = 75;
const COUNTDOWN_SECONDS = 15;

const KioskMode = () => {
  const { user, login, logout } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [sessionStarted, setSessionStarted] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [inactivityTimer, setInactivityTimer] = useState(INACTIVITY_TIMEOUT_SECONDS);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  const timerRef = useRef(null);

  // Inactivity detection listener
  const resetTimer = () => {
    if (showInactivityModal) return; // Don't reset if countdown already active
    setInactivityTimer(INACTIVITY_TIMEOUT_SECONDS);
  };

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const handleActivity = () => resetTimer();

    events.forEach((event) => window.addEventListener(event, handleActivity));

    const interval = setInterval(() => {
      if (sessionStarted) {
        setInactivityTimer((prev) => {
          if (prev <= 1) {
            setShowInactivityModal(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      clearInterval(interval);
    };
  }, [sessionStarted, showInactivityModal]);

  // Modal countdown
  useEffect(() => {
    let countdownInterval;
    if (showInactivityModal) {
      setCountdown(COUNTDOWN_SECONDS);
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            handleForceReset();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [showInactivityModal]);

  const handleForceReset = () => {
    setShowInactivityModal(false);
    setSessionStarted(false);
    setPatientName('');
    setPatientPhone('');
    setInactivityTimer(INACTIVITY_TIMEOUT_SECONDS);
    logout(); // Sanitizes auth and local state
  };

  const handleStayActive = () => {
    setShowInactivityModal(false);
    setInactivityTimer(INACTIVITY_TIMEOUT_SECONDS);
  };

  const handleStartSession = async (demoPatientEmail = null) => {
    if (demoPatientEmail) {
      try {
        await login(demoPatientEmail, 'Patient@123');
      } catch (e) {
        console.error(e);
      }
    }
    setSessionStarted(true);
    setInactivityTimer(INACTIVITY_TIMEOUT_SECONDS);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 select-none">
      {/* Kiosk Header */}
      <header className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 backdrop-blur flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-900/30">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-white block leading-tight">
              Medi<span className="text-emerald-400">Kiosk</span>
            </span>
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-500 block -mt-0.5">
              Touch Intake Station
            </span>
          </div>
        </div>

        {/* Right Tools: Language Toggle & Exit Button */}
        <div className="flex items-center gap-4">
          <LanguageSelector variant="kiosk" />

          <button
            type="button"
            onClick={handleForceReset}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition flex items-center gap-1.5"
            title="Reset Kiosk Session"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Kiosk</span>
          </button>

          <Link
            to="/"
            className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 text-xs font-bold border border-slate-700/60 transition"
          >
            Exit to Home
          </Link>
        </div>
      </header>

      {/* Main Kiosk Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-8 flex flex-col justify-center">
        {!sessionStarted ? (
          /* Kiosk Idle Welcome Screen */
          <div className="max-w-3xl mx-auto w-full text-center space-y-10 py-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-extrabold uppercase tracking-wider border border-emerald-500/30">
                <Sparkles className="w-4 h-4" />
                Touchscreen & Voice Enabled Pre-Consultation
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
                {language === 'hi'
                  ? 'क्या आप शुरू करने के लिए तैयार हैं?'
                  : language === 'mr'
                  ? 'आपण सुरू करण्यास तयार आहात का?'
                  : 'Are you ready to begin?'}
              </h1>

              <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
                {language === 'hi'
                  ? 'डॉक्टर से मिलने से पहले अपने लक्षणों और पुरानी रिपोर्ट्स की जानकारी कुछ ही मिनटों में दर्ज करें।'
                  : language === 'mr'
                  ? 'डॉक्टरांना भेटण्यापूर्वी आपली माहिती आणि अहवाल काही मिनिटांत नोंदवा.'
                  : 'Complete your health history in under 3 minutes before meeting your doctor. Use voice or touch.'}
              </p>
            </div>

            {/* Big Start Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleStartSession('rahul@medikiosk.com')}
                className="w-full sm:w-auto px-12 py-6 rounded-3xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-2xl sm:text-3xl shadow-2xl shadow-emerald-500/30 transition-all inline-flex items-center justify-center gap-4"
              >
                <span>
                  {language === 'hi'
                    ? 'परामर्श शुरू करें'
                    : language === 'mr'
                    ? 'सल्ला सुरू करा'
                    : 'Begin Consultation'}
                </span>
                <ArrowRight className="w-8 h-8" />
              </button>
            </div>

            {/* Quick Demo Patients for Evaluator Testing */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 text-left space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  ⚡ Quick Test Profiles (1-Touch Entry)
                </span>
                <span className="text-xs text-slate-400">
                  Select a test case to pre-fill baseline data
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleStartSession('rahul@medikiosk.com')}
                  className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition space-y-1"
                >
                  <div className="font-bold text-white text-sm">Rahul Verma (45M)</div>
                  <div className="text-xs text-emerald-400">Fever & Productive Cough</div>
                  <div className="text-[11px] text-slate-400">Hypertension • CBC Report</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartSession('sunita@medikiosk.com')}
                  className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition space-y-1"
                >
                  <div className="font-bold text-white text-sm">Sunita Patel (62F)</div>
                  <div className="text-xs text-teal-400">Severe Knee Pain & Stiffness</div>
                  <div className="text-[11px] text-slate-400">Diabetes • Glucose & X-Ray</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartSession('amit@medikiosk.com')}
                  className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition space-y-1"
                >
                  <div className="font-bold text-white text-sm">Amit Joshi (29M)</div>
                  <div className="text-xs text-indigo-400">Throbbing Headache</div>
                  <div className="text-[11px] text-slate-400">Penicillin Allergy • No Meds</div>
                </button>
              </div>
            </div>

            {/* Privacy & Safety Disclaimer Notice */}
            <div className="text-xs text-slate-500 max-w-xl mx-auto flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>
                All session data is automatically purged upon completion or inactivity to guarantee patient confidentiality.
              </span>
            </div>
          </div>
        ) : (
          /* Active Consultation Intake Wizard */
          <div className="text-slate-900">
            <KioskConsultation
              isStandaloneKiosk={true}
              onKioskComplete={() => {
                setTimeout(() => {
                  handleForceReset();
                }, 1000);
              }}
            />
          </div>
        )}
      </main>

      {/* Inactivity Security Warning Modal */}
      {showInactivityModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto animate-bounce">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Are you still there?</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                To protect your sensitive medical privacy, this kiosk session will reset and clear all data in:
              </p>
              <div className="text-5xl font-black text-amber-400 py-2">
                {countdown}s
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleStayActive}
                className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-lg shadow-lg shadow-emerald-500/30 transition"
              >
                Yes, Continue My Intake
              </button>

              <button
                type="button"
                onClick={handleForceReset}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-sm transition"
              >
                Reset Session Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kiosk Footer */}
      <footer className="px-6 py-3 bg-slate-950 border-t border-slate-800/80 text-slate-500 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Station Status: Operational</span>
        </div>
        <div>MediKiosk v1.0 • Clinical Pre-Consultation System</div>
      </footer>
    </div>
  );
};

export default KioskMode;
