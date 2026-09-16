import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  getProject,
  getBuildings,
  createBuilding,
  updateBuilding,
  deleteBuilding,
  getUnits,
  createUnit,
  updateUnit,
  deleteUnit,
} from '../../services/propertyService';
import { formatPrice } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';

// ─── Unit type options ────────────────────────────────────────────────────────
const UNIT_TYPES = ['1BHK', '2BHK', '3BHK', '4BHK', 'STUDIO', 'PENTHOUSE', 'VILLA'];

// ─── Small reusable modal wrapper ────────────────────────────────────────────
function Modal({ show, title, onClose, children }) {
  if (!show) return null;
  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} style={{ zIndex: 1040 }} />
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        style={{ zIndex: 1050 }}
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-semibold" style={{ color: 'var(--clr-navy)' }}>
                {title}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
            </div>
            <div className="modal-body pt-2">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Add / Edit Building Form ─────────────────────────────────────────────────
function BuildingForm({ projectId, building, onClose, onSuccess }) {
  const isEdit = Boolean(building);
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (building) {
      reset({ name: building?.name || '' });
    } else {
      reset({ name: '' });
    }
  }, [building, reset]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isEdit) {
        const id = building?._id || building?.id;
        await updateBuilding(id, data);
        toast.success('Building updated successfully.');
      } else {
        await createBuilding(projectId, data);
        toast.success('Building added successfully.');
      }
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || `Failed to ${isEdit ? 'update' : 'add'} building.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="mb-3">
        <label htmlFor="bld-name" className="form-label">
          Building Name <span className="text-danger">*</span>
        </label>
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Building name is required.' }}
          render={({ field }) => (
            <input
              {...field}
              id="bld-name"
              type="text"
              className={`form-control${errors.name ? ' is-invalid' : ''}`}
              placeholder="e.g. Block A"
              autoFocus
            />
          )}
        />
        {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
      </div>
      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onClose}
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          id="confirm-building-btn"
          className="btn btn-navy"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" />
              Saving...
            </>
          ) : isEdit ? (
            'Update Building'
          ) : (
            'Add Building'
          )}
        </button>
      </div>
    </form>
  );
}

// ─── Add / Edit Unit Form ─────────────────────────────────────────────────────
function UnitForm({ buildingId, unit, onClose, onSuccess }) {
  const isEdit = Boolean(unit);
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { unitNumber: '', type: '2BHK', price: '', status: 'AVAILABLE' },
  });

  useEffect(() => {
    if (unit) {
      reset({
        unitNumber: unit?.unitNumber || unit?.number || '',
        type: unit?.type || '2BHK',
        price: unit?.price ?? '',
        status: unit?.status || 'AVAILABLE',
      });
    } else {
      reset({ unitNumber: '', type: '2BHK', price: '', status: 'AVAILABLE' });
    }
  }, [unit, reset]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = { ...data, price: Number(data.price) };
      if (isEdit) {
        const id = unit?._id || unit?.id;
        await updateUnit(id, payload);
        toast.success('Unit updated successfully.');
      } else {
        await createUnit(buildingId, payload);
        toast.success('Unit added successfully.');
      }
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to ${isEdit ? 'update' : 'add'} unit.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="row g-3">
        <div className="col-sm-6">
          <label htmlFor="unit-number" className="form-label">
            Unit Number <span className="text-danger">*</span>
          </label>
          <Controller
            name="unitNumber"
            control={control}
            rules={{ required: 'Unit number is required.' }}
            render={({ field }) => (
              <input
                {...field}
                id="unit-number"
                type="text"
                className={`form-control${errors.unitNumber ? ' is-invalid' : ''}`}
                placeholder="e.g. A-101"
                autoFocus
              />
            )}
          />
          {errors.unitNumber && <div className="invalid-feedback">{errors.unitNumber.message}</div>}
        </div>

        <div className="col-sm-6">
          <label htmlFor="unit-type" className="form-label">
            Type <span className="text-danger">*</span>
          </label>
          <Controller
            name="type"
            control={control}
            rules={{ required: 'Type is required.' }}
            render={({ field }) => (
              <select
                {...field}
                id="unit-type"
                className={`form-select${errors.type ? ' is-invalid' : ''}`}
              >
                {UNIT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.type && <div className="invalid-feedback">{errors.type.message}</div>}
        </div>

        <div className="col-sm-6">
          <label htmlFor="unit-price" className="form-label">
            Price (₹) <span className="text-danger">*</span>
          </label>
          <Controller
            name="price"
            control={control}
            rules={{ required: 'Price is required.', min: { value: 0, message: 'Must be positive.' } }}
            render={({ field }) => (
              <input
                {...field}
                id="unit-price"
                type="number"
                min="0"
                className={`form-control${errors.price ? ' is-invalid' : ''}`}
                placeholder="e.g. 5000000"
              />
            )}
          />
          {errors.price && <div className="invalid-feedback">{errors.price.message}</div>}
        </div>

        <div className="col-sm-6">
          <label htmlFor="unit-status" className="form-label">
            Status
          </label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <select {...field} id="unit-status" className="form-select">
                <option value="AVAILABLE">Available</option>
                <option value="BOOKED">Booked</option>
              </select>
            )}
          />
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onClose}
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          id="confirm-unit-btn"
          className="btn btn-navy"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" />
              Saving...
            </>
          ) : isEdit ? (
            'Update Unit'
          ) : (
            'Add Unit'
          )}
        </button>
      </div>
    </form>
  );
}

// ─── Main ProjectDetails Page ─────────────────────────────────────────────────
export default function ProjectDetails() {
  const params = useParams();
  const projectId = params?.projectId || params?.id;
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [units, setUnits] = useState([]);

  const [loadingProject, setLoadingProject] = useState(true);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [errorProject, setErrorProject] = useState(null);

  // Building modal & delete states
  const [showAddBuilding, setShowAddBuilding] = useState(false);
  const [editBuilding, setEditBuilding] = useState(null);
  const [deleteBuildingItem, setDeleteBuildingItem] = useState(null);
  const [deleteBuildingLoading, setDeleteBuildingLoading] = useState(false);

  // Unit modal & delete states
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [editUnit, setEditUnit] = useState(null);
  const [deleteUnitItem, setDeleteUnitItem] = useState(null);
  const [deleteUnitLoading, setDeleteUnitLoading] = useState(false);

  // ── Fetch project ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;
    setLoadingProject(true);
    setErrorProject(null);
    getProject(projectId)
      .then((r) => setProject(r.data?.data || r.data?.project || r.data))
      .catch(() => setErrorProject('Unable to load project details.'))
      .finally(() => setLoadingProject(false));
  }, [projectId]);

  // ── Fetch buildings ─────────────────────────────────────────────────────────
  const fetchBuildings = useCallback(async () => {
    if (!projectId) return;
    setLoadingBuildings(true);
    try {
      const r = await getBuildings(projectId);
      const raw = r.data?.data ?? r.data?.buildings ?? r.data;
      const list = Array.isArray(raw) ? raw : [];
      setBuildings(list);
      // Keep existing selection or select first
      setSelectedBuilding((prev) => {
        if (!prev) return list[0] ?? null;
        const exists = list.find((b) => (b._id || b.id) === (prev._id || prev.id));
        return exists || (list[0] ?? null);
      });
    } catch {
      toast.error('Could not load buildings.');
    } finally {
      setLoadingBuildings(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  // ── Fetch units ─────────────────────────────────────────────────────────────
  const fetchUnits = useCallback(async (building) => {
    const buildingId = building?._id || building?.id;
    if (!buildingId) {
      setUnits([]);
      return;
    }
    setLoadingUnits(true);
    try {
      const r = await getUnits(buildingId);
      const raw = r.data?.data ?? r.data?.units ?? r.data;
      setUnits(Array.isArray(raw) ? raw : []);
    } catch {
      toast.error('Could not load units.');
    } finally {
      setLoadingUnits(false);
    }
  }, []);

  useEffect(() => {
    fetchUnits(selectedBuilding);
  }, [selectedBuilding, fetchUnits]);

  // ── Delete Building ─────────────────────────────────────────────────────────
  const handleDeleteBuildingConfirm = async () => {
    if (!deleteBuildingItem) return;
    setDeleteBuildingLoading(true);
    try {
      const id = deleteBuildingItem?._id || deleteBuildingItem?.id;
      await deleteBuilding(id);
      toast.success('Building deleted successfully.');
      setDeleteBuildingItem(null);
      setSelectedBuilding(null);
      fetchBuildings();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete building.');
    } finally {
      setDeleteBuildingLoading(false);
    }
  };

  // ── Delete Unit ─────────────────────────────────────────────────────────────
  const handleDeleteUnitConfirm = async () => {
    if (!deleteUnitItem) return;
    setDeleteUnitLoading(true);
    try {
      const id = deleteUnitItem?._id || deleteUnitItem?.id;
      await deleteUnit(id);
      toast.success('Unit deleted successfully.');
      setDeleteUnitItem(null);
      fetchUnits(selectedBuilding);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete unit.');
    } finally {
      setDeleteUnitLoading(false);
    }
  };

  if (loadingProject) return <LoadingSpinner text="Loading project..." />;
  if (errorProject) return <ErrorState message={errorProject} onRetry={() => window.location.reload()} />;

  const availableCount = units?.filter(
    (u) => u?.status === 'AVAILABLE' || u?.status === 'available'
  )?.length ?? 0;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-3 d-flex align-items-center gap-2">
        <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/properties')}>
          ← Back
        </button>
        <span style={{ color: 'var(--clr-muted)', fontSize: '0.8rem' }}>
          Properties / {project?.name || 'Project'}
        </span>
      </div>

      {/* Project header card */}
      <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 8 }}>
        <div className="card-body px-4 py-3 d-flex flex-wrap justify-content-between align-items-start gap-2">
          <div>
            <h5 className="fw-bold mb-1" style={{ color: 'var(--clr-navy)' }}>
              {project?.name || '—'}
            </h5>
            <div style={{ fontSize: '0.85rem', color: 'var(--clr-muted)' }}>
              📍 {project?.location || '—'}
            </div>
            {project?.description && (
              <div style={{ fontSize: '0.82rem', color: 'var(--clr-text)', marginTop: 4 }}>
                {project.description}
              </div>
            )}
          </div>
          <button
            className="btn btn-navy btn-sm"
            id="add-building-open-btn"
            onClick={() => setShowAddBuilding(true)}
          >
            + Add Building
          </button>
        </div>
      </div>

      {/* Buildings + Units card */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: 8 }}>
        {/* Building tabs row */}
        <div className="card-header bg-white border-bottom px-4 py-3">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div className="d-flex flex-wrap gap-2 align-items-center">
              {loadingBuildings ? (
                <span style={{ fontSize: '0.82rem', color: 'var(--clr-muted)' }}>Loading buildings…</span>
              ) : buildings?.length === 0 ? (
                <span style={{ fontSize: '0.82rem', color: 'var(--clr-muted)' }}>
                  No buildings yet — click "+ Add Building" to start.
                </span>
              ) : (
                buildings?.map((b) => {
                  const bid = b?._id || b?.id;
                  const selId = selectedBuilding?._id || selectedBuilding?.id;
                  const isSelected = bid === selId;
                  return (
                    <button
                      key={bid}
                      className="btn btn-sm"
                      id={`building-tab-${bid}`}
                      onClick={() => setSelectedBuilding(b)}
                      aria-pressed={isSelected}
                      style={{
                        backgroundColor: isSelected ? 'var(--clr-navy)' : '#fff',
                        color: isSelected ? '#fff' : 'var(--clr-navy)',
                        border: `1px solid ${isSelected ? 'var(--clr-navy)' : 'var(--clr-border)'}`,
                        fontWeight: 500,
                        fontSize: '0.82rem',
                      }}
                    >
                      {b?.name}
                    </button>
                  );
                })
              )}
            </div>

            {selectedBuilding && (
              <div className="d-flex gap-2 align-items-center">
                {/* Edit Selected Building */}
                <button
                  type="button"
                  className="btn btn-sm text-primary d-inline-flex align-items-center justify-content-center p-0 border-0"
                  onClick={() => setEditBuilding(selectedBuilding)}
                  title={`Edit ${selectedBuilding?.name}`}
                  aria-label={`Edit ${selectedBuilding?.name}`}
                  style={{ width: 28, height: 28, color: 'var(--clr-blue)' }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                  </svg>
                </button>

                {/* Delete Selected Building */}
                <button
                  type="button"
                  className="btn btn-sm text-danger d-inline-flex align-items-center justify-content-center p-0 border-0"
                  onClick={() => setDeleteBuildingItem(selectedBuilding)}
                  title={`Delete ${selectedBuilding?.name}`}
                  aria-label={`Delete ${selectedBuilding?.name}`}
                  style={{ width: 28, height: 28 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                    <path
                      fillRule="evenodd"
                      d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                    />
                  </svg>
                </button>

                {/* Add Unit Button */}
                <button
                  className="btn btn-sm btn-outline-secondary"
                  id="add-unit-open-btn"
                  onClick={() => setShowAddUnit(true)}
                  style={{ fontSize: '0.8rem' }}
                >
                  + Add Unit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Units content */}
        <div className="card-body p-0">
          {!selectedBuilding ? (
            <div className="p-4">
              <EmptyState title="Select a building" description="Choose a building tab above to view its units." />
            </div>
          ) : loadingUnits ? (
            <div className="p-4">
              <LoadingSpinner text="Loading units..." />
            </div>
          ) : units?.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No units yet"
                description={`Click "+ Add Unit" to add units to ${selectedBuilding?.name || 'this building'}.`}
              />
            </div>
          ) : (
            <>
              {/* Summary row */}
              <div
                className="px-4 py-2 border-bottom d-flex gap-3"
                style={{ fontSize: '0.8rem', color: 'var(--clr-muted)' }}
              >
                <span>
                  <strong style={{ color: 'var(--clr-navy)' }}>{units?.length}</strong> Total
                </span>
                <span>
                  <strong style={{ color: '#065f46' }}>{availableCount}</strong> Available
                </span>
                <span>
                  <strong style={{ color: '#991b1b' }}>
                    {Math.max((units?.length ?? 0) - availableCount, 0)}
                  </strong>{' '}
                  Booked
                </span>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" id="units-table">
                  <thead>
                    <tr>
                      <th style={{ width: 50 }}>#</th>
                      <th>UNIT NO.</th>
                      <th>TYPE</th>
                      <th>PRICE</th>
                      <th>STATUS</th>
                      <th style={{ width: 90, textAlign: 'center' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units?.map((unit, idx) => {
                      const uid = unit?._id || unit?.id || idx;
                      const isAvail =
                        unit?.status === 'AVAILABLE' || unit?.status === 'available';
                      return (
                        <tr key={uid}>
                          <td style={{ color: 'var(--clr-muted)', fontSize: '0.82rem' }}>
                            {idx + 1}
                          </td>
                          <td className="fw-medium">{unit?.unitNumber || unit?.number || '—'}</td>
                          <td>{unit?.type || '—'}</td>
                          <td style={{ color: 'var(--clr-navy)', fontWeight: 600 }}>
                            {formatPrice(unit?.price)}
                          </td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: isAvail ? '#d1fae5' : '#fee2e2',
                                color: isAvail ? '#065f46' : '#991b1b',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                              }}
                            >
                              {isAvail ? 'Available' : 'Booked'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-1 justify-content-center">
                              {/* Edit Unit */}
                              <button
                                type="button"
                                className="btn btn-sm text-primary d-inline-flex align-items-center justify-content-center p-0 border-0"
                                onClick={() => setEditUnit(unit)}
                                title={`Edit Unit ${unit?.unitNumber || unit?.number || ''}`}
                                aria-label={`Edit Unit ${unit?.unitNumber || unit?.number || ''}`}
                                style={{ width: 28, height: 28, color: 'var(--clr-blue)' }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="13"
                                  height="13"
                                  fill="currentColor"
                                  viewBox="0 0 16 16"
                                  aria-hidden="true"
                                >
                                  <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                                </svg>
                              </button>

                              {/* Delete Unit */}
                              <button
                                type="button"
                                className="btn btn-sm text-danger d-inline-flex align-items-center justify-content-center p-0 border-0"
                                onClick={() => setDeleteUnitItem(unit)}
                                title={`Delete Unit ${unit?.unitNumber || unit?.number || ''}`}
                                aria-label={`Delete Unit ${unit?.unitNumber || unit?.number || ''}`}
                                style={{ width: 28, height: 28 }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="13"
                                  height="13"
                                  fill="currentColor"
                                  viewBox="0 0 16 16"
                                  aria-hidden="true"
                                >
                                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                  <path
                                    fillRule="evenodd"
                                    d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add / Edit Building Modal */}
      <Modal
        show={showAddBuilding || Boolean(editBuilding)}
        title={editBuilding ? `Edit Building — ${editBuilding?.name}` : 'Add Building'}
        onClose={() => {
          setShowAddBuilding(false);
          setEditBuilding(null);
        }}
      >
        <BuildingForm
          projectId={projectId}
          building={editBuilding}
          onClose={() => {
            setShowAddBuilding(false);
            setEditBuilding(null);
          }}
          onSuccess={fetchBuildings}
        />
      </Modal>

      {/* Delete Building Confirmation Modal */}
      <ConfirmModal
        show={Boolean(deleteBuildingItem)}
        title="Delete Building"
        body={
          deleteBuildingItem ? (
            <p className="mb-0">
              Are you sure you want to delete building <strong>{deleteBuildingItem?.name}</strong> and
              all associated units? This action cannot be undone.
            </p>
          ) : null
        }
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleteBuildingLoading}
        onConfirm={handleDeleteBuildingConfirm}
        onCancel={() => setDeleteBuildingItem(null)}
      />

      {/* Add / Edit Unit Modal */}
      <Modal
        show={showAddUnit || Boolean(editUnit)}
        title={
          editUnit
            ? `Edit Unit — ${editUnit?.unitNumber || editUnit?.number}`
            : `Add Unit — ${selectedBuilding?.name || ''}`
        }
        onClose={() => {
          setShowAddUnit(false);
          setEditUnit(null);
        }}
      >
        <UnitForm
          buildingId={selectedBuilding?._id || selectedBuilding?.id}
          unit={editUnit}
          onClose={() => {
            setShowAddUnit(false);
            setEditUnit(null);
          }}
          onSuccess={() => fetchUnits(selectedBuilding)}
        />
      </Modal>

      {/* Delete Unit Confirmation Modal */}
      <ConfirmModal
        show={Boolean(deleteUnitItem)}
        title="Delete Unit"
        body={
          deleteUnitItem ? (
            <p className="mb-0">
              Are you sure you want to delete unit{' '}
              <strong>{deleteUnitItem?.unitNumber || deleteUnitItem?.number}</strong>? This action
              cannot be undone.
            </p>
          ) : null
        }
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleteUnitLoading}
        onConfirm={handleDeleteUnitConfirm}
        onCancel={() => setDeleteUnitItem(null)}
      />
    </div>
  );
}
