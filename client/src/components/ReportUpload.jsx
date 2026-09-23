import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Trash2, Edit2, Loader2 } from 'lucide-react';
import { uploadReportFile, correctReportData } from '../services/reportService';
import { useLanguage } from '../context/LanguageContext';

const ReportUpload = ({ reports = [], onReportsChange, consultationId = null, patientId = null }) => {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [editingFinding, setEditingFinding] = useState(null); // { reportId, findingIndex, value }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadError('');

    for (const file of files) {
      try {
        const res = await uploadReportFile(file, consultationId, patientId);
        if (res.success && res.report) {
          const updated = [...reports, res.report];
          onReportsChange(updated);
        }
      } catch (err) {
        setUploadError(err.response?.data?.message || `Failed to process ${file.name}`);
      }
    }

    setUploading(false);
    e.target.value = null; // reset input
  };

  const handleRemoveReport = (reportId) => {
    const updated = reports.filter((r) => r._id !== reportId);
    onReportsChange(updated);
  };

  const handleSaveCorrection = async (reportId, findingIdx, newVal) => {
    const report = reports.find((r) => r._id === reportId);
    if (!report) return;

    const newFindings = [...report.extractedData.findings];
    newFindings[findingIdx] = {
      ...newFindings[findingIdx],
      value: newVal,
      isCorrectedByPatient: true,
    };

    try {
      const res = await correctReportData(reportId, { findings: newFindings });
      if (res.success) {
        const updatedReports = reports.map((r) => (r._id === reportId ? res.report : r));
        onReportsChange(updatedReports);
        setEditingFinding(null);
      }
    } catch (e) {
      console.error('Failed to correct report value:', e);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Dropzone */}
      <div className="relative border-3 border-dashed border-emerald-300 hover:border-emerald-500 rounded-3xl p-8 text-center bg-emerald-50/40 transition group cursor-pointer">
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          onChange={handleFileSelect}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-emerald-600 group-hover:scale-105 transition">
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>
          <div>
            <h4 className="text-xl font-bold text-slate-800">
              {uploading ? 'Analyzing Report with OCR...' : t('uploadPrompt')}
            </h4>
            <p className="text-sm text-slate-500 mt-1">
              Supported formats: PDF, JPG, JPEG, PNG (Max 15MB)
            </p>
          </div>
          <span className="inline-block px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-sm group-hover:bg-emerald-700 transition">
            Browse Medical Files
          </span>
        </div>
      </div>

      {uploadError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Uploaded Reports List */}
      {reports.length > 0 && (
        <div className="space-y-4">
          <h5 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Processed Medical Reports ({reports.length})
          </h5>

          <div className="space-y-4">
            {reports.map((rep) => (
              <div
                key={rep._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4"
              >
                {/* File Header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h6 className="font-bold text-slate-900 text-base">
                        {rep.originalName || rep.fileName}
                      </h6>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>Category: {rep.extractedData?.testCategory || 'Medical Report'}</span>
                        <span>•</span>
                        <span>{new Date(rep.uploadedAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        rep.processingStatus === 'Extracted' || rep.processingStatus === 'Reviewed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rep.processingStatus === 'Processing'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {rep.processingStatus}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveReport(rep._id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
                      title="Remove report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Extracted Findings Table / Chips */}
                {rep.extractedData?.findings && rep.extractedData.findings.length > 0 ? (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        {t('extractedValues')} (Click edit if OCR misread)
                      </span>
                      <span className="text-xs text-slate-400">
                        Source: OCR Machine Reader
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {rep.extractedData.findings.map((finding, fIdx) => {
                        const isEditing =
                          editingFinding?.reportId === rep._id &&
                          editingFinding?.findingIndex === fIdx;

                        return (
                          <div
                            key={fIdx}
                            className={`p-3 rounded-xl border bg-white shadow-xs space-y-1 transition ${
                              finding.status === 'High' || finding.status === 'Low' || finding.status === 'Abnormal'
                                ? 'border-amber-300 bg-amber-50/30'
                                : 'border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span className="font-semibold text-slate-700 truncate max-w-[120px]">
                                {finding.testName}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingFinding(
                                    isEditing ? null : { reportId: rep._id, findingIndex: fIdx, value: finding.value }
                                  )
                                }
                                className="text-slate-400 hover:text-emerald-600 p-1"
                                title="Correct extracted value"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>

                            {isEditing ? (
                              <div className="flex items-center gap-1.5 mt-1">
                                <input
                                  type="text"
                                  value={editingFinding.value}
                                  onChange={(e) =>
                                    setEditingFinding({ ...editingFinding, value: e.target.value })
                                  }
                                  className="w-full text-xs p-1 border border-emerald-500 rounded outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSaveCorrection(rep._id, fIdx, editingFinding.value)
                                  }
                                  className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold"
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-baseline justify-between">
                                <span className="text-base font-bold text-slate-900">
                                  {finding.value}{' '}
                                  <span className="text-xs font-normal text-slate-500">
                                    {finding.unit}
                                  </span>
                                </span>
                                {finding.status !== 'Normal' && (
                                  <span
                                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                                      finding.status === 'High'
                                        ? 'bg-rose-100 text-rose-700'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {finding.status}
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="text-[11px] text-slate-400">
                              Ref: {finding.referenceRange || 'N/A'}
                            </div>

                            {finding.isCorrectedByPatient && (
                              <div className="text-[10px] text-emerald-600 font-semibold pt-0.5">
                                ✓ Corrected by Patient
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
                    Report uploaded. Text extracted for physician review.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportUpload;
