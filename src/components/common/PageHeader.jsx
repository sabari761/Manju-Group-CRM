import React from 'react';

export default function PageHeader({ title, children }) {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      <div className="d-flex align-items-center gap-2 flex-wrap">{children}</div>
    </div>
  );
}
