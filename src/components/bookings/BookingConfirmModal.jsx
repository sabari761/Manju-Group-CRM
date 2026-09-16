import React from 'react';
import { formatPrice } from '../../utils/formatters';

export default function BookingConfirmModal({
  show,
  booking,
  onConfirm,
  onCancel,
  loading,
}) {
  if (!show || !booking) return null;

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onCancel} style={{ zIndex: 1040 }} />
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        style={{ zIndex: 1050 }}
        aria-modal="true"
        aria-labelledby="bookingConfirmTitle"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-semibold" id="bookingConfirmTitle"
                style={{ color: 'var(--clr-navy)' }}>
                Confirm Booking
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onCancel}
                aria-label="Close"
                disabled={loading}
              />
            </div>

            <div className="modal-body">
              <div className="row g-2 mb-3">
                <ConfirmRow label="Customer"  value={booking.customerName} />
                <ConfirmRow label="Project"   value={booking.projectName} />
                <ConfirmRow label="Building"  value={booking.buildingName} />
                <ConfirmRow label="Unit"      value={booking.unitNumber} />
                <ConfirmRow label="Type"      value={booking.unitType} />
                <ConfirmRow label="Price"     value={formatPrice(booking.unitPrice)} />
              </div>
              <div
                className="alert alert-warning py-2 mb-0"
                style={{ fontSize: '0.82rem', borderRadius: 6 }}
              >
                Are you sure you want to confirm this booking? This action will mark the unit as booked.
              </div>
            </div>

            <div className="modal-footer border-0 pt-0">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-booking-btn"
                className="btn btn-navy btn-sm"
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" />
                    Confirming...
                  </>
                ) : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ConfirmRow({ label, value }) {
  return (
    <div className="col-6">
      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--clr-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--clr-navy)' }}>{value || '—'}</div>
    </div>
  );
}
