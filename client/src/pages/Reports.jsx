import React, { useState, useEffect } from 'react';
import ReportUpload from '../components/ReportUpload';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { getReports } from '../services/reportService';
import { FileText, ShieldAlert } from 'lucide-react';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getReports();
        if (res.success) {
          setReports(res.reports);
        }
      } catch (e) {
        console.error('Failed to load reports:', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-8 h-8 text-emerald-600" />
          Medical Reports & OCR Diagnostics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload PDF laboratory findings, prescription notes, or radiology scans. The system extracts clinical parameters for physician review.
        </p>
      </div>

      <DisclaimerBanner compact={true} />

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <ReportUpload
          reports={reports}
          onReportsChange={(updated) => setReports(updated)}
        />
      </div>
    </div>
  );
};

export default Reports;
