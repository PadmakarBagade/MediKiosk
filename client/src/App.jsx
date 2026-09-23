import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import KioskMode from './pages/KioskMode';
import PatientDashboard from './pages/PatientDashboard';
import KioskConsultation from './pages/KioskConsultation';
import PatientProfile from './pages/PatientProfile';
import Reports from './pages/Reports';
import ConsultationHistory from './pages/ConsultationHistory';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorPatientView from './pages/DoctorPatientView';
import SafetyInfo from './pages/SafetyInfo';

const AppLayout = () => {
  const location = useLocation();
  const isKioskRoute = location.pathname === '/kiosk';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/safety" element={<SafetyInfo />} />
          <Route path="/kiosk" element={<KioskMode />} />

          {/* Patient Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultation"
            element={
              <ProtectedRoute requiredRole="patient">
                <KioskConsultation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/reports"
            element={
              <ProtectedRoute requiredRole="patient">
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/history"
            element={
              <ProtectedRoute requiredRole="patient">
                <ConsultationHistory />
              </ProtectedRoute>
            }
          />

          {/* Doctor Routes */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/consultation/:id"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorPatientView />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isKioskRoute && (
        <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">
            MediKiosk • Production-Style MERN AI-Assisted Patient Pre-Consultation System
          </p>
          <p className="text-slate-400">
            Assistance and documentation preparation tool for qualified healthcare professionals. Does not provide independent medical diagnosis or treatments.
          </p>
        </footer>
      )}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <AppLayout />
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
