import React from 'react';

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  id = 'search',
  style,
}) {
  return (
    <div className="input-group w-100" style={{ maxWidth: 360, ...style }}>
      <span
        className="input-group-text bg-white border-end-0"
        style={{ borderColor: 'var(--clr-border)' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          fill="none"
          viewBox="0 0 24 24"
          stroke="var(--clr-muted)"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"
          />
        </svg>
      </span>
      <input
        id={id}
        type="text"
        className="form-control border-start-0"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ borderColor: 'var(--clr-border)' }}
        aria-label={placeholder}
      />
    </div>
  );
}
