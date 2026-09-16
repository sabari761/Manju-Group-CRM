import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    roles: ['admin', 'sales_employee'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M13 5v14m-4-7H5m14 0h-4" />
      </svg>
    ),
  },
  {
    to: '/leads',
    label: 'Leads',
    roles: ['admin', 'sales_employee'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    to: '/properties',
    label: 'Properties',
    roles: ['admin', 'sales_employee'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    to: '/bookings',
    label: 'Bookings',
    roles: ['admin', 'sales_employee'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    to: '/employees',
    label: 'Employees',
    roles: ['admin'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function Sidebar({ open, collapsed, onClose, onToggleDesktop }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const visibleItems = NAV_ITEMS.filter((item) =>
    isAdmin ? true : item.roles.includes('sales_employee')
  );

  const userName = user?.name || user?.email || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  // On mobile or when drawer is open, always display full sidebar content
  const isMini = collapsed && !open;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`sidebar-backdrop${open ? ' active' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`sidebar${open ? ' sidebar-open' : ''}${isMini ? ' sidebar-collapsed' : ''}`}
        aria-label="Main navigation"
      >
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-inner">
            <img
              src="/crm-logo.png"
              alt="CRM Platform"
              className="sidebar-brand-img"
            />
            {!isMini && (
              <div className="sidebar-brand-text">
                <div className="sidebar-brand-title">CRM Platform</div>
                <div className="sidebar-brand-subtitle">Real Estate Management</div>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle button */}
          <button
            type="button"
            className="sidebar-collapse-btn d-none d-lg-flex"
            onClick={onToggleDesktop}
            title={isMini ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isMini ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
              style={{
                transform: isMini ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.25s ease',
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Mobile close button */}
          <button
            type="button"
            className="sidebar-close-btn d-lg-none"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="sidebar-nav">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={onClose}
              title={isMini ? item.label : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {!isMini ? (
            <div className="sidebar-footer-expanded">
              <div className="user-label">Signed in as</div>
              <div className="user-name text-truncate" title={userName}>
                {userName}
              </div>
              <div
                className="badge mt-1"
                style={{
                  backgroundColor: isAdmin ? 'var(--clr-orange)' : 'rgba(0,174,239,0.25)',
                  color: isAdmin ? '#fff' : 'var(--clr-cyan)',
                  fontSize: '0.7rem',
                }}
              >
                {isAdmin ? 'Admin' : 'Sales Employee'}
              </div>
              <button
                className="btn btn-sm w-100 mt-3 logout-btn"
                onClick={handleLogout}
                aria-label="Logout"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="sidebar-footer-collapsed">
              <div
                className="user-avatar"
                title={`${userName} (${isAdmin ? 'Admin' : 'Sales Employee'})`}
              >
                {userInitial}
              </div>
              <button
                className="btn-icon-logout mt-2"
                onClick={handleLogout}
                title="Logout"
                aria-label="Logout"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
