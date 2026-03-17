// src/api/jobsApi.js

import api from './axiosInstance';

export const fetchJobs = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search)     params.append('search',     filters.search);
  if (filters.location)   params.append('location',   filters.location);
  if (filters.job_type)   params.append('job_type',   filters.job_type);
  if (filters.experience) params.append('experience', filters.experience);
  if (filters.salary_min) params.append('salary_min', filters.salary_min);
  return api.get(`/jobs/?${params.toString()}`);
};

export const fetchJob        = (id)   => api.get(`/jobs/${id}/`);
export const createJob       = (data) => api.post('/jobs/', data);
export const updateJob       = (id, data) => api.put(`/jobs/${id}/`, data);
export const deleteJob       = (id)   => api.delete(`/jobs/${id}/`);
export const fetchMyJobs     = ()     => api.get('/jobs/my/');