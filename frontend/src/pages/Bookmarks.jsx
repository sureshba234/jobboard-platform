// src/pages/Bookmarks.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchBookmarks, toggleBookmark } from '../api/jobsApi';

export default function Bookmarks() {
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks()
      .then(res => setJobs(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (jobId) => {
    await toggleBookmark(jobId);
    setJobs(jobs.filter(j => j.id !== jobId));
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '30px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Saved Jobs</h2>
        <Link to="/jobs" style={{
          padding: '8px 18px', background: '#2563eb',
          color: '#fff', borderRadius: 6, textDecoration: 'none'
        }}>Browse More</Link>
      </div>

      {loading ? <p>Loading...</p> : jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
          <p style={{ fontSize: 18 }}>No saved jobs yet</p>
          <Link to="/jobs" style={{ color: '#2563eb' }}>Browse jobs to save them</Link>
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
                <h3 style={{ margin: '0 0 4px' }}>
                  <Link to={`/jobs/${job.id}`} style={{ color: '#1d4ed8', textDecoration: 'none' }}>
                    {job.title}
                  </Link>
                </h3>
                <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
                  {job.employer_name} - {job.location}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to={`/apply/${job.id}`} style={{
                  padding: '7px 16px', background: '#2563eb',
                  color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: 13
                }}>Apply</Link>
                <button onClick={() => handleRemove(job.id)} style={{
                  padding: '7px 14px', background: '#fee2e2',
                  color: '#dc2626', border: 'none', borderRadius: 6,
                  cursor: 'pointer', fontSize: 13
                }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}