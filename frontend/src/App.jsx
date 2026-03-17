// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }              from './context/AuthContext';
import { RoleRoute }                 from './routes/ProtectedRoute';
import Navbar             from './components/Navbar';
import Login              from './pages/Login';
import Register           from './pages/Register';
import Jobs               from './pages/Jobs';
import JobDetail          from './pages/JobDetail';
import PostJob            from './pages/PostJob';
import EmployerListings   from './pages/EmployerListings';
import JobApplicants      from './pages/JobApplicants';
import CandidateDashboard from './pages/CandidateDashboard';
import EmployerDashboard  from './pages/EmployerDashboard';
import Apply              from './pages/Apply';
import MyApplications     from './pages/MyApplications';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Navbar appears on every page */}
        <Navbar />

        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs"     element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />

          {/* Candidate */}
          <Route path="/dashboard" element={
            <RoleRoute allowedRoles={['candidate']}>
              <CandidateDashboard />
            </RoleRoute>
          }/>
          <Route path="/apply/:id" element={
            <RoleRoute allowedRoles={['candidate']}>
              <Apply />
            </RoleRoute>
          }/>
          <Route path="/my-applications" element={
            <RoleRoute allowedRoles={['candidate']}>
              <MyApplications />
            </RoleRoute>
          }/>

          {/* Employer */}
          <Route path="/employer/dashboard" element={
            <RoleRoute allowedRoles={['employer']}>
              <EmployerDashboard />
            </RoleRoute>
          }/>
          <Route path="/employer/post-job" element={
            <RoleRoute allowedRoles={['employer']}>
              <PostJob />
            </RoleRoute>
          }/>
          <Route path="/employer/listings" element={
            <RoleRoute allowedRoles={['employer']}>
              <EmployerListings />
            </RoleRoute>
          }/>
          <Route path="/employer/applicants/:jobId" element={
            <RoleRoute allowedRoles={['employer']}>
              <JobApplicants />
            </RoleRoute>
          }/>

          <Route path="/" element={<Navigate to="/jobs" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}