// src/pages/PostJob.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../api/jobsApi';

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', location: '',
    job_type: 'full_time', experience: 'entry',
    salary_min: '', salary_max: '', skills: '', is_active: true, deadline: ''
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createJob(form);
      navigate('/employer/listings');
    } catch (err) {
      const data = err.response?.data;
      const msg  = typeof data === 'object'
        ? Object.values(data).flat().join(' ')
        : 'Failed to post job.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    display: 'block', width: '100%', padding: '9px 12px',
    marginTop: 4, boxSizing: 'border-box',
    border: '1px solid #ddd', borderRadius: 6, fontSize: 14
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '30px 20px' }}>
      <h2>Post a New Job</h2>

      {error && (
        <p style={{ color: 'red', background: '#fff0f0', padding: 10, borderRadius: 6 }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{
        background: '#fff', border: '1px solid #e2e8f0',
        borderRadius: 12, padding: 28
      }}>
        <div style={{ marginBottom: 16 }}>
          <label>Job Title *</label>
          <input type="text" name="title" value={form.title}
            onChange={handleChange} required style={inputStyle}
            placeholder="e.g. Senior React Developer" />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Description *</label>
          <textarea name="description" value={form.description}
            onChange={handleChange} required rows={6}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Describe the role, responsibilities, requirements..." />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label>Location *</label>
            <input type="text" name="location" value={form.location}
              onChange={handleChange} required style={inputStyle}
              placeholder="e.g. Hyderabad / Remote" />
          </div>
          <div>
            <label>Job Type *</label>
            <select name="job_type" value={form.job_type}
              onChange={handleChange} style={inputStyle}>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label>Experience Level</label>
            <select name="experience" value={form.experience}
              onChange={handleChange} style={inputStyle}>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
            </select>
          </div>
          <div>
            <label>Min Salary (₹)</label>
            <input type="number" name="salary_min" value={form.salary_min}
              onChange={handleChange} style={inputStyle}
              placeholder="e.g. 500000" />
          </div>
          <div>
            <label>Max Salary (₹)</label>
            <input type="number" name="salary_max" value={form.salary_max}
              onChange={handleChange} style={inputStyle}
              placeholder="e.g. 1000000" />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Required Skills</label>
          <input type="text" name="skills" value={form.skills}
            onChange={handleChange} style={inputStyle}
            placeholder="e.g. React, Python, PostgreSQL (comma separated)" />
        </div>
        <div style={{ marginBottom: 16 }}>
  <label>Application Deadline</label>
  <input
    type="date" name="deadline"
    value={form.deadline || ''}
    onChange={handleChange}
    min={new Date().toISOString().split('T')[0]}
    style={inputStyle}
  />
  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>
    Leave empty for no deadline
  </p>
</div>

        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" name="is_active" id="is_active"
            checked={form.is_active} onChange={handleChange} />
          <label htmlFor="is_active">Publish immediately</label>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" disabled={loading} style={{
            padding: '10px 28px', background: '#2563eb',
            color: '#fff', border: 'none', borderRadius: 6,
            cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15
          }}>
            {loading ? 'Posting...' : 'Post Job'}
          </button>
          <button type="button" onClick={() => navigate('/employer/listings')} style={{
            padding: '10px 20px', background: '#fff',
            color: '#374151', border: '1px solid #ddd',
            borderRadius: 6, cursor: 'pointer', fontSize: 15
          }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}