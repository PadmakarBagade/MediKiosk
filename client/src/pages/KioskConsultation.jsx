import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ProgressBar from '../components/ProgressBar';
import VoiceInput from '../components/VoiceInput';
import ReportUpload from '../components/ReportUpload';
import DisclaimerBanner from '../components/DisclaimerBanner';
import SourceBadge from '../components/SourceBadge';
import { submitConsultation } from '../services/consultationService';
import {
  User,
  Activity,
  Heart,
  Pill,
  Shield,
  Coffee,
  FileText,
  CheckSquare,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';

const KioskConsultation = ({ isStandaloneKiosk = false, onKioskComplete = null }) => {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [completedConsultation, setCompletedConsultation] = useState(null);

  // Form State
  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || '',
    gender: user?.gender || 'Prefer not to say',
    phone: user?.phone || '',
    emergencyName: user?.emergencyContact?.name || '',
    emergencyPhone: user?.emergencyContact?.phone || '',
  });

  const [complaint, setComplaint] = useState({
    problem: '',
    onsetDuration: '',
    progression: 'same',
    severityScore: 5,
    aggravatingFactors: '',
    relievingFactors: '',
  });

  const [medicalHistory, setMedicalHistory] = useState([
    { id: 'diabetes', name: 'Diabetes (High Blood Sugar)', hasCondition: 'No', details: '' },
    { id: 'bp', name: 'High Blood Pressure (Hypertension)', hasCondition: 'No', details: '' },
    { id: 'heart', name: 'Heart Disease', hasCondition: 'No', details: '' },
    { id: 'asthma', name: 'Asthma or Breathing Trouble', hasCondition: 'No', details: '' },
    { id: 'kidney', name: 'Kidney Problems', hasCondition: 'No', details: '' },
    { id: 'liver', name: 'Liver Problems', hasCondition: 'No', details: '' },
    { id: 'thyroid', name: 'Thyroid Disorder', hasCondition: 'No', details: '' },
    { id: 'surgeries', name: 'Major Past Surgeries', hasCondition: 'No', details: '' },
    { id: 'hospital', name: 'Past Hospitalizations', hasCondition: 'No', details: '' },
  ]);

  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', reason: '', isUnknown: false },
  ]);
  const [hasNoMeds, setHasNoMeds] = useState(false);

  const [allergies, setAllergies] = useState([
    { allergen: '', category: 'Medicine', reaction: '' },
  ]);
  const [hasNoAllergies, setHasNoAllergies] = useState(true);

  const [lifestyle, setLifestyle] = useState({
    smoking: 'Never',
    alcohol: 'Never',
    exercise: 'Moderate',
    sleepHours: '7-8 hours',
    diet: 'Balanced',
    occupation: '',
  });

  const [uploadedReports, setUploadedReports] = useState([]);

  // Prepopulate with profile if available
  useEffect(() => {
    if (profile) {
      if (profile.lifestyle) {
        setLifestyle((prev) => ({ ...prev, ...profile.lifestyle }));
      }
      if (profile.allergies && profile.allergies.length > 0) {
        setAllergies(profile.allergies);
        setHasNoAllergies(false);
      }
      if (profile.medications && profile.medications.length > 0) {
        setMedications(profile.medications);
        setHasNoMeds(false);
      }
    }
  }, [profile]);

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep((prev) => Math.min(prev + 1, 9));
  };

  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        chiefComplaint: complaint,
        medicalHistory: medicalHistory.map((m) => ({
          conditionName: m.name,
          hasCondition: m.hasCondition,
          details: m.details,
        })),
        medications: hasNoMeds ? [] : medications.filter((m) => m.name || m.isUnknown),
        allergies: hasNoAllergies ? [] : allergies.filter((a) => a.allergen),
        familyHistory: profile?.familyHistory || [],
        lifestyle,
        uploadedReports: uploadedReports.map((r) => r._id),
        kioskSession: Boolean(isStandaloneKiosk),
        patientReviewed: true,
      };

      const res = await submitConsultation(payload);
      if (res.success) {
        setCompletedConsultation(res.consultation);
        setStep(9);
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || 'Submission failed. Please ask staff for assistance.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 space-y-6">
      {step < 9 && <ProgressBar currentStep={step} totalSteps={9} />}
      <DisclaimerBanner compact={true} />

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-lg space-y-8">
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600">
                Step 1 of 9
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {t('step1_title')}
              </h2>
              <p className="text-sm text-slate-500">{t('step1_desc')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  {t('fullName')}
                </label>
                <input
                  type="text"
                  value={personalInfo.name}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                  className="w-full text-lg p-3.5 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  {t('gender')}
                </label>
                <select
                  value={personalInfo.gender}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                  className="w-full text-base p-3.5 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 font-semibold bg-white"
                >
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  {t('phone')}
                </label>
                <input
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  className="w-full text-lg p-3.5 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 font-semibold"
                />
              </div>

              <div className="space-y-1 sm:col-span-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  {t('emergencyContact')} (Name & Phone)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={personalInfo.emergencyName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, emergencyName: e.target.value })}
                    className="p-3.5 rounded-2xl border-2 border-slate-200 text-sm font-semibold"
                  />
                  <input
                    type="tel"
                    placeholder="Contact Phone"
                    value={personalInfo.emergencyPhone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, emergencyPhone: e.target.value })}
                    className="p-3.5 rounded-2xl border-2 border-slate-200 text-sm font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600">
                Step 2 of 9
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {t('step2_title')}
              </h2>
              <p className="text-sm text-slate-500">
                You can tap the microphone button to speak naturally, or type your answer.
              </p>
            </div>

            <div className="space-y-2">
              <VoiceInput
                value={complaint.problem}
                onChange={(val) => setComplaint({ ...complaint, problem: val })}
                placeholder={t('step2_placeholder')}
                isTextarea={true}
                rows={3}
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-base font-bold text-slate-800">
                {t('onsetQuestion')}
              </label>
              <input
                type="text"
                value={complaint.onsetDuration}
                onChange={(e) => setComplaint({ ...complaint, onsetDuration: e.target.value })}
                placeholder={t('onsetPlaceholder')}
                className="w-full text-lg p-3.5 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 font-semibold"
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-base font-bold text-slate-800">
                {t('courseQuestion')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'better', label: t('courseBetter') },
                  { key: 'worse', label: t('courseWorse') },
                  { key: 'same', label: t('courseSame') },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setComplaint({ ...complaint, progression: item.key })}
                    className={`py-3.5 px-4 rounded-2xl font-bold text-base transition-all border-2 ${
                      complaint.progression === item.key
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-base font-bold text-slate-800">
                  {t('severityQuestion')}
                </label>
                <span className="text-xl font-black px-3.5 py-1 rounded-xl bg-slate-900 text-white">
                  {complaint.severityScore} / 10
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={complaint.severityScore}
                onChange={(e) => setComplaint({ ...complaint, severityScore: parseInt(e.target.value) })}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>1 - Mild Discomfort</span>
                <span>5 - Moderate</span>
                <span>10 - Very Severe</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  {t('aggravatingQuestion')}
                </label>
                <input
                  type="text"
                  value={complaint.aggravatingFactors}
                  onChange={(e) => setComplaint({ ...complaint, aggravatingFactors: e.target.value })}
                  placeholder={t('aggravatingPlaceholder')}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 text-sm font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  {t('relievingQuestion')}
                </label>
                <input
                  type="text"
                  value={complaint.relievingFactors}
                  onChange={(e) => setComplaint({ ...complaint, relievingFactors: e.target.value })}
                  placeholder={t('relievingPlaceholder')}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 text-sm font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600">
                Step 3 of 9
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {t('step3_title')}
              </h2>
              <p className="text-sm text-slate-500">{t('step3_desc')}</p>
            </div>

            <div className="space-y-4">
              {medicalHistory.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-base font-bold text-slate-800">
                      {item.name}
                    </span>

                    <div className="grid grid-cols-3 gap-2 sm:w-72">
                      {['Yes', 'No', 'Not sure'].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            const copy = [...medicalHistory];
                            copy[idx].hasCondition = option;
                            setMedicalHistory(copy);
                          }}
                          className={`py-2 px-3 rounded-xl font-bold text-sm transition-all border-2 ${
                            item.hasCondition === option
                              ? option === 'Yes'
                                ? 'bg-amber-600 text-white border-amber-600'
                                : option === 'No'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-slate-700 text-white border-slate-700'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {option === 'Yes' ? t('yes') : option === 'No' ? t('no') : t('notSure')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {item.hasCondition === 'Yes' && (
                    <div className="pt-2">
                      <input
                        type="text"
                        placeholder={t('detailsIfYes')}
                        value={item.details}
                        onChange={(e) => {
                          const copy = [...medicalHistory];
                          copy[idx].details = e.target.value;
                          setMedicalHistory(copy);
                        }}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-medium"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600">
                Step 4 of 9
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {t('step4_title')}
              </h2>
              <p className="text-sm text-slate-500">{t('step4_desc')}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setHasNoMeds(!hasNoMeds)}
                className={`px-5 py-3 rounded-2xl font-bold text-sm border-2 transition ${
                  hasNoMeds
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                ✓ {t('noMeds')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setHasNoMeds(false);
                  setMedications([{ name: 'Unspecified Regular Medication', dosage: 'Unknown', frequency: 'Daily', reason: 'Unspecified', isUnknown: true }]);
                }}
                className="px-5 py-3 rounded-2xl font-bold text-sm bg-amber-50 text-amber-800 border-2 border-amber-300 hover:bg-amber-100 transition"
              >
                ❓ {t('dontKnowMeds')}
              </button>
            </div>

            {!hasNoMeds && (
              <div className="space-y-4">
                {medications.map((med, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">
                          {t('medName')}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Amlodipine"
                          value={med.name}
                          onChange={(e) => {
                            const copy = [...medications];
                            copy[idx].name = e.target.value;
                            setMedications(copy);
                          }}
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase">
                          {t('medDose')}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 5mg"
                          value={med.dosage}
                          onChange={(e) => {
                            const copy = [...medications];
                            copy[idx].dosage = e.target.value;
                            setMedications(copy);
                          }}
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase">
                          {t('medFreq')}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Once daily in morning"
                          value={med.frequency}
                          onChange={(e) => {
                            const copy = [...medications];
                            copy[idx].frequency = e.target.value;
                            setMedications(copy);
                          }}
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setMedications([...medications, { name: '', dosage: '', frequency: '', reason: '', isUnknown: false }])
                  }
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  {t('addMedicine')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 5 */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600">
                Step 5 of 9
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {t('step5_title')}
              </h2>
              <p className="text-sm text-slate-500">{t('step5_desc')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setHasNoAllergies(true)}
                className={`p-6 rounded-2xl border-2 font-bold text-base transition-all flex flex-col items-center justify-center gap-2 ${
                  hasNoAllergies
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <CheckCircle className="w-8 h-8" />
                <span>{t('noAllergies')}</span>
              </button>

              <button
                type="button"
                onClick={() => setHasNoAllergies(false)}
                className={`p-6 rounded-2xl border-2 font-bold text-base transition-all flex flex-col items-center justify-center gap-2 ${
                  !hasNoAllergies
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <Shield className="w-8 h-8" />
                <span>{t('hasAllergies')}</span>
              </button>
            </div>

            {!hasNoAllergies && (
              <div className="space-y-4 pt-2">
                {allergies.map((alg, idx) => (
                  <div
                    key={idx}
                    className="bg-rose-50/50 p-4 rounded-2xl border border-rose-200 space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-rose-800 uppercase">
                          {t('allergenName')}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Penicillin, Peanuts"
                          value={alg.allergen}
                          onChange={(e) => {
                            const copy = [...allergies];
                            copy[idx].allergen = e.target.value;
                            setAllergies(copy);
                          }}
                          className="w-full p-2.5 rounded-xl border border-rose-300 text-sm font-semibold mt-1 bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-rose-800 uppercase">
                          {t('allergyType')}
                        </label>
                        <select
                          value={alg.category}
                          onChange={(e) => {
                            const copy = [...allergies];
                            copy[idx].category = e.target.value;
                            setAllergies(copy);
                          }}
                          className="w-full p-2.5 rounded-xl border border-rose-300 text-sm font-semibold mt-1 bg-white"
                        >
                          <option value="Medicine">Medicine Allergy</option>
                          <option value="Food">Food Allergy</option>
                          <option value="Environmental">Environmental</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-rose-800 uppercase">
                          {t('allergyReaction')}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Skin rash, swelling"
                          value={alg.reaction}
                          onChange={(e) => {
                            const copy = [...allergies];
                            copy[idx].reaction = e.target.value;
                            setAllergies(copy);
                          }}
                          className="w-full p-2.5 rounded-xl border border-rose-300 text-sm font-semibold mt-1 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setAllergies([...allergies, { allergen: '', category: 'Medicine', reaction: '' }])
                  }
                  className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold transition"
                >
                  + Add Another Known Allergy
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 6 */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600">
                Step 6 of 9
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {t('step6_title')}
              </h2>
              <p className="text-sm text-slate-500">
                Brief habits to provide helpful clinical context for the doctor.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  {t('smokingQ')}
                </label>
                <select
                  value={lifestyle.smoking}
                  onChange={(e) => setLifestyle({ ...lifestyle, smoking: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 text-sm font-semibold bg-white"
                >
                  <option value="Never">Never smoked</option>
                  <option value="Former">Former smoker (quit)</option>
                  <option value="Regular">Regular smoker</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  {t('alcoholQ')}
                </label>
                <select
                  value={lifestyle.alcohol}
                  onChange={(e) => setLifestyle({ ...lifestyle, alcohol: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 text-sm font-semibold bg-white"
                >
                  <option value="Never">Never / Teetotaler</option>
                  <option value="Occasional">Occasional social</option>
                  <option value="Regular">Regular</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  {t('exerciseQ')}
                </label>
                <select
                  value={lifestyle.exercise}
                  onChange={(e) => setLifestyle({ ...lifestyle, exercise: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 text-sm font-semibold bg-white"
                >
                  <option value="Sedentary">Sedentary / Minimal</option>
                  <option value="Moderate">Moderate (walking 2-3x/wk)</option>
                  <option value="Active">Active (regular gym/sports)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  {t('sleepQ')}
                </label>
                <select
                  value={lifestyle.sleepHours}
                  onChange={(e) => setLifestyle({ ...lifestyle, sleepHours: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 text-sm font-semibold bg-white"
                >
                  <option value="Less than 5 hours">Less than 5 hours</option>
                  <option value="5-6 hours">5-6 hours</option>
                  <option value="7-8 hours">7-8 hours</option>
                  <option value="More than 8 hours">More than 8 hours</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  {t('occupationQ')}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Desk Worker, Teacher, Construction, Driver, Retired"
                  value={lifestyle.occupation}
                  onChange={(e) => setLifestyle({ ...lifestyle, occupation: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 text-sm font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 7 */}
        {step === 7 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600">
                Step 7 of 9
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {t('step7_title')}
              </h2>
              <p className="text-sm text-slate-500">{t('step7_desc')}</p>
            </div>

            <ReportUpload
              reports={uploadedReports}
              onReportsChange={(updated) => setUploadedReports(updated)}
            />

            {uploadedReports.length === 0 && (
              <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-500">
                  Don't have reports right now? You can safely proceed to the review step.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 8 */}
        {step === 8 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600">
                Step 8 of 9
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {t('step8_title')}
              </h2>
              <p className="text-sm text-slate-500">{t('step8_desc')}</p>
            </div>

            {submitError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-700">
                    Chief Complaint
                  </span>
                  <SourceBadge type="patient_entered" detail="Patient Input" />
                </div>
                <div className="text-base font-bold text-slate-900">
                  {complaint.problem || 'None stated'}
                </div>
                <div className="text-xs text-slate-600">
                  Onset: {complaint.onsetDuration || 'Unspecified'} | Severity: {complaint.severityScore}/10 | Progression: {complaint.progression}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-700">
                    Medical History Conditions
                  </span>
                  <SourceBadge type="patient_entered" detail="Questionnaire" />
                </div>
                <div className="text-xs text-slate-800 space-y-1">
                  {medicalHistory.filter((m) => m.hasCondition === 'Yes').length > 0 ? (
                    medicalHistory
                      .filter((m) => m.hasCondition === 'Yes')
                      .map((m) => (
                        <div key={m.id} className="font-semibold">
                          • {m.name} {m.details ? `(${m.details})` : ''}
                        </div>
                      ))
                  ) : (
                    <span className="text-slate-500 italic">No chronic medical conditions reported.</span>
                  )}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-700">
                    Current Medications
                  </span>
                  <SourceBadge type="patient_entered" detail="Patient" />
                </div>
                <div className="text-xs text-slate-800 space-y-1">
                  {hasNoMeds ? (
                    <span className="text-slate-500 italic">Not taking regular prescription medications.</span>
                  ) : medications.filter((m) => m.name).length > 0 ? (
                    medications
                      .filter((m) => m.name)
                      .map((m, i) => (
                        <div key={i} className="font-semibold">
                          • {m.name} ({m.dosage || 'Dose unspecified'}, {m.frequency || 'Freq unspecified'})
                        </div>
                      ))
                  ) : (
                    <span className="text-slate-500 italic">None reported.</span>
                  )}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-rose-800">
                    Allergies
                  </span>
                  <SourceBadge type="patient_entered" detail="Safety Flag" />
                </div>
                <div className="text-xs text-rose-900 space-y-1">
                  {hasNoAllergies ? (
                    <span className="text-slate-500 italic font-medium">No known allergies reported.</span>
                  ) : (
                    allergies
                      .filter((a) => a.allergen)
                      .map((a, i) => (
                        <div key={i} className="font-bold">
                          ⚠️ {a.allergen} ({a.category}): {a.reaction || 'Reaction unspecified'}
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-700">
                    Uploaded Medical Reports ({uploadedReports.length})
                  </span>
                  <SourceBadge type="ocr_extracted" detail="OCR Extraction" />
                </div>
                {uploadedReports.length > 0 ? (
                  <div className="space-y-2">
                    {uploadedReports.map((r) => (
                      <div key={r._id} className="text-xs text-slate-700">
                        <span className="font-bold text-slate-900">{r.originalName}</span>: {r.extractedData?.findings?.length || 0} parameter(s) extracted.
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">No reports attached.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 9 */}
        {step === 9 && (
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle className="w-12 h-12" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h2 className="text-3xl font-black text-slate-900">
                {t('step9_title')}
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                {t('step9_desc')}
              </p>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-medium">
                {t('step9_instruction')}
              </div>
            </div>

            {completedConsultation?.aiSummary && (
              <div className="text-left bg-slate-50 rounded-2xl p-5 border border-slate-200 max-h-64 overflow-y-auto space-y-2">
                <span className="text-xs font-black uppercase text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Generated Pre-Consultation Summary:
                </span>
                <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {completedConsultation.aiSummary.doctorFacingText}
                </pre>
              </div>
            )}

            <div className="pt-4 flex justify-center gap-4">
              {isStandaloneKiosk ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onKioskComplete) onKioskComplete();
                  }}
                  className="px-8 py-4 bg-emerald-600 text-white font-black text-lg rounded-2xl shadow-lg hover:bg-emerald-700 active:scale-95 transition"
                >
                  {t('startNewKiosk')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/patient/dashboard')}
                  className="px-8 py-3.5 bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-md hover:bg-emerald-700 transition"
                >
                  Return to Dashboard
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {step < 9 && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base transition flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>{t('back')}</span>
              </button>
            ) : (
              <div></div>
            )}

            {step < 8 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-md shadow-emerald-200 transition active:scale-95 flex items-center gap-2"
              >
                <span>{t('next')}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-10 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-lg shadow-emerald-200 transition active:scale-95 disabled:opacity-60 flex items-center gap-3"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Synthesizing AI Summary...</span>
                  </>
                ) : (
                  <>
                    <span>Submit to Doctor</span>
                    <CheckSquare className="w-6 h-6" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KioskConsultation;
