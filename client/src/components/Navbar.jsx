import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import { 
  Activity, 
  Monitor, 
  User, 
  LogOut, 
  FileText, 
  ShieldCheck, 
  Stethoscope, 
  Menu, 
  X,
  History,
  ClipboardList
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isDoctor, isPatient, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // In Kiosk Mode, navigation can be hidden or minimal
  const isKioskRoute = location.pathname === '/kiosk';

  if (isKioskRoute) {
    return null; // The dedicated Kiosk Mode renders its own specialized touch header
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 block leading-tight">
                  Medi<span className="text-emerald-600">Kiosk</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block -mt-0.5">
                  AI Pre-Consultation
                </span>
              </div>
            </Link>

            {/* Dedicated Kiosk Launcher Button */}
            <Link
              to="/kiosk"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition shadow-xs ml-4"
            >
              <Monitor className="w-3.5 h-3.5 text-emerald-600" />
              <span>Launch Kiosk</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-semibold transition ${
                location.pathname === '/' ? 'text-emerald-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview
            </Link>

            {isAuthenticated && isPatient && (
              <>
                <Link
                  to="/patient/dashboard"
                  className={`text-sm font-semibold transition ${
                    location.pathname === '/patient/dashboard' ? 'text-emerald-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/consultation"
                  className={`text-sm font-semibold transition ${
                    location.pathname === '/consultation' ? 'text-emerald-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  New Intake
                </Link>
                <Link
                  to="/patient/profile"
                  className={`text-sm font-semibold transition ${
                    location.pathname === '/patient/profile' ? 'text-emerald-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Medical Profile
                </Link>
                <Link
                  to="/patient/history"
                  className={`text-sm font-semibold transition ${
                    location.pathname === '/patient/history' ? 'text-emerald-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  History
                </Link>
              </>
            )}

            {isAuthenticated && isDoctor && (
              <>
                <Link
                  to="/doctor/dashboard"
                  className={`text-sm font-semibold transition ${
                    location.pathname === '/doctor/dashboard' ? 'text-emerald-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Doctor Workstation
                </Link>
              </>
            )}

            <Link
              to="/safety"
              className={`text-sm font-semibold transition flex items-center gap-1 ${
                location.pathname === '/safety' ? 'text-emerald-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Safety & AI
            </Link>
          </nav>

          {/* Right Area: Language Switcher & Auth */}
          <div className="flex items-center gap-3">
            <LanguageSelector />

            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {user?.name}
                  </div>
                  <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                    {isDoctor ? 'Doctor / Clinician' : 'Patient'}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition"
                >
                  {t('register')}
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-slate-700" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/kiosk"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-sm"
          >
            <Monitor className="w-4 h-4" />
            Launch Touch Kiosk
          </Link>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Overview
          </Link>

          {isAuthenticated && isPatient && (
            <>
              <Link
                to="/patient/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Patient Dashboard
              </Link>
              <Link
                to="/consultation"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Start Consultation Intake
              </Link>
              <Link
                to="/patient/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Medical Profile
              </Link>
              <Link
                to="/patient/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Consultation History
              </Link>
            </>
          )}

          {isAuthenticated && isDoctor && (
            <Link
              to="/doctor/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Doctor Workstation
            </Link>
          )}

          <Link
            to="/safety"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Safety Guidelines
          </Link>

          {isAuthenticated ? (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout ({user?.name})
            </button>
          ) : (
            <div className="pt-2 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-700"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 bg-emerald-600 rounded-xl text-sm font-bold text-white"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
