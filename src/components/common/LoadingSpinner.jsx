import React from 'react';

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div
        className="spinner-border"
        role="status"
        style={{ width: '2.5rem', height: '2.5rem', color: 'var(--clr-navy)' }}
      >
        <span className="visually-hidden">{text}</span>
      </div>
      <p className="mt-3 mb-0" style={{ color: 'var(--clr-muted)', fontSize: '0.875rem' }}>
        {text}
      </p>
    </div>
  );
}
