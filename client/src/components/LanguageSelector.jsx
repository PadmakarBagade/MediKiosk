import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSelector = ({ variant = 'default' }) => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिन्दी', short: 'हि' },
    { code: 'mr', label: 'मराठी', short: 'म' },
  ];

  if (variant === 'kiosk') {
    return (
      <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur p-1.5 rounded-2xl border border-slate-700">
        <Globe className="w-5 h-5 text-emerald-400 ml-2" />
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`px-4 py-2 rounded-xl text-base font-bold transition-all ${
              language === lang.code
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
      <Globe className="w-4 h-4 text-slate-500 ml-1.5 mr-0.5" />
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
            language === lang.code
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
