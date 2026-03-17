// src/pages/CandidateDashboard.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyApplications } from '../api/applicationsApi';

const STATUS_STYLES = {
  applied:     { bg: '#eff6ff', color: '#1d4ed8', label: 'Applied' },
  reviewing:   { bg: '#fef9c3', color: '#854d0e', label: 'Reviewing' },
  shortlisted: { bg: '#dcfce7', color: '#15803d', label: 'Shortlisted' },
  rejected:    { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
  hired:       { bg: '#f3e8ff', color: '#7e22ce', label: 'Hired' },
};

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [apps,    setApps]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyApplications()
      .then(res => setApps(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Stats
  const total       = apps.length;
  const shortlisted = apps.filter(a => a.status === 'shortlisted').length;
  const hired       = apps.filter(a => a.status === 'hired').length;
  const rejected    = apps.filter(a => a.status === 'rejected').length;
  const recent      = apps.slice(0, 3);

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>

      {/* Welcome header */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ margin: '0 0 4px' }}>
          Welcome back, {user?.full_name} 👋
        </h2>
        <p style={{ margin: 0, color: '#666' }}>
          Here is a summary of your job search activity
        </p>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16, marginBottom: 32
      }}>
        {[
          { label: 'Total Applied',  value: total,       bg: '#eff6ff', color: '#1d4ed8' },
          { label: 'Shortlisted',    value: shortlisted, bg: '#dcfce7', color: '#15803d' },
          { label: 'Hired',          value: hired,       bg: '#f3e8ff', color: '#7e22ce' },
          { label: 'Rejected',       value: rejected,    bg: '#fee2e2', color: '#dc2626' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: stat.bg, borderRadius: 10,
            padding: '20px 24px'
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

        {/* Recent Applications */}
        <div style={{
          border: '1px solid #e2e8f0', borderRadius: 12, padding: 24
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 18
          }}>
            <h3 style={{ margin: 0 }}>Recent Applications</h3>
            <Link to="/my-applications" style={{
              fontSize: 13, color: '#2563eb', textDecoration: 'none'
            }}>
              View all
            </Link>
          </div>

          {loading ? (
            <p style={{ color: '#999' }}>Loading...</p>
          ) : recent.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#999' }}>
              <p>No applications yet</p>
              <Link to="/jobs" style={{ color: '#2563eb', fontSize: 14 }}>
                Browse jobs to get started
              </Link>
            </div>
          ) : (
            recent.map(app => {
              const s = STATUS_STYLES[app.status] || STATUS_STYLES.applied;
              return (
                <div key={app.id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '12px 0',
                  borderBottom: '1px solid #f1f5f9'
                }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontWeight: 500, fontSize: 14 }}>
                      {app.job_title}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                      {app.job_company} ·{' '}
                      {new Date(app.applied_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <span style={{
                    background: s.bg, color: s.color,
                    padding: '3px 12px', borderRadius: 20, fontSize: 12
                  }}>
                    {s.label}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ margin: '0 0 4px' }}>Quick Actions</h3>

          {[
            {
              to: '/jobs', label: 'Browse Jobs',
              desc: 'Find new opportunities',
              bg: '#eff6ff', color: '#1d4ed8'
            },
            {
              to: '/my-applications', label: 'My Applications',
              desc: 'Track your progress',
              bg: '#f0fdf4', color: '#15803d'
            },
          ].map(action => (
            <Link key={action.to} to={action.to} style={{ textDecoration: 'none' }}>
              <div style={{
                border: '1px solid #e2e8f0', borderRadius: 10,
                padding: '16px 18px', background: action.bg,
                transition: 'opacity 0.2s'
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

          {/* Profile info */}
          <div style={{
            border: '1px solid #e2e8f0', borderRadius: 10,
            padding: '16px 18px', marginTop: 4
          }}>
            <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 14 }}>
              Your Profile
            </p>
            <p style={{ margin: '0 0 4px', fontSize: 13, color: '#666' }}>
              {user?.email}
            </p>
            <span style={{
              background: '#dbeafe', color: '#1d4ed8',
              padding: '2px 10px', borderRadius: 10, fontSize: 12
            }}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}