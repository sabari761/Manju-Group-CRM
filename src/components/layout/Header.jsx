import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header({ onToggleSidebar }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="top-header">
      {/* Hamburger for mobile */}
      <button
        className="header-toggler"
        onClick={onToggleSidebar}
        aria-label="Toggle navigation"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Right side */}
      <div className="d-flex align-items-center gap-3 ms-auto">
        {/* Role badge */}
        <span
          className="badge d-none d-sm-inline-block"
          style={{
            backgroundColor: isAdmin ? 'var(--clr-orange)' : '#e0f2fe',
            color: isAdmin ? '#fff' : '#0369a1',
            fontWeight: 600,
            fontSize: '0.72rem',
          }}
        >
          {isAdmin ? 'Admin' : 'Sales Employee'}
        </span>

        {/* User name */}
        <span
          className="d-none d-sm-inline-block fw-semibold"
          style={{ fontSize: '0.875rem', color: 'var(--clr-navy)' }}
        >
          {user?.name || user?.email || 'User'}
        </span>

        {/* Logout button */}
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={handleLogout}
          aria-label="Logout"
          style={{ fontSize: '0.8rem' }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
