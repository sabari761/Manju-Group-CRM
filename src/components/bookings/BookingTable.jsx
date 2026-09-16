import React from 'react';
import { formatDate, formatPrice } from '../../utils/formatters';
import EmptyState from '../common/EmptyState';

function getCustomerName(b) {
  return b?.leadId?.name || b?.leadId?.customerName || b?.customerName || '—';
}
function getUnitNumber(b) {
  return b?.unitId?.unitNumber || b?.unitId?.number || b?.unitNumber || '—';
}
function getUnitType(b) {
  return b?.unitId?.type || b?.unitType || '—';
}
function getUnitPrice(b) {
  return b?.unitId?.price ?? b?.price ?? b?.unitPrice ?? 0;
}
function getBuildingName(b) {
  return b?.unitId?.buildingId?.name || b?.buildingName || '—';
}
function getProjectName(b) {
  return b?.unitId?.buildingId?.projectId?.name || b?.projectName || '—';
}

function getStatusBadge(status) {
  const s = String(status || 'CONFIRMED').toUpperCase();
  if (s === 'CANCELLED' || s === 'CANCELED') {
    return { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' };
  }
  if (s === 'PENDING') {
    return { bg: '#fef3c7', color: '#92400e', label: 'Pending' };
  }
  return { bg: '#d1fae5', color: '#065f46', label: 'Confirmed' };
}

export default function BookingTable({ bookings: bookingsProp, loading, page = 1, limit = 10, search = '' }) {
  const bookings = Array.isArray(bookingsProp) ? bookingsProp : [];
  if (loading) return null;

  if (bookings?.length === 0) {
    return (
      <EmptyState
        title="No bookings found."
        description={
          search
            ? 'Try adjusting your search term.'
            : 'No bookings have been made yet.'
        }
      />
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover table-bordered align-middle mb-0" id="bookings-table">
        <thead>
          <tr>
            <th style={{ width: 45 }}>#</th>
            <th>CUSTOMER</th>
            <th>PROJECT</th>
            <th>BUILDING</th>
            <th>UNIT</th>
            <th>TYPE</th>
            <th>PRICE</th>
            <th>BOOKING DATE</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {bookings?.map((b, idx) => {
            const id = b?._id || b?.id || idx;
            const statusInfo = getStatusBadge(b?.status);
            const customer = getCustomerName(b);

            return (
              <tr key={id}>
                <td style={{ color: 'var(--clr-muted)', fontSize: '0.82rem' }}>
                  {(page - 1) * limit + idx + 1}
                </td>
                <td className="fw-medium text-nowrap">{customer}</td>
                <td className="text-nowrap">{getProjectName(b)}</td>
                <td className="text-nowrap">{getBuildingName(b)}</td>
                <td className="text-nowrap">{getUnitNumber(b)}</td>
                <td className="text-nowrap">{getUnitType(b)}</td>
                <td style={{ color: 'var(--clr-navy)', fontWeight: 600 }} className="text-nowrap">
                  {formatPrice(getUnitPrice(b))}
                </td>
                <td className="text-nowrap">{formatDate(b?.bookingDate || b?.createdAt)}</td>
                <td>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: statusInfo.bg,
                      color: statusInfo.color,
                      fontSize: '0.72rem',
                      fontWeight: 600,
                    }}
                  >
                    {statusInfo.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
