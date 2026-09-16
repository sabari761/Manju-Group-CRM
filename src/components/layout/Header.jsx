import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header({ onToggleSidebar, desktopCollapsed }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userName = user?.name || user?.email || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="top-header">
      {/* Sidebar Toggle button (visible on all screen sizes) */}
      <button
        type="button"
        className="header-toggler"
        onClick={onToggleSidebar}
        title={desktopCollapsed ? 'Expand sidebar' : 'Toggle sidebar'}
        aria-label="Toggle sidebar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Right side user info + controls */}
      <div className="d-flex align-items-center gap-2 gap-sm-3 ms-auto">
        {/* Mobile user indicator */}
        <div
          className="d-flex d-sm-none align-items-center justify-content-center user-avatar-sm"
          title={`${userName} (${isAdmin ? 'Admin' : 'Sales Employee'})`}
        >
          {userInitial}
        </div>

        {/* Role badge (tablet/desktop) */}
        <span
          className="badge d-none d-sm-inline-block"
          style={{
            backgroundColor: isAdmin ? 'var(--clr-orange)' : '#e0f2fe',
            color: isAdmin ? '#fff' : '#0369a1',
            fontWeight: 600,
            fontSize: '0.72rem',
            padding: '5px 10px',
            borderRadius: '20px',
          }}
        >
          {isAdmin ? 'Admin' : 'Sales Employee'}
        </span>

        {/* User name (tablet/desktop) */}
        <span
          className="d-none d-sm-inline-block fw-semibold text-truncate"
          style={{ fontSize: '0.875rem', color: 'var(--clr-navy)', maxWidth: 160 }}
          title={userName}
        >
          {userName}
        </span>

        {/* Logout button */}
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
          onClick={handleLogout}
          aria-label="Logout"
          style={{ fontSize: '0.8rem', padding: '5px 12px', borderRadius: 6 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            className="d-none d-sm-inline"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
