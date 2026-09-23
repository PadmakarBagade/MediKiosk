import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Stethoscope, User, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-200">
            <Activity className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Sign In to MediKiosk
          </h2>
          <p className="text-sm text-slate-500">
            Access your patient dashboard or doctor clinical workstation
          </p>
        </div>

        {/* 1-Click Demo Selector Box */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
          <span className="text-[11px] font-black tracking-widest text-emerald-800 uppercase block">
            ⚡ Quick Demo Autofill
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoFill('doctor@medikiosk.com', 'Doctor@123')}
              className="p-2.5 bg-white border border-emerald-300 rounded-xl font-bold text-slate-800 hover:bg-emerald-100/50 text-left transition flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">Dr. Sarah (Doctor)</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill('rahul@medikiosk.com', 'Patient@123')}
              className="p-2.5 bg-white border border-emerald-300 rounded-xl font-bold text-slate-800 hover:bg-emerald-100/50 text-left transition flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span className="truncate">Rahul (Fever/Cough)</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill('sunita@medikiosk.com', 'Patient@123')}
              className="p-2.5 bg-white border border-emerald-300 rounded-xl font-bold text-slate-800 hover:bg-emerald-100/50 text-left transition flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
              <span className="truncate">Sunita (Knee/Diabetes)</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill('amit@medikiosk.com', 'Patient@123')}
              className="p-2.5 bg-white border border-emerald-300 rounded-xl font-bold text-slate-800 hover:bg-emerald-100/50 text-left transition flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
              <span className="truncate">Amit (Headache)</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition text-sm text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-200 transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>

          <div className="text-center text-xs text-slate-500 pt-2">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700">
              Create an account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
