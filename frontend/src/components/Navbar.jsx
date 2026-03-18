// src/components/Navbar.jsx

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper — highlights active link
  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    textDecoration: 'none',
    color: isActive(path) ? '#2563eb' : '#374151',
    fontWeight: isActive(path) ? 600 : 400,
    fontSize: 14,
    padding: '4px 2px',
    borderBottom: isActive(path) ? '2px solid #2563eb' : '2px solid transparent',
  });

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #e2e8f0',
      padding: '0 24px',
      height: 58,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>

      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none' }}>
        <span style={{ fontWeight: 700, fontSize: 20, color: '#1d4ed8' }}>
          Job
        </span>
        <span style={{ fontWeight: 700, fontSize: 20, color: '#374151' }}>
          Board
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link to="/jobs" style={linkStyle('/jobs')}>
          Browse Jobs
        </Link>

        {/* Candidate links */}
        {user?.role === 'candidate' && (
          <>
            <Link to="/dashboard" style={linkStyle('/dashboard')}>
              Dashboard
            </Link>
            <Link to="/my-applications" style={linkStyle('/my-applications')}>
              My Applications
            </Link>
                <Link to="/bookmarks"        style={linkStyle('/bookmarks')}>Saved Jobs</Link>

          </>
        )}

        {/* Employer links */}
        {user?.role === 'employer' && (
          <>
            <Link to="/employer/dashboard" style={linkStyle('/employer/dashboard')}>
              Dashboard
            </Link>
            <Link to="/employer/listings" style={linkStyle('/employer/listings')}>
              My Jobs
            </Link>
            <Link to="/employer/post-job" style={linkStyle('/employer/post-job')}>
              Post a Job
            </Link>
          </>
        )}
      </div>

      {/* Right side — auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user ? (
          <>
            {/* User info pill */}
            <div style={{
              background: '#f1f5f9', borderRadius: 20,
              padding: '6px 14px', fontSize: 13, color: '#475569'
            }}>
              {user.role === 'employer' ? user.company_name : user.full_name}
              <span style={{
                marginLeft: 8, background: '#dbeafe',
                color: '#1d4ed8', borderRadius: 10,
                padding: '1px 8px', fontSize: 11
              }}>
                {user.role}
              </span>
            </div>

            <button onClick={handleLogout} style={{
              padding: '7px 16px',
              background: '#fff', color: '#ef4444',
              border: '1px solid #fca5a5', borderRadius: 6,
              cursor: 'pointer', fontSize: 13
            }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{
              padding: '7px 16px', color: '#374151',
              border: '1px solid #ddd', borderRadius: 6,
              textDecoration: 'none', fontSize: 13
            }}>
              Login
            </Link>
            <Link to="/register" style={{
              padding: '7px 16px', background: '#2563eb',
              color: '#fff', border: 'none', borderRadius: 6,
              textDecoration: 'none', fontSize: 13
            }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}