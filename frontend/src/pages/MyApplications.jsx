// src/pages/MyApplications.jsx

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchMyApplications, withdrawApplication } from '../api/applicationsApi';

const STATUS_STYLES = {
  applied:     { bg: '#eff6ff', color: '#1d4ed8', label: 'Applied' },
  reviewing:   { bg: '#fef9c3', color: '#854d0e', label: 'Reviewing' },
  shortlisted: { bg: '#dcfce7', color: '#15803d', label: 'Shortlisted' },
  rejected:    { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
  hired:       { bg: '#f3e8ff', color: '#7e22ce', label: 'Hired' },
};

export default function MyApplications() {
  const [apps,    setApps]    = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const successMsg = location.state?.success;

  useEffect(() => {
    fetchMyApplications()
      .then(res => setApps(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Withdraw this application?')) return;
    try {
      await withdrawApplication(appId);
      setApps(apps.filter(a => a.id !== appId));
    } catch {
      alert('Failed to withdraw application.');
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '30px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>My Applications</h2>
        <Link to="/jobs" style={{
          padding: '8px 18px', background: '#2563eb',
          color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: 14
        }}>
          Browse More Jobs
        </Link>
      </div>

      {/* Success message */}
      {successMsg && (
        <div style={{
          background: '#dcfce7', border: '1px solid #86efac',
          borderRadius: 8, padding: 14, marginBottom: 20, color: '#15803d'
        }}>
          {successMsg}
        </div>
      )}

      {loading ? (
        <p>Loading your applications...</p>
      ) : apps.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
          <p style={{ fontSize: 18 }}>No applications yet</p>
          <Link to="/jobs" style={{ color: '#2563eb' }}>
            Browse jobs and apply now
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {apps.map(app => {
            const s = STATUS_STYLES[app.status] || STATUS_STYLES.applied;
            return (
              <div key={app.id} style={{
                border: '1px solid #e2e8f0', borderRadius: 10,
                padding: 22, background: '#fff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px' }}>
                      <Link to={`/jobs/${app.job}`} style={{ color: '#1d4ed8', textDecoration: 'none' }}>
                        {app.job_title}
                      </Link>
                    </h3>
                    <p style={{ margin: '0 0 8px', color: '#666', fontSize: 14 }}>
                      {app.job_company} - {app.job_location}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                      Applied on {new Date(app.applied_at).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span style={{
                    background: s.bg, color: s.color,
                    padding: '5px 14px', borderRadius: 20,
                    fontSize: 13, fontWeight: 500
                  }}>
                    {s.label}
                  </span>
                </div>

                {/* Cover letter preview */}
                {app.cover_letter && (
                  <p style={{
                    margin: '12px 0 0', fontSize: 13, color: '#555',
                    background: '#f8fafc', padding: 10, borderRadius: 6
                  }}>
                    {app.cover_letter.length > 120
                      ? app.cover_letter.slice(0, 120) + '...'
                      : app.cover_letter}
                  </p>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  {app.resume && (
<a href={app.resume.startsWith('http') ? app.resume : `http://localhost:8000${app.resume}`}                      target="_blank" rel="noreferrer"
                      style={{
                        padding: '6px 14px', background: '#f1f5f9',
                        color: '#374151', borderRadius: 6,
                        textDecoration: 'none', fontSize: 13
                      }}>
                      View Resume
                    </a>
                  )}
                  {app.status === 'applied' && (
                    <button
                      onClick={() => handleWithdraw(app.id)}
                      style={{
                        padding: '6px 14px', background: '#fee2e2',
                        color: '#dc2626', border: 'none',
                        borderRadius: 6, cursor: 'pointer', fontSize: 13
                      }}>
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}