import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead } from '../../hooks/useLeads';
import { useEmployees } from '../../hooks/useEmployees';
import { getLeadById } from '../../services/leadService';
import { toInputDate } from '../../utils/formatters';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import LeadFilters from '../../components/leads/LeadFilters';
import LeadTable from '../../components/leads/LeadTable';
import LeadForm from '../../components/leads/LeadForm';
import ConfirmModal from '../../components/common/ConfirmModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';

const LIMIT = 10;

export default function Leads() {
  // Filters & pagination
  const [search, setSearch]       = useState('');
  const [stageFilter, setStage]   = useState('');
  const [empFilter, setEmpFilter] = useState('');
  const [page, setPage]           = useState(1);

  // Form modal
  const [showForm, setShowForm]   = useState(false);
  const [editLead, setEditLead]   = useState(null);

  // Delete modal
  const [deleteLead_, setDeleteLead] = useState(null);

  // ── Queries ──────────────────────────────────────────────────────────────────
  const filters = {
    page,
    limit: LIMIT,
    ...(search      && { search }),
    ...(stageFilter && { stage: stageFilter }),
    ...(empFilter   && { assignedTo: empFilter }),
  };

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useLeads(filters);

  const leads      = data?.leads      ?? [];
  const total      = data?.total      ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // Employees dropdown (no pagination needed — load all)
  const { data: empData } = useEmployees({ limit: 200 });
  const employees = empData?.employees ?? [];

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();

  // ── Filter helpers ────────────────────────────────────────────────────────────
  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handleStage  = (val) => { setStage(val);  setPage(1); };
  const handleEmp    = (val) => { setEmpFilter(val); setPage(1); };

  // ── Form handlers ─────────────────────────────────────────────────────────────
  const openCreate = () => { setEditLead(null); setShowForm(true); };

  const openEdit = async (lead) => {
    const id = lead._id || lead.id;
    const assignedToId =
      lead.assignedTo?._id ||
      (typeof lead.assignedTo === 'string' ? lead.assignedTo : '') ||
      lead.assignedEmployeeId || '';
    setEditLead({
      ...lead,
      name: lead.name || lead.customerName || '',
      id,
      followUpDate: toInputDate(lead.followUpDate),
      assignedTo: assignedToId,
    });
    setShowForm(true);

    // Fetch fresh data to fill form
    try {
      const res = await getLeadById(id);
      const fresh = res.data?.data ?? res.data?.lead ?? res.data;
      if (fresh) {
        const freshAssignedTo =
          fresh.assignedTo?._id ||
          (typeof fresh.assignedTo === 'string' ? fresh.assignedTo : '') ||
          fresh.assignedEmployeeId || '';
        setEditLead({
          ...fresh,
          name: fresh.name || fresh.customerName || '',
          id: fresh._id || fresh.id || id,
          followUpDate: toInputDate(fresh.followUpDate),
          assignedTo: freshAssignedTo,
        });
      }
    } catch {
      // Row data already set as fallback
    }
  };

  const closeForm = () => { setShowForm(false); setEditLead(null); };

  const handleFormSubmit = (data) => {
    const payload = { ...data };
    if (!payload.assignedTo) delete payload.assignedTo;
    if (!payload.followUpDate) delete payload.followUpDate;

    if (editLead) {
      updateLead.mutate(
        { id: editLead.id || editLead._id, data: payload },
        { onSuccess: closeForm }
      );
    } else {
      createLead.mutate(payload, { onSuccess: closeForm });
    }
  };

  const handleDeleteConfirm = () => {
    deleteLead.mutate(deleteLead_._id || deleteLead_.id, {
      onSuccess: () => setDeleteLead(null),
    });
  };

  const formLoading   = createLead.isPending || updateLead.isPending;
  const deleteLoading = deleteLead.isPending;

  return (
    <div>
      <PageHeader title="Leads">
        <button className="btn btn-navy btn-sm" id="add-lead-btn" onClick={openCreate}>
          + Add Lead
        </button>
      </PageHeader>

      {/* Filters */}
      <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
        <SearchInput
          id="leads-search"
          value={search}
          onChange={handleSearch}
          placeholder="Search by name, phone, email..."
        />
        <LeadFilters
          stage={stageFilter}
          onStageChange={handleStage}
          employees={employees}
          assignedTo={empFilter}
          onAssignedToChange={handleEmp}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner text="Loading leads..." />
      ) : isError ? (
        <ErrorState message="Unable to load leads." onRetry={refetch} />
      ) : (
        <>
          <LeadTable
            leads={leads}
            loading={isLoading}
            onEdit={openEdit}
            onDelete={(lead) => setDeleteLead(lead)}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={LIMIT}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Lead Form Modal */}
      {showForm && (
        <>
          <div className="modal-backdrop fade show" onClick={closeForm} style={{ zIndex: 1040 }} />
          <div className="modal fade show d-block" tabIndex="-1" role="dialog"
            style={{ zIndex: 1050 }} aria-modal="true" aria-labelledby="leadFormTitle">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-semibold" id="leadFormTitle"
                    style={{ color: 'var(--clr-navy)' }}>
                    {editLead ? 'Edit Lead' : 'New Lead'}
                  </h5>
                  <button type="button" className="btn-close" onClick={closeForm} aria-label="Close" />
                </div>
                <div className="modal-body pt-2">
                  <LeadForm
                    defaultValues={editLead}
                    employees={employees}
                    onSubmit={handleFormSubmit}
                    onCancel={closeForm}
                    loading={formLoading}
                    mode={editLead ? 'edit' : 'create'}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={!!deleteLead_}
        title="Delete Lead"
        body={
          <p>
            Are you sure you want to delete{' '}
            <strong>{deleteLead_?.name || deleteLead_?.customerName}</strong>?
            This action cannot be undone.
          </p>
        }
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteLead(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
