import React from 'react';
import { User, FileText, Cpu, CheckCircle } from 'lucide-react';

const SourceBadge = ({ type, detail = '' }) => {
  switch (type) {
    case 'patient_entered':
      return (
        <span
          title={detail}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
        >
          <User className="w-3 h-3" />
          Patient Reported
        </span>
      );
    case 'ocr_extracted':
      return (
        <span
          title={detail}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200"
        >
          <FileText className="w-3 h-3" />
          Report OCR
        </span>
      );
    case 'ai_extracted':
      return (
        <span
          title={detail}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200"
        >
          <Cpu className="w-3 h-3" />
          AI Structured
        </span>
      );
    case 'doctor_verified':
      return (
        <span
          title={detail}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
        >
          <CheckCircle className="w-3 h-3" />
          Doctor Verified
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">
          Source: {type}
        </span>
      );
  }
};

export default SourceBadge;
