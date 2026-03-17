// src/pages/Jobs.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchJobs } from '../api/jobsApi';

export default function Jobs() {
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '', location: '', job_type: '', experience: '', salary_min: ''
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async (f = filters) => {
    setLoading(true);
    try {
      const res = await fetchJobs(f);
      setJobs(res.data);
    } catch {
      console.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadJobs(filters);
  };

  const handleReset = () => {
    const empty = { search: '', location: '', job_type: '', experience: '', salary_min: '' };
    setFilters(empty);
    loadJobs(empty);
  };

  const inputStyle = {
    padding: '8px 10px', border: '1px solid #ddd',
    borderRadius: 6, fontSize: 14, width: '100%', boxSizing: 'border-box'
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '30px 20px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Find Jobs</h1>
        <p style={{ color: '#666', marginTop: 6 }}>
          {jobs.length} job{jobs.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Search & Filters */}
      <form onSubmit={handleSearch} style={{
        background: '#f8fafc', border: '1px solid #e2e8f0',
        borderRadius: 10, padding: 20, marginBottom: 28
      }}>
        {/* Search bar */}
        <div style={{ marginBottom: 14 }}>
          <input
            type="text" name="search" placeholder="Search by title, skill, keyword..."
            value={filters.search} onChange={handleFilterChange}
            style={{ ...inputStyle, fontSize: 15, padding: '10px 14px' }}
          />
        </div>

        {/* Filter row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
          <input
            type="text" name="location" placeholder="Location"
            value={filters.location} onChange={handleFilterChange}
            style={inputStyle}
          />
          <select name="job_type" value={filters.job_type}
            onChange={handleFilterChange} style={inputStyle}>
            <option value="">All Types</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="remote">Remote</option>
          </select>
          <select name="experience" value={filters.experience}
            onChange={handleFilterChange} style={inputStyle}>
            <option value="">All Levels</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
          </select>
          <input
            type="number" name="salary_min" placeholder="Min Salary"
            value={filters.salary_min} onChange={handleFilterChange}
            style={inputStyle}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" style={{
            padding: '9px 24px', background: '#2563eb',
            color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer'
          }}>
            Search
          </button>
          <button type="button" onClick={handleReset} style={{
            padding: '9px 24px', background: '#fff',
            color: '#374151', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer'
          }}>
            Reset
          </button>
        </div>
      </form>

      {/* Job Cards */}
      {loading ? (
        <p>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
          <p style={{ fontSize: 18 }}>No jobs found</p>
          <p>Try adjusting your search filters</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {jobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}

function JobCard({ job }) {
  const typeColors = {
    full_time: '#dcfce7', part_time: '#fef9c3',
    contract: '#fee2e2', internship: '#e0f2fe', remote: '#f3e8ff'
  };
  const typeTextColors = {
    full_time: '#166534', part_time: '#854d0e',
    contract: '#991b1b', internship: '#075985', remote: '#6b21a8'
  };

  return (
    <div style={{
      border: '1px solid #e2e8f0', borderRadius: 10,
      padding: 22, background: '#fff',
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: 17 }}>
            <Link to={`/jobs/${job.id}`} style={{ color: '#1d4ed8', textDecoration: 'none' }}>
              {job.title}
            </Link>
          </h3>
          <p style={{ margin: '0 0 10px', color: '#666', fontSize: 14 }}>
            {job.employer_name} · {job.location}
          </p>
        </div>
        <span style={{
          background: typeColors[job.job_type] || '#f3f4f6',
          color: typeTextColors[job.job_type] || '#374151',
          padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
          whiteSpace: 'nowrap'
        }}>
          {job.job_type?.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <p style={{ margin: '0 0 12px', color: '#555', fontSize: 14, lineHeight: 1.5 }}>
        {job.description.length > 150
          ? job.description.slice(0, 150) + '...'
          : job.description}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#888' }}>
          {job.salary_min && (
            <span>💰 ₹{Number(job.salary_min).toLocaleString()}
              {job.salary_max && ` – ₹${Number(job.salary_max).toLocaleString()}`}
            </span>
          )}
          <span>📊 {job.experience?.replace('_', ' ')}</span>
        </div>
        <Link to={`/jobs/${job.id}`} style={{
          padding: '6px 16px', background: '#2563eb',
          color: '#fff', borderRadius: 6, fontSize: 13,
          textDecoration: 'none'
        }}>
          View
        </Link>
      </div>
    </div>
  );
}