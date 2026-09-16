import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getLeadById, updateLead } from '../../services/leadService';
import { getEmployees } from '../../services/employeeService';
import { formatDate, toInputDate } from '../../utils/formatters';
import LeadStageBadge from '../../components/leads/LeadStageBadge';
import LeadNotes from '../../components/leads/LeadNotes';
import LeadForm from '../../components/leads/LeadForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead]           = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [showEdit, setShowEdit]   = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const fetchLead = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [leadRes, empRes] = await Promise.all([
        getLeadById(id),
        getEmployees(),
      ]);
      setLead(leadRes.data?.lead || leadRes.data?.data || leadRes.data);
      const empRaw = empRes.data?.data ?? empRes.data?.employees ?? empRes.data;
      setEmployees(Array.isArray(empRaw) ? empRaw : []);
    } catch {
      setError('Unable to load lead details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchLead(); }, [fetchLead]);

  const handleEditSubmit = async (data) => {
    setEditLoading(true);
    try {
      await updateLead(id, data);
      toast.success('Lead updated successfully.');
      setShowEdit(false);
      fetchLead();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update lead.');
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading lead details..." />;
  if (error)   return <ErrorState message={error} onRetry={fetchLead} />;
  if (!lead)   return <ErrorState message="Lead not found." />;

  return (
    <div>
      {/* Back button + header */}
      <div className="mb-3">
        <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <span style={{ color: 'var(--clr-muted)', fontSize: '0.8rem' }}>
          Leads / {lead?.name || lead?.customerName || 'Details'}
        </span>
      </div>

      <div className="row g-3">
        {/* Left: Lead Info */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 8 }}>
            <div className="card-header bg-white py-3 px-4 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold" style={{ color: 'var(--clr-navy)' }}>Lead Details</h5>
              <button
                className="btn btn-sm btn-outline-primary"
                style={{ borderColor: 'var(--clr-blue)', color: 'var(--clr-blue)', fontSize: '0.8rem' }}
                onClick={() => setShowEdit(true)}
                id="edit-lead-btn"
              >
                Edit Lead
              </button>
            </div>
            <div className="card-body px-4 py-3">
              <div className="row g-2">
                <InfoRow label="Customer Name" value={lead?.name || lead?.customerName || '—'} />
                <InfoRow label="Phone"         value={lead?.phone || '—'} />
                <InfoRow label="Email"         value={lead?.email || '—'} />
                <div className="col-sm-4">
                  <div style={{ fontSize: '0.75rem', color: 'var(--clr-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Stage
                  </div>
                  <div className="mt-1">
                    <LeadStageBadge stage={lead?.stage} />
                  </div>
                </div>
                <InfoRow
                  label="Assigned Employee"
                  value={
                    lead?.assignedTo?.name ||
                    lead?.assignedEmployee ||
                    lead?.assignedEmployeeName ||
                    (typeof lead?.assignedTo === 'string' ? lead?.assignedTo : '—')
                  }
                />
                <InfoRow label="Follow-up Date" value={formatDate(lead?.followUpDate)} />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card border-0 shadow-sm" style={{ borderRadius: 8 }}>
            <div className="card-header bg-white py-3 px-4 border-bottom">
              <h6 className="mb-0 fw-semibold" style={{ color: 'var(--clr-navy)' }}>Notes</h6>
            </div>
            <div className="card-body px-4 py-3">
              <LeadNotes
                leadId={id}
                notes={lead?.notes || []}
                onNoteAdded={fetchLead}
              />
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 8 }}>
            <div className="card-header bg-white py-3 px-4 border-bottom">
              <h6 className="mb-0 fw-semibold" style={{ color: 'var(--clr-navy)' }}>Actions</h6>
            </div>
            <div className="card-body px-4 py-3 d-flex flex-column gap-2">
              <button
                className="btn btn-navy w-100"
                onClick={() => setShowEdit(true)}
                id="edit-lead-action-btn"
              >
                Edit Lead
              </button>
              <Link
                to={`/bookings?leadId=${lead._id || lead.id}&leadName=${encodeURIComponent(lead.name || lead.customerName)}`}
                className="btn btn-orange w-100"
                id="book-property-btn"
              >
                Book Property
              </Link>
              <Link
                to="/leads"
                className="btn btn-outline-secondary w-100"
              >
                Back to Leads
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowEdit(false)} style={{ zIndex: 1040 }} />
          <div className="modal fade show d-block" tabIndex="-1" role="dialog"
            style={{ zIndex: 1050 }} aria-modal="true" aria-labelledby="editLeadTitle">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-semibold" id="editLeadTitle"
                    style={{ color: 'var(--clr-navy)' }}>
                    Edit Lead
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowEdit(false)} aria-label="Close" />
                </div>
                <div className="modal-body pt-2">
                  <LeadForm
                    defaultValues={{
                      ...lead,
                      name: lead.name || lead.customerName,
                      followUpDate: toInputDate(lead.followUpDate),
                      // Extract _id if assignedTo is a populated object
                      assignedTo:
                        lead.assignedTo?._id ||
                        (typeof lead.assignedTo === 'string' ? lead.assignedTo : '') ||
                        lead.assignedEmployeeId || '',
                    }}
                    employees={employees}
                    onSubmit={handleEditSubmit}
                    onCancel={() => setShowEdit(false)}
                    loading={editLoading}
                    mode="edit"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="col-sm-4">
      <div style={{ fontSize: '0.75rem', color: 'var(--clr-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.9rem', color: 'var(--clr-text)', marginTop: 2, fontWeight: 500 }}>{value}</div>
    </div>
  );
}
