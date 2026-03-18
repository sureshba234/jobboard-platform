// src/pages/JobDetail.jsx

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchJob, toggleBookmark } from '../api/jobsApi';
import { useAuth } from '../context/AuthContext';

export default function JobDetail() {
  const { id }        = useParams();
  const { user }      = useAuth();
  const navigate      = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    fetchJob(id)
      .then(res => setJob(res.data))
      .catch(() => navigate('/jobs'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBookmark = async () => {
    try {
      const res = await toggleBookmark(job.id);
      setBookmarked(res.data.bookmarked);
    } catch {
      alert('Login as candidate to save jobs.');
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>;
  if (!job)    return <p style={{ padding: 40 }}>Job not found.</p>;

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '30px 20px' }}>
      <Link to="/jobs" style={{ color: '#2563eb', fontSize: 14 }}>
        Back to Jobs
      </Link>

      <div style={{
        background: '#fff', border: '1px solid #e2e8f0',
        borderRadius: 12, padding: 32, marginTop: 16
      }}>
        {/* Title row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', marginBottom: 20
        }}>
          <div>
            <h1 style={{ margin: '0 0 6px', fontSize: 24 }}>{job.title}</h1>
            <p style={{ margin: '0 0 10px', color: '#666', fontSize: 14 }}>
  <Link to={`/company/${job.employer_id}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
    {job.employer_name}
  </Link>
  {' '}- {job.location}
</p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {user?.role === 'candidate' && (
              <button onClick={handleBookmark} style={{
                padding: '10px 18px',
                background: bookmarked ? '#fef9c3' : '#f1f5f9',
                color: bookmarked ? '#854d0e' : '#374151',
                border: '1px solid #ddd', borderRadius: 8,
                cursor: 'pointer', fontSize: 14
              }}>
                {bookmarked ? 'Saved' : 'Save Job'}
              </button>
            )}
            {user?.role === 'candidate' && (
              <Link to={`/apply/${job.id}`} style={{
                padding: '10px 24px', background: '#2563eb',
                color: '#fff', borderRadius: 8,
                textDecoration: 'none', fontWeight: 500
              }}>
                Apply Now
              </Link>
            )}
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            job.job_type?.replace('_', ' '),
            job.experience,
            job.salary_min
              ? `Rs.${Number(job.salary_min).toLocaleString()} - Rs.${Number(job.salary_max).toLocaleString()}`
              : null
          ].filter(Boolean).map((tag, i) => (
            <span key={i} style={{
              background: '#f1f5f9', color: '#475569',
              padding: '5px 14px', borderRadius: 20, fontSize: 13
            }}>
              {tag}
            </span>
          ))}

          {/* Deadline tag */}
          {job.deadline && (
            <span style={{
              background: job.is_expired ? '#fee2e2' : '#dcfce7',
              color: job.is_expired ? '#dc2626' : '#15803d',
              padding: '5px 14px', borderRadius: 20, fontSize: 13
            }}>
              {job.is_expired
                ? `Expired - ${new Date(job.deadline).toLocaleDateString('en-IN')}`
                : `Deadline: ${new Date(job.deadline).toLocaleDateString('en-IN')}`
              }
            </span>
          )}
        </div>

        {/* Description */}
        <h3 style={{ marginBottom: 10 }}>Job Description</h3>
        <p style={{ color: '#555', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
          {job.description}
        </p>

        {/* Skills */}
        {job.skills && (
          <>
            <h3 style={{ marginTop: 24, marginBottom: 10 }}>Required Skills</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {job.skills.split(',').map(s => s.trim()).filter(Boolean).map((skill, i) => (
                <span key={i} style={{
                  background: '#dbeafe', color: '#1e40af',
                  padding: '4px 12px', borderRadius: 20, fontSize: 13
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </>
        )}

        {/* Apply button at bottom */}
        {user?.role === 'candidate' && (
          <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
            <Link to={`/apply/${job.id}`} style={{
              padding: '12px 32px', background: '#2563eb',
              color: '#fff', borderRadius: 8,
              textDecoration: 'none', fontWeight: 500, fontSize: 15
            }}>
              Apply for this Job
            </Link>
            <button onClick={handleBookmark} style={{
              padding: '12px 24px',
              background: bookmarked ? '#fef9c3' : '#f1f5f9',
              color: bookmarked ? '#854d0e' : '#374151',
              border: '1px solid #ddd', borderRadius: 8,
              cursor: 'pointer', fontSize: 15
            }}>
              {bookmarked ? 'Job Saved' : 'Save for Later'}
            </button>
          </div>
        )}

        {!user && (
          <p style={{ marginTop: 24, color: '#666' }}>
            <Link to="/login">Login</Link> to apply for this job.
          </p>
        )}
      </div>
    </div>
  );
}