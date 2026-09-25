import api from './api';

export const getDoctorStats = async () => {
  const res = await api.get('/doctors/stats');
  return res.data;
};

export const getConsultationsQueue = async (status = 'all', search = '') => {
  const res = await api.get(`/doctors/consultations?status=${status}&search=${encodeURIComponent(search)}`);
  return res.data;
};

export const reviewConsultation = async (consultationId, reviewData) => {
  const res = await api.post(`/doctors/consultations/${consultationId}/review`, reviewData);
  return res.data;
};

export const updateAiSummary = async (consultationId, summaryData) => {
  const res = await api.put(`/doctors/consultations/${consultationId}/summary`, summaryData);
  return res.data;
};

export const getPatientFullHistory = async (patientId) => {
  const res = await api.get(`/doctors/patients/${patientId}/profile`);
  return res.data;
};
