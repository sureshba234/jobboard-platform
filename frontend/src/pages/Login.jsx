import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,  setForm]  = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'employer')  navigate('/employer/dashboard');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your credentials.');
    }
  };

  const inputStyle = {
    display: 'block', width: '100%',
    padding: 9, marginTop: 4, boxSizing: 'border-box',
    border: '1px solid #ccc', borderRadius: 6
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '0 20px' }}>
      <h2>Sign In</h2>
      {error && (
        <p style={{ color: 'red', background: '#fff0f0', padding: 10, borderRadius: 6 }}>
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 14 }}>
          <label>Email</label>
          <input type="email" name="email"
            value={form.email} onChange={handleChange}
            required style={inputStyle} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label>Password</label>
          <input type="password" name="password"
            value={form.password} onChange={handleChange}
            required style={inputStyle} />
        </div>
        <button type="submit" style={{
          width: '100%', padding: 10,
          background: '#2563eb', color: '#fff',
          border: 'none', borderRadius: 6,
          cursor: 'pointer', fontSize: 15
        }}>
          Login
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        No account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}