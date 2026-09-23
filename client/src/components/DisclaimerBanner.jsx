import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const DisclaimerBanner = ({ compact = false }) => {
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Clinical Notice:</span> {t('medicalDisclaimer')}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 border-l-4 border-emerald-500 shadow-md flex items-start gap-4">
      <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl flex-shrink-0">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold tracking-wide uppercase text-emerald-400 flex items-center gap-2">
          Clinical Decision Support & Safety Principle
        </h4>
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
          {t('medicalDisclaimer')}
        </p>
      </div>
    </div>
  );
};

export default DisclaimerBanner;
