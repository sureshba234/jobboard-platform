// src/pages/CompanyProfile.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosInstance';

export default function CompanyProfile() {
  const { id } = useParams();
  const [company, setCompany]   = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get(`/auth/company/${id}/`)
      .then(res => setCompany(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>;
  if (!company) return <p style={{ padding: 40 }}>Company not found.</p>;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '30px 20px' }}>

      {/* Company header */}
      <div style={{
        background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
        borderRadius: 12, padding: '36px 32px', marginBottom: 28, color: '#fff'
      }}>
        <div style={{
          width: 64, height: 64, background: 'rgba(255,255,255,0.2)',
          borderRadius: 12, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 28, marginBottom: 16
        }}>
          🏢
        </div>
        <h1 style={{ margin: '0 0 8px', fontSize: 28 }}>{company.company_name}</h1>
        <p style={{ margin: '0 0 16px', opacity: 0.85 }}>{company.email}</p>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 18px' }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{company.job_count}</p>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>Open Positions</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 18px' }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
              {new Date(company.member_since).getFullYear()}
            </p>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>Member Since</p>
          </div>
        </div>
      </div>

      {/* Open positions */}
      <h2 style={{ marginBottom: 16 }}>Open Positions</h2>
      {company.jobs.length === 0 ? (
        <p style={{ color: '#999' }}>No open positions currently.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {company.jobs.map(job => (
            <div key={job.id} style={{
              border: '1px solid #e2e8f0', borderRadius: 10,
              padding: 20, background: '#fff',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: '0 0 4px' }}>{job.title}</h3>
                <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
                  {job.location} - {job.job_type?.replace('_', ' ')}
                  {job.salary_min && ` - Rs.${Number(job.salary_min).toLocaleString()}`}
                </p>
              </div>
              <Link to={`/jobs/${job.id}`} style={{
                padding: '7px 18px', background: '#2563eb',
                color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: 13
              }}>View</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}