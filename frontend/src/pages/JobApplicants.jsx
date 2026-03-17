// src/pages/JobApplicants.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchJobApplications, updateApplicationStatus } from '../api/applicationsApi';

const STATUS_STYLES = {
  applied:     { bg: '#eff6ff', color: '#1d4ed8' },
  reviewing:   { bg: '#fef9c3', color: '#854d0e' },
  shortlisted: { bg: '#dcfce7', color: '#15803d' },
  rejected:    { bg: '#fee2e2', color: '#dc2626' },
  hired:       { bg: '#f3e8ff', color: '#7e22ce' },
};

export default function JobApplicants() {
  const { jobId }     = useParams();
  const [apps, setApps]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobApplications(jobId)
      .then(res => setApps(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      setApps(apps.map(a =>
        a.id === appId ? { ...a, status: newStatus } : a
      ));
    } catch {
      alert('Failed to update status.');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '30px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Link to="/employer/listings" style={{ color: '#2563eb', fontSize: 14 }}>
            Back to Listings
          </Link>
          <h2 style={{ margin: '8px 0 0' }}>Applicants</h2>
        </div>
        <span style={{ background: '#f1f5f9', padding: '6px 14px', borderRadius: 20, fontSize: 14 }}>
          {apps.length} applicant{apps.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <p>Loading applicants...</p>
      ) : apps.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
          <p style={{ fontSize: 18 }}>No applications yet</p>
          <p>Share your job listing to attract candidates</p>
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
                    <h3 style={{ margin: '0 0 2px' }}>{app.candidate_name}</h3>
                    <p style={{ margin: '0 0 8px', color: '#666', fontSize: 14 }}>
                      {app.candidate_email}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                      Applied {new Date(app.applied_at).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span style={{
                    background: s.bg, color: s.color,
                    padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500
                  }}>
                    {app.status}
                  </span>
                </div>

                {/* Cover letter */}
                {app.cover_letter && (
                  <div style={{
                    margin: '14px 0 0', background: '#f8fafc',
                    borderRadius: 6, padding: 12
                  }}>
                    <p style={{ margin: '0 0 4px', fontSize: 12, color: '#94a3b8' }}>
                      Cover Letter
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: '#555' }}>
                      {app.cover_letter}
                    </p>
                  </div>
                )}

                {/* Actions row */}
                <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>

                  {/* Resume download */}
                  {app.resume && (
<a href={app.resume.startsWith('http') ? app.resume : `http://localhost:8000${app.resume}`}                      target="_blank" rel="noreferrer"
                      style={{
                        padding: '7px 16px', background: '#eff6ff',
                        color: '#1d4ed8', borderRadius: 6,
                        textDecoration: 'none', fontSize: 13
                      }}>
                      Download Resume
                    </a>
                  )}

                  {/* Status change buttons */}
                  {[
                    { value: 'reviewing',   label: 'Mark Reviewing', bg: '#fef9c3', color: '#854d0e' },
                    { value: 'shortlisted', label: 'Shortlist',      bg: '#dcfce7', color: '#15803d' },
                    { value: 'rejected',    label: 'Reject',         bg: '#fee2e2', color: '#dc2626' },
                    { value: 'hired',       label: 'Hire',           bg: '#f3e8ff', color: '#7e22ce' },
                  ].map(btn => (
                    app.status !== btn.value && (
                      <button key={btn.value}
                        onClick={() => handleStatusChange(app.id, btn.value)}
                        style={{
                          padding: '7px 14px', background: btn.bg,
                          color: btn.color, border: 'none',
                          borderRadius: 6, cursor: 'pointer', fontSize: 13
                        }}>
                        {btn.label}
                      </button>
                    )
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}