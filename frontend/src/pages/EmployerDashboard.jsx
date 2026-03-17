// src/pages/EmployerDashboard.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyJobs } from '../api/jobsApi';
import { fetchJobApplications } from '../api/applicationsApi';

export default function EmployerDashboard() {
  const { user }  = useAuth();
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalApps, setTotalApps] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const jobRes = await fetchMyJobs();
      const jobList = jobRes.data;
      setJobs(jobList);

      // Count total applications across all jobs
      let appCount = 0;
      for (const job of jobList) {
        try {
          const appRes = await fetchJobApplications(job.id);
          appCount += appRes.data.length;
        } catch {}
      }
      setTotalApps(appCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeJobs   = jobs.filter(j => j.is_active).length;
  const inactiveJobs = jobs.filter(j => !j.is_active).length;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ margin: '0 0 4px' }}>
          Welcome, {user?.company_name} 👋
        </h2>
        <p style={{ margin: 0, color: '#666' }}>
          Manage your job listings and review applicants
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16, marginBottom: 32
      }}>
        {[
          { label: 'Total Jobs',    value: jobs.length, bg: '#eff6ff', color: '#1d4ed8' },
          { label: 'Active',        value: activeJobs,  bg: '#dcfce7', color: '#15803d' },
          { label: 'Inactive',      value: inactiveJobs,bg: '#fef9c3', color: '#854d0e' },
          { label: 'Total Applicants', value: totalApps,bg: '#f3e8ff', color: '#7e22ce' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: stat.bg, borderRadius: 10, padding: '20px 24px'
          }}>
            <p style={{ margin: '0 0 4px', fontSize: 13, color: stat.color }}>
              {stat.label}
            </p>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: stat.color }}>
              {loading ? '-' : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

        {/* Recent job listings */}
        <div style={{
          border: '1px solid #e2e8f0', borderRadius: 12, padding: 24
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 18
          }}>
            <h3 style={{ margin: 0 }}>Your Job Listings</h3>
            <Link to="/employer/listings" style={{
              fontSize: 13, color: '#2563eb', textDecoration: 'none'
            }}>
              View all
            </Link>
          </div>

          {loading ? (
            <p style={{ color: '#999' }}>Loading...</p>
          ) : jobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#999' }}>
              <p>No jobs posted yet</p>
              <Link to="/employer/post-job" style={{ color: '#2563eb', fontSize: 14 }}>
                Post your first job
              </Link>
            </div>
          ) : (
            jobs.slice(0, 4).map(job => (
              <div key={job.id} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '12px 0',
                borderBottom: '1px solid #f1f5f9'
              }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontWeight: 500, fontSize: 14 }}>
                    {job.title}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                    {job.location} ·{' '}
                    {job.job_type?.replace('_', ' ')}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{
                    fontSize: 12, color: '#64748b',
                    background: '#f1f5f9', padding: '2px 10px', borderRadius: 10
                  }}>
                    {job.application_count ?? 0} applicants
                  </span>
                  <Link to={`/employer/applicants/${job.id}`} style={{
                    fontSize: 12, color: '#2563eb', textDecoration: 'none'
                  }}>
                    View
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ margin: '0 0 4px' }}>Quick Actions</h3>

          {[
            {
              to: '/employer/post-job', label: 'Post a New Job',
              desc: 'Create a new listing',
              bg: '#eff6ff', color: '#1d4ed8'
            },
            {
              to: '/employer/listings', label: 'Manage Listings',
              desc: 'Edit or delete jobs',
              bg: '#f0fdf4', color: '#15803d'
            },
            {
              to: '/jobs', label: 'Browse All Jobs',
              desc: 'See what others are posting',
              bg: '#fafafa', color: '#374151'
            },
          ].map(action => (
            <Link key={action.to} to={action.to} style={{ textDecoration: 'none' }}>
              <div style={{
                border: '1px solid #e2e8f0', borderRadius: 10,
                padding: '14px 18px', background: action.bg
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <p style={{ margin: '0 0 2px', fontWeight: 600, color: action.color }}>
                  {action.label}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
                  {action.desc}
                </p>
              </div>
            </Link>
          ))}

          {/* Company info */}
          <div style={{
            border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 18px'
          }}>
            <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 14 }}>
              Company Profile
            </p>
            <p style={{ margin: '0 0 4px', fontSize: 13, color: '#666' }}>
              {user?.company_name}
            </p>
            <p style={{ margin: '0 0 6px', fontSize: 12, color: '#94a3b8' }}>
              {user?.email}
            </p>
            <span style={{
              background: '#dbeafe', color: '#1d4ed8',
              padding: '2px 10px', borderRadius: 10, fontSize: 12
            }}>
              employer
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}