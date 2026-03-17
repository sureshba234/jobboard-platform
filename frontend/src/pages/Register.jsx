import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosInstance';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', full_name: '', role: 'candidate',
    company_name: '', password: '', password2: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register/', form);
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      const msg  = typeof data === 'object'
        ? Object.values(data).flat().join(' ')
        : 'Registration failed.';
      setError(msg);
    }
  };

  const inputStyle = {
    display: 'block', width: '100%',
    padding: 9, marginTop: 4, boxSizing: 'border-box',
    border: '1px solid #ccc', borderRadius: 6
  };

  return (
    <div style={{ maxWidth: 440, margin: '60px auto', padding: '0 20px' }}>
      <h2>Create Account</h2>
      {error && (
        <p style={{ color: 'red', background: '#fff0f0', padding: 10, borderRadius: 6 }}>
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Full Name</label>
          <input type="text" name="full_name"
            value={form.full_name} onChange={handleChange}
            required style={inputStyle} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input type="email" name="email"
            value={form.email} onChange={handleChange}
            required style={inputStyle} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>I am a...</label>
          <select name="role" value={form.role}
            onChange={handleChange} style={inputStyle}>
            <option value="candidate">Candidate (looking for jobs)</option>
            <option value="employer">Employer (hiring)</option>
          </select>
        </div>
        {form.role === 'employer' && (
          <div style={{ marginBottom: 12 }}>
            <label>Company Name</label>
            <input type="text" name="company_name"
              value={form.company_name} onChange={handleChange}
              required style={inputStyle} />
          </div>
        )}
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input type="password" name="password"
            value={form.password} onChange={handleChange}
            required style={inputStyle} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label>Confirm Password</label>
          <input type="password" name="password2"
            value={form.password2} onChange={handleChange}
            required style={inputStyle} />
        </div>
        <button type="submit" style={{
          width: '100%', padding: 10,
          background: '#2563eb', color: '#fff',
          border: 'none', borderRadius: 6,
          cursor: 'pointer', fontSize: 15
        }}>
          Create Account
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}