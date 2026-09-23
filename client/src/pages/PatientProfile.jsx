import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Heart, Shield, Pill, Activity, Plus, Trash2, Save, CheckCircle2 } from 'lucide-react';

const PatientProfile = () => {
  const { user, profile, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    bloodGroup: 'Unknown',
    height: '',
    weight: '',
    allergies: [],
    conditions: [],
    medications: [],
    surgeries: [],
    familyHistory: [],
    lifestyle: {
      smoking: 'Never',
      alcohol: 'Never',
      exercise: 'Sedentary',
      sleepHours: '7-8 hours',
      diet: 'Balanced',
      occupation: '',
    },
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        bloodGroup: profile.bloodGroup || 'Unknown',
        height: profile.height || '',
        weight: profile.weight || '',
        allergies: profile.allergies || [],
        conditions: profile.conditions || [],
        medications: profile.medications || [],
        surgeries: profile.surgeries || [],
        familyHistory: profile.familyHistory || [],
        lifestyle: profile.lifestyle || {
          smoking: 'Never',
          alcohol: 'Never',
          exercise: 'Sedentary',
          sleepHours: '7-8 hours',
          diet: 'Balanced',
          occupation: '',
        },
      });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const res = await api.put('/patients/profile', formData);
      if (res.data.success) {
        setSuccessMsg('Medical profile saved successfully!');
        await refreshProfile();
      }
    } catch (e) {
      console.error('Failed to update profile:', e);
    } finally {
      setSaving(false);
    }
  };

  const addCondition = () => {
    setFormData({
      ...formData,
      conditions: [...formData.conditions, { name: '', diagnosedYear: '', status: 'Active', notes: '' }],
    });
  };
  const removeCondition = (idx) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((_, i) => i !== idx),
    });
  };

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { name: '', dosage: '', frequency: '', purpose: '' }],
    });
  };
  const removeMedication = (idx) => {
    setFormData({
      ...formData,
      medications: formData.medications.filter((_, i) => i !== idx),
    });
  };

  const addAllergy = () => {
    setFormData({
      ...formData,
      allergies: [...formData.allergies, { allergen: '', reaction: '', severity: 'Moderate', category: 'Medicine' }],
    });
  };
  const removeAllergy = (idx) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Baseline Medical Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Maintain your health history so future consultations are automatically pre-populated.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-sm transition active:scale-95 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            Vitals & Blood Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Blood Group
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 text-sm bg-white"
              >
                {['Unknown', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Height (cm)
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                placeholder="e.g. 172"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Weight (kg)
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="e.g. 70"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Diagnosed Chronic Conditions ({formData.conditions.length})
            </h3>
            <button
              type="button"
              onClick={addCondition}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Condition
            </button>
          </div>

          <div className="space-y-3">
            {formData.conditions.map((cond, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <input
                  type="text"
                  placeholder="Condition name (e.g. Hypertension)"
                  value={cond.name}
                  onChange={(e) => {
                    const copy = [...formData.conditions];
                    copy[idx].name = e.target.value;
                    setFormData({ ...formData, conditions: copy });
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:col-span-2"
                />
                <input
                  type="text"
                  placeholder="Diagnosed Year (e.g. 2021)"
                  value={cond.diagnosedYear}
                  onChange={(e) => {
                    const copy = [...formData.conditions];
                    copy[idx].diagnosedYear = e.target.value;
                    setFormData({ ...formData, conditions: copy });
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={cond.status}
                    onChange={(e) => {
                      const copy = [...formData.conditions];
                      copy[idx].status = e.target.value;
                      setFormData({ ...formData, conditions: copy });
                    }}
                    className="w-full px-2 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Managed">Managed</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeCondition(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Pill className="w-5 h-5 text-indigo-600" />
              Regular Medications ({formData.medications.length})
            </h3>
            <button
              type="button"
              onClick={addMedication}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Medication
            </button>
          </div>

          <div className="space-y-3">
            {formData.medications.map((med, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <input
                  type="text"
                  placeholder="Medicine Name (e.g. Metformin)"
                  value={med.name}
                  onChange={(e) => {
                    const copy = [...formData.medications];
                    copy[idx].name = e.target.value;
                    setFormData({ ...formData, medications: copy });
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
                <input
                  type="text"
                  placeholder="Dose (e.g. 500mg)"
                  value={med.dosage}
                  onChange={(e) => {
                    const copy = [...formData.medications];
                    copy[idx].dosage = e.target.value;
                    setFormData({ ...formData, medications: copy });
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
                <input
                  type="text"
                  placeholder="Frequency (e.g. Twice daily)"
                  value={med.frequency}
                  onChange={(e) => {
                    const copy = [...formData.medications];
                    copy[idx].frequency = e.target.value;
                    setFormData({ ...formData, medications: copy });
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Purpose"
                    value={med.purpose}
                    onChange={(e) => {
                      const copy = [...formData.medications];
                      copy[idx].purpose = e.target.value;
                      setFormData({ ...formData, medications: copy });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeMedication(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-rose-600" />
              Known Allergies ({formData.allergies.length})
            </h3>
            <button
              type="button"
              onClick={addAllergy}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Allergy
            </button>
          </div>

          <div className="space-y-3">
            {formData.allergies.map((alg, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-rose-50/40 p-3 rounded-2xl border border-rose-200">
                <input
                  type="text"
                  placeholder="Allergen (e.g. Penicillin, Peanuts)"
                  value={alg.allergen}
                  onChange={(e) => {
                    const copy = [...formData.allergies];
                    copy[idx].allergen = e.target.value;
                    setFormData({ ...formData, allergies: copy });
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
                <input
                  type="text"
                  placeholder="Reaction (e.g. Hives, Swelling)"
                  value={alg.reaction}
                  onChange={(e) => {
                    const copy = [...formData.allergies];
                    copy[idx].reaction = e.target.value;
                    setFormData({ ...formData, allergies: copy });
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
                <select
                  value={alg.category}
                  onChange={(e) => {
                    const copy = [...formData.allergies];
                    copy[idx].category = e.target.value;
                    setFormData({ ...formData, allergies: copy });
                  }}
                  className="px-2 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="Medicine">Medicine</option>
                  <option value="Food">Food</option>
                  <option value="Environmental">Environmental</option>
                  <option value="Other">Other</option>
                </select>
                <div className="flex items-center gap-2">
                  <select
                    value={alg.severity}
                    onChange={(e) => {
                      const copy = [...formData.allergies];
                      copy[idx].severity = e.target.value;
                      setFormData({ ...formData, allergies: copy });
                    }}
                    className="w-full px-2 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeAllergy(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default PatientProfile;
