import React from 'react';

export default function EmptyState({ title = 'No data found.', description, action }) {
  return (
    <div className="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12h6m-3-3v6M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
      </svg>
      <p className="fw-semibold mb-1" style={{ color: 'var(--clr-navy)', fontSize: '1rem' }}>{title}</p>
      {description && <p className="mb-3">{description}</p>}
      {action}
    </div>
  );
}
