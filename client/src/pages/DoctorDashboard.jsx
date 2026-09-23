import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDoctorStats, getConsultationsQueue } from '../services/doctorService';
import DisclaimerBanner from '../components/DisclaimerBanner';
import {
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  Search,
  Filter,
  ArrowRight,
  FileText,
  AlertCircle,
  AlertTriangle,
  Activity,
  Stethoscope
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    newPatients: 0,
    pendingReviews: 0,
    todayConsultations: 0,
    completedConsultations: 0,
    redFlagAlerts: 0,
  });
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, queueRes] = await Promise.all([
        getDoctorStats(),
        getConsultationsQueue(statusFilter, searchQuery),
      ]);
      if (statsRes.success) setStats(statsRes.stats);
      if (queueRes.success) setConsultations(queueRes.consultations);
    } catch (e) {
      console.error('Failed to load doctor dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Clinician Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Physician Clinical Workstation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            {user?.name || 'Dr. Physician'}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">
            {user?.medicalSpecialization || 'General Physician'} • Reg #{user?.medicalLicenseNumber || 'MCI-REG-VALID'}
          </p>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-right">
          <div className="text-xs text-slate-400 uppercase font-bold">Today's Date</div>
          <div className="text-base font-extrabold text-white">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      <DisclaimerBanner compact={true} />

      {/* Red-Flag Urgent Clinical Alert Banner */}
      {consultations.some((c) => c.redFlag && c.status === 'pending_review') && (
        <div className="bg-rose-600 text-white rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-rose-700 animate-pulse">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
                <span>Immediate Clinical Triage Required</span>
                <span className="bg-white text-rose-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                  Red Flag
                </span>
              </div>
              <p className="text-xs text-rose-100 font-medium mt-0.5">
                High-risk clinical presentations detected in intake. Prioritized to the top of your review queue.
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 bg-white text-rose-700 font-black text-xs rounded-xl shadow-xs uppercase tracking-wider self-stretch sm:self-auto text-center">
            {consultations.filter((c) => c.redFlag && c.status === 'pending_review').length} Urgent Case(s)
          </span>
        </div>
      )}

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Patients
            </span>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {stats.newPatients}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm flex items-center justify-between bg-amber-50/20">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Pending Reviews
            </span>
            <div className="text-3xl font-black text-amber-700 mt-1">
              {stats.pendingReviews}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Today's Intakes
            </span>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {stats.todayConsultations}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Completed Reviews
            </span>
            <div className="text-3xl font-black text-emerald-600 mt-1">
              {stats.completedConsultations}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Patient Intake Queue */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {['all', 'pending_review', 'reviewed'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
                  statusFilter === st
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient or complaint..."
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs w-64 focus:border-emerald-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Patients Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-black tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Age / Gender</th>
                <th className="py-3 px-4">Main Complaint</th>
                <th className="py-3 px-4">Reports</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Intake Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    Loading clinical queue...
                  </td>
                </tr>
              ) : consultations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    No consultations found matching current filter.
                  </td>
                </tr>
              ) : (
                consultations.map((c) => {
                  const pAge = c.patientId?.dateOfBirth
                    ? Math.floor((new Date() - new Date(c.patientId.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
                    : 'N/A';

                  return (
                    <tr
                      key={c._id}
                      className={`transition cursor-pointer ${
                        c.redFlag
                          ? 'bg-rose-50/60 hover:bg-rose-100/70 border-l-4 border-l-rose-600'
                          : 'hover:bg-slate-50/80'
                      }`}
                      onClick={() => navigate(`/doctor/consultation/${c._id}`)}
                    >
                      <td className="py-4 px-4 font-bold text-slate-900">
                        <div className="flex flex-wrap items-center gap-2">
                          <span>{c.patientId?.name || 'Anonymous Patient'}</span>
                          {c.kioskSession && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              Kiosk
                            </span>
                          )}
                          {c.redFlag && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-xs">
                              <AlertTriangle className="w-3 h-3 text-white" />
                              RED FLAG
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        {pAge} yrs • {c.patientId?.gender || 'Unspecified'}
                      </td>
                      <td className="py-4 px-4 text-slate-800 font-medium max-w-xs">
                        <div className="truncate">{c.chiefComplaint?.problem || 'Intake completed'}</div>
                        {c.redFlag && c.redFlagReasons && c.redFlagReasons.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {c.redFlagReasons.map((reason, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-800 bg-rose-100/90 px-2 py-0.5 rounded border border-rose-300"
                              >
                                <AlertCircle className="w-2.5 h-2.5 text-rose-600 flex-shrink-0" />
                                {reason}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {c.uploadedReports && c.uploadedReports.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
                            <FileText className="w-3 h-3" />
                            {c.uploadedReports.length} file(s)
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">None</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${
                              c.status === 'reviewed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.redFlag
                                ? 'bg-rose-100 text-rose-900 font-black border border-rose-300'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {c.status === 'reviewed' ? 'Reviewed' : 'Pending Review'}
                          </span>
                          {c.redFlag && (
                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider">
                              Priority High
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/doctor/consultation/${c._id}`);
                          }}
                          className={`px-4 py-1.5 rounded-xl font-bold text-xs shadow-xs transition inline-flex items-center gap-1 text-white ${
                            c.redFlag
                              ? 'bg-rose-600 hover:bg-rose-700'
                              : 'bg-emerald-600 hover:bg-emerald-700'
                          }`}
                        >
                          <span>{c.redFlag ? 'Triage Now' : 'Review'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
