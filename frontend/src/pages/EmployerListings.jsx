// src/pages/EmployerListings.jsx

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchMyJobs, deleteJob } from '../api/jobsApi';

export default function EmployerListings() {
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    try {
      const res = await fetchMyJobs();
      setJobs(res.data);
    } catch {
      console.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job posting?')) return;
    try {
      await deleteJob(id);
      setJobs(jobs.filter(j => j.id !== id));
    } catch {
      alert('Failed to delete job.');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '30px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>My Job Listings</h2>
        <Link to="/employer/post-job" style={{
          padding: '9px 20px', background: '#2563eb',
          color: '#fff', borderRadius: 6, textDecoration: 'none'
        }}>
          + Post New Job
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
          <p style={{ fontSize: 18 }}>No jobs posted yet</p>
          <Link to="/employer/post-job" style={{ color: '#2563eb' }}>
            Post your first job →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {jobs.map(job => (
            <div key={job.id} style={{
              border: '1px solid #e2e8f0', borderRadius: 10,
              padding: 20, background: '#fff',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: '0 0 4px' }}>{job.title}</h3>
                <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
                  {job.location} · {job.job_type?.replace('_', ' ')} ·{' '}
                  <span style={{ color: job.is_active ? '#16a34a' : '#dc2626' }}>
                    {job.is_active ? 'Active' : 'Inactive'}
                  </span>
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888' }}>
                  {job.application_count} application{job.application_count !== 1 ? 's' : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
  <Link to={`/jobs/${job.id}`} style={{
    padding: '6px 14px', border: '1px solid #ddd',
    borderRadius: 6, fontSize: 13, textDecoration: 'none', color: '#374151'
  }}>
    View
  </Link>
  <Link to={`/employer/applicants/${job.id}`} style={{
    padding: '6px 14px', background: '#eff6ff',
    color: '#1d4ed8', borderRadius: 6,
    textDecoration: 'none', fontSize: 13
  }}>
    Applicants ({job.application_count})
  </Link>
  <button onClick={() => handleDelete(job.id)} style={{
    padding: '6px 14px', background: '#fee2e2',
    color: '#dc2626', border: 'none', borderRadius: 6,
    cursor: 'pointer', fontSize: 13
  }}>
    Delete
  </button>
</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}