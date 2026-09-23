import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Check } from 'lucide-react';

const ProgressBar = ({ currentStep, totalSteps = 9 }) => {
  const { t } = useLanguage();

  const stepLabels = [
    t('step1'),
    t('step2'),
    t('step3'),
    t('step4'),
    t('step5'),
    t('step6'),
    t('step7'),
    t('step8'),
    t('step9'),
  ];

  const progressPercent = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  return (
    <div className="w-full space-y-3">
      {/* Top row with step numbers and current title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-sm shadow-sm">
            {currentStep}
          </span>
          <span className="text-lg font-bold text-slate-800">
            {stepLabels[currentStep - 1]}
          </span>
        </div>
        <span className="text-sm font-semibold text-slate-500">
          Step {currentStep} of {totalSteps} ({progressPercent}%)
        </span>
      </div>

      {/* Progress Bar Line */}
      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5 shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step dots for widescreen kiosk */}
      <div className="hidden md:flex justify-between items-center pt-1 px-1">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNum = idx + 1;
          const isDone = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div key={stepNum} className="flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'ring-4 ring-emerald-200 bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : stepNum}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;
