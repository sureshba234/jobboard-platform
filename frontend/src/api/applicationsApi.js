// src/api/applicationsApi.js

import api from './axiosInstance';

// Candidate submits application with resume file
export const applyToJob = (formData) =>
  api.post('/applications/apply/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

// Candidate views their applications
export const fetchMyApplications = () =>
  api.get('/applications/my/');

// Employer views applicants for a job
export const fetchJobApplications = (jobId) =>
  api.get(`/applications/job/${jobId}/`);

// Employer updates application status
export const updateApplicationStatus = (appId, status) =>
  api.patch(`/applications/${appId}/status/`, { status });

// Candidate withdraws application
export const withdrawApplication = (appId) =>
  api.delete(`/applications/${appId}/withdraw/`);