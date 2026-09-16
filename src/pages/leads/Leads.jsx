import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getLeads, createLead, updateLead, deleteLead, getLeadById } from '../../services/leadService';
import { getEmployees } from '../../services/employeeService';
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

export default function Leads() {
  const [leads, setLeads]         = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // Filters
  const [search, setSearch]       = useState('');
  const [stageFilter, setStage]   = useState('');
  const [empFilter, setEmpFilter] = useState('');

  // Pagination
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  // Form modal
  const [showForm, setShowForm]   = useState(false);
  const [editLead, setEditLead]   = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete modal
  const [deleteLead_, setDeleteLead] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: LIMIT };
      if (search)      params.search     = search;
      if (stageFilter) params.stage      = stageFilter;
      if (empFilter)   params.assignedTo = empFilter;

      const res = await getLeads(params);
      // Response: { data: [], total, page, limit, totalPages }
      const raw = res.data?.data ?? res.data?.leads ?? res.data;
      setLeads(Array.isArray(raw) ? raw : []);
      setTotal(res.data?.total ?? 0);
      setTotalPages(res.data?.totalPages ?? 1);
    } catch {
      setError('Unable to load leads.');
    } finally {
      setLoading(false);
    }
  }, [page, search, stageFilter, empFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Reset page on filter/search change
  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handleStage  = (val) => { setStage(val);  setPage(1); };
  const handleEmp    = (val) => { setEmpFilter(val); setPage(1); };

  useEffect(() => {
    getEmployees()
      .then((r) => {
        const raw = r.data?.data ?? r.data?.employees ?? r.data;
        setEmployees(Array.isArray(raw) ? raw : []);
      })
      .catch(() => {});
  }, []);

  // ---- Handlers ----
  const openCreate = () => { setEditLead(null); setShowForm(true); };
  const openEdit   = async (lead) => {
    const id = lead._id || lead.id;
    // Set immediate row data so modal opens instantly
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

    // Call getLeadById to ensure fresh/complete lead data
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
      // Row data fallback already in place
    }
  };
  const closeForm  = () => { setShowForm(false); setEditLead(null); };

  const handleFormSubmit = async (data) => {
    setFormLoading(true);
    try {
      const payload = { ...data };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.followUpDate) delete payload.followUpDate;

      if (editLead) {
        await updateLead(editLead.id || editLead._id, payload);
        toast.success('Lead updated successfully.');
      } else {
        await createLead(payload);
        toast.success('Lead created successfully.');
      }
      closeForm();
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save lead.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteLead(deleteLead_._id || deleteLead_.id);
      toast.success('Lead deleted successfully.');
      setDeleteLead(null);
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete lead.');
    } finally {
      setDeleteLoading(false);
    }
  };

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
      {loading ? (
        <LoadingSpinner text="Loading leads..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLeads} />
      ) : (
        <>
          <LeadTable
            leads={leads}
            loading={loading}
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
