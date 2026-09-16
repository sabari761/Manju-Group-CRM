import React from 'react';

export default function BuildingList({ buildings: buildingsProp, selectedId, onSelect }) {
  const buildings = Array.isArray(buildingsProp) ? buildingsProp : [];
  if (buildings.length === 0) {
    return (
      <p style={{ color: 'var(--clr-muted)', fontSize: '0.875rem' }}>No buildings found.</p>
    );
  }

  return (
    <div className="d-flex flex-wrap gap-2">
      {buildings.map((b) => {
        const isSelected = b.id === selectedId;
        return (
          <button
            key={b.id}
            className="btn btn-sm"
            id={`building-tab-${b.id}`}
            onClick={() => onSelect(b)}
            aria-pressed={isSelected}
            style={{
              backgroundColor: isSelected ? 'var(--clr-navy)' : 'var(--clr-white)',
              color: isSelected ? '#fff' : 'var(--clr-navy)',
              border: `1px solid ${isSelected ? 'var(--clr-navy)' : 'var(--clr-border)'}`,
              fontWeight: 500,
              fontSize: '0.82rem',
            }}
          >
            {b.name}
          </button>
        );
      })}
    </div>
  );
}
