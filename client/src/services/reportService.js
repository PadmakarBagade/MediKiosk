import api from './api';

export const uploadReportFile = async (file, consultationId = null, patientId = null) => {
  const formData = new FormData();
  formData.append('file', file);
  if (consultationId) formData.append('consultationId', consultationId);
  if (patientId) formData.append('patientId', patientId);

  const res = await api.post('/reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getReports = async (patientId = null) => {
  const url = patientId ? `/reports?patientId=${patientId}` : '/reports';
  const res = await api.get(url);
  return res.data;
};

export const getReportById = async (id) => {
  const res = await api.get(`/reports/${id}`);
  return res.data;
};

export const correctReportData = async (id, correctedData) => {
  const res = await api.put(`/reports/${id}/correct`, correctedData);
  return res.data;
};
