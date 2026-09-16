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

export default function Sidebar({ open, onClose }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const visibleItems = NAV_ITEMS.filter((item) =>
    isAdmin ? true : item.roles.includes('sales_employee')
  );

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`sidebar-backdrop${open ? ' active' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <nav className={`sidebar${open ? ' sidebar-open' : ''}`} aria-label="Main navigation">
        {/* Brand */}
        <div className="sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/crm-logo.png"
              alt="CRM Platform"
              style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, objectFit: 'contain' }}
            />
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.1 }}>
                CRM Platform
              </div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.68rem', fontWeight: 500, lineHeight: 1.2 }}>
                Real Estate Management
              </div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <div className="sidebar-nav">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={onClose}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Footer: user info + logout */}
        <div className="sidebar-footer">
          <div className="mb-2" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
            Signed in as
          </div>
          <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>
            {user?.name || user?.email || 'User'}
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
            className="btn btn-sm w-100 mt-3"
            onClick={handleLogout}
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(255,255,255,0.15)',
              fontSize: '0.8rem',
            }}
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </nav>
    </>
  );
}
