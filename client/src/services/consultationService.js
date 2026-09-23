import api from './api';

export const submitConsultation = async (consultationData) => {
  const res = await api.post('/consultations', consultationData);
  return res.data;
};

export const getMyConsultations = async () => {
  const res = await api.get('/consultations/my');
  return res.data;
};

export const getConsultationById = async (id) => {
  const res = await api.get(`/consultations/${id}`);
  return res.data;
};

export const updateConsultation = async (id, data) => {
  const res = await api.put(`/consultations/${id}`, data);
  return res.data;
};

export const getAIFollowUpQuestions = async (chiefComplaint) => {
  const res = await api.post('/ai/follow-up', { chiefComplaint });
  return res.data;
};
