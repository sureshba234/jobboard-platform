// src/pages/Apply.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchJob } from '../api/jobsApi';
import { applyToJob } from '../api/applicationsApi';

export default function Apply() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [job, setJob]               = useState(null);
  const [resume, setResume]         = useState(null);
  const [coverLetter, setCover]     = useState('');
  const [error,    setError]        = useState('');
  const [loading,  setLoading]      = useState(false);
  const [jobLoading, setJobLoading] = useState(true);
  const [dragOver, setDragOver]     = useState(false);

  useEffect(() => {
    fetchJob(id)
      .then(res => setJob(res.data))
      .catch(() => navigate('/jobs'))
      .finally(() => setJobLoading(false));
  }, [id]);

  const validateFile = (file) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowed.includes(file.type)) {
      setError('Only PDF and Word documents (.pdf, .doc, .docx) are allowed.');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (validateFile(file)) {
      setError('');
      setResume(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (validateFile(file)) {
      setError('');
      setResume(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resume) { setError('Please upload your resume.'); return; }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('job',          id);
    formData.append('resume',       resume);
    formData.append('cover_letter', coverLetter);

    try {
      await applyToJob(formData);
      navigate('/my-applications', {
        state: { success: 'Application submitted successfully!' }
      });
    } catch (err) {
      const data = err.response?.data;
      const msg  = data?.error ||
        (typeof data === 'object'
          ? Object.values(data).flat().join(' ')
          : 'Application failed.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (jobLoading) return <p style={{ padding: 40 }}>Loading...</p>;

  const getFileIcon = (file) => {
    if (!file) return null;
    if (file.type === 'application/pdf') return '📄';
    return '📝';
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '30px 20px' }}>
      <Link to={`/jobs/${id}`} style={{ color: '#2563eb', fontSize: 14 }}>
        Back to Job
      </Link>

      {/* Job summary card */}
      {job && (
        <div style={{
          background: '#eff6ff', border: '1px solid #bfdbfe',
          borderRadius: 10, padding: 20, margin: '16px 0 24px'
        }}>
          <h3 style={{ margin: '0 0 4px' }}>{job.title}</h3>
          <p style={{ margin: '0 0 8px', color: '#555', fontSize: 14 }}>
            {job.employer_name} - {job.location}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{
              background: '#dbeafe', color: '#1d4ed8',
              padding: '2px 10px', borderRadius: 10, fontSize: 12
            }}>
              {job.job_type?.replace('_', ' ')}
            </span>
            <span style={{
              background: '#dbeafe', color: '#1d4ed8',
              padding: '2px 10px', borderRadius: 10, fontSize: 12
            }}>
              {job.experience}
            </span>
          </div>
        </div>
      )}

      <h2 style={{ marginBottom: 20 }}>Submit Your Application</h2>

      {error && (
        <div style={{
          color: '#dc2626', background: '#fee2e2', border: '1px solid #fca5a5',
          padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{
        background: '#fff', border: '1px solid #e2e8f0',
        borderRadius: 12, padding: 28
      }}>

        {/* Drag and drop upload area */}
        <div style={{ marginBottom: 22 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Resume / CV *
          </label>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragOver ? '#2563eb' : resume ? '#86efac' : '#cbd5e1'}`,
              borderRadius: 10, padding: 32, textAlign: 'center',
              background: dragOver ? '#eff6ff' : resume ? '#f0fdf4' : '#f8fafc',
              transition: 'all 0.2s', cursor: 'pointer'
            }}
            onClick={() => document.getElementById('resume-input').click()}
          >
            <input
              type="file" id="resume-input"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {resume ? (
              <div>
                <div style={{ fontSize: 36, marginBottom: 8 }}>
                  {getFileIcon(resume)}
                </div>
                <p style={{ margin: '0 0 4px', fontWeight: 500, color: '#15803d' }}>
                  {resume.name}
                </p>
                <p style={{ margin: '0 0 12px', fontSize: 12, color: '#666' }}>
                  {(resume.size / 1024).toFixed(1)} KB
                </p>
                <span style={{
                  background: '#dcfce7', color: '#15803d',
                  padding: '3px 12px', borderRadius: 10, fontSize: 12
                }}>
                  Ready to upload - click to change
                </span>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📎</div>
                <p style={{ margin: '0 0 4px', fontWeight: 500, color: '#475569' }}>
                  Drag and drop your resume here
                </p>
                <p style={{ margin: '0 0 12px', fontSize: 13, color: '#94a3b8' }}>
                  or click to browse files
                </p>
                <span style={{
                  background: '#f1f5f9', color: '#64748b',
                  padding: '3px 12px', borderRadius: 10, fontSize: 12
                }}>
                  PDF, DOC or DOCX - max 5MB
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Cover letter */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Cover Letter{' '}
            <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: 13 }}>
              (optional)
            </span>
          </label>
          <textarea
            value={coverLetter}
            onChange={e => setCover(e.target.value)}
            rows={6}
            placeholder="Tell the employer why you are the perfect fit for this role..."
            style={{
              width: '100%', padding: '10px 12px', boxSizing: 'border-box',
              border: '1px solid #ddd', borderRadius: 8,
              fontSize: 14, resize: 'vertical', lineHeight: 1.6,
              fontFamily: 'inherit'
            }}
          />
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>
            {coverLetter.length} characters
          </p>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button type="submit" disabled={loading} style={{
            padding: '11px 32px',
            background: loading ? '#93c5fd' : '#2563eb',
            color: '#fff', border: 'none', borderRadius: 8,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 15, fontWeight: 500
          }}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
          <Link to={`/jobs/${id}`} style={{
            padding: '11px 20px', background: '#fff',
            color: '#374151', border: '1px solid #ddd',
            borderRadius: 8, textDecoration: 'none', fontSize: 14
          }}>
            Cancel
          </Link>
        </div>

      </form>
    </div>
  );
}