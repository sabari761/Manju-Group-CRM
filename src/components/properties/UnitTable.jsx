import React from 'react';
import { formatPrice } from '../../utils/formatters';
import EmptyState from '../common/EmptyState';

export default function UnitTable({ units: unitsProp, loading }) {
  const units = Array.isArray(unitsProp) ? unitsProp : [];
  if (loading) return null;

  if (units.length === 0) {
    return <EmptyState title="No units found for this building." />;
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover table-bordered align-middle mb-0" id="units-table">
        <thead>
          <tr>
            <th>Unit Number</th>
            <th>Type</th>
            <th>Price</th>
            <th>Availability</th>
          </tr>
        </thead>
        <tbody>
          {units.map((unit) => {
            const isAvailable = unit.status === 'available' || unit.availability === 'available' ||
              unit.status === 'Available' || unit.availability === 'Available';
            return (
              <tr key={unit.id}>
                <td className="fw-medium">{unit.unitNumber || unit.number}</td>
                <td>{unit.type || unit.unitType || '—'}</td>
                <td style={{ color: 'var(--clr-navy)', fontWeight: 600 }}>
                  {formatPrice(unit.price)}
                </td>
                <td>
                  {isAvailable ? (
                    <span className="badge-available">Available</span>
                  ) : (
                    <span className="badge-booked-unit">Booked</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
