import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { getProjects, getBuildings, getUnits } from '../../services/propertyService';
import { getLeads } from '../../services/leadService';
import { formatPrice } from '../../utils/formatters';

/**
 * Cascading booking form: Lead → Project → Building → Unit
 * Calls onSubmit(data, summaryObj) when user clicks Confirm Booking.
 */
export default function BookingForm({ prefillLeadId, prefillLeadName, onSubmit, loading }) {
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      leadId:     prefillLeadId || '',
      projectId:  '',
      buildingId: '',
      unitId:     '',
      bookingDate: new Date().toISOString().split('T')[0],
    },
  });

  const [leads,     setLeads]     = useState([]);
  const [projects,  setProjects]  = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [units,     setUnits]     = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const watchProject  = watch('projectId');
  const watchBuilding = watch('buildingId');
  const watchUnit     = watch('unitId');

  // Load leads + projects on mount
  useEffect(() => {
    getLeads().then((r) => {
      const raw = r.data?.data ?? r.data?.leads ?? r.data;
      setLeads(Array.isArray(raw) ? raw : []);
    }).catch(() => {});
    getProjects().then((r) => {
      const raw = r.data?.data ?? r.data?.projects ?? r.data;
      setProjects(Array.isArray(raw) ? raw : []);
    }).catch(() => {});
  }, []);

  // Load buildings when project changes
  const fetchBuildings = useCallback(async (projectId) => {
    if (!projectId) { setBuildings([]); return; }
    try {
      const r = await getBuildings(projectId);
      const raw = r.data?.buildings ?? r.data?.data ?? r.data;
      setBuildings(Array.isArray(raw) ? raw : []);
    } catch { setBuildings([]); }
  }, []);

  useEffect(() => {
    setValue('buildingId', '');
    setValue('unitId', '');
    setUnits([]);
    setSelectedUnit(null);
    fetchBuildings(watchProject);
  }, [watchProject, fetchBuildings, setValue]);

  // Load units when building changes
  const fetchUnits = useCallback(async (buildingId) => {
    if (!buildingId) { setUnits([]); return; }
    try {
      const r = await getUnits(buildingId);
      // Only show AVAILABLE units (API returns status: "AVAILABLE")
      const raw = r.data?.data ?? r.data?.units ?? r.data;
      const all = Array.isArray(raw) ? raw : [];
      setUnits(all.filter((u) =>
        u.status === 'AVAILABLE' || u.status === 'available' ||
        u.availability === 'AVAILABLE' || u.availability === 'available'
      ));
    } catch { setUnits([]); }
  }, []);

  useEffect(() => {
    setValue('unitId', '');
    setSelectedUnit(null);
    fetchUnits(watchBuilding);
  }, [watchBuilding, fetchUnits, setValue]);

  // Update selected unit detail card
  useEffect(() => {
    if (!watchUnit) { setSelectedUnit(null); return; }
    const unit = units.find((u) => String(u._id || u.id) === String(watchUnit));
    setSelectedUnit(unit || null);
  }, [watchUnit, units]);

  // Build a summary object for the confirm modal (display only)
  const buildSummary = (data) => {
    const lead     = leads.find((l) => String(l._id || l.id) === String(data.leadId));
    const project  = projects.find((p) => String(p._id || p.id) === String(data.projectId));
    const building = buildings.find((b) => String(b._id || b.id) === String(data.buildingId));
    const unit     = units.find((u) => String(u._id || u.id) === String(data.unitId));
    return {
      customerName: lead?.name || lead?.customerName || prefillLeadName || '—',
      projectName:  project?.name  || '—',
      buildingName: building?.name || '—',
      unitNumber:   unit?.unitNumber || unit?.number || '—',
      unitType:     unit?.type || unit?.unitType || '—',
      unitPrice:    unit?.price || 0,
    };
  };

  // POST /api/bookings only needs { leadId, unitId, bookingDate }
  const handleFormSubmit = (data) => {
    onSubmit(
      { leadId: data.leadId, unitId: data.unitId, bookingDate: data.bookingDate },
      buildSummary(data)
    );
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate id="booking-form">
      <div className="row g-3">
        {/* Lead / Customer */}
        <div className="col-md-6">
          <label htmlFor="bf-leadId" className="form-label">
            Lead / Customer <span className="text-danger">*</span>
          </label>
          <Controller
            name="leadId"
            control={control}
            rules={{ required: 'Please select a lead.' }}
            render={({ field }) => (
              <select
                {...field}
                id="bf-leadId"
                className={`form-select${errors.leadId ? ' is-invalid' : ''}`}
              >
                <option value="">Select lead...</option>
                {prefillLeadId && prefillLeadName && (
                  <option value={prefillLeadId}>{prefillLeadName}</option>
                )}
                {leads
                  .filter((l) => !prefillLeadId || String(l._id || l.id) !== String(prefillLeadId))
                  .map((l) => (
                    <option key={l._id || l.id} value={l._id || l.id}>{l.name || l.customerName}</option>
                  ))}
              </select>
            )}
          />
          {errors.leadId && <div className="invalid-feedback">{errors.leadId.message}</div>}
        </div>

        {/* Booking Date */}
        <div className="col-md-6">
          <label htmlFor="bf-bookingDate" className="form-label">Booking Date</label>
          <Controller
            name="bookingDate"
            control={control}
            render={({ field }) => (
              <input {...field} id="bf-bookingDate" type="date" className="form-control" />
            )}
          />
        </div>

        {/* Project */}
        <div className="col-md-6">
          <label htmlFor="bf-projectId" className="form-label">
            Project <span className="text-danger">*</span>
          </label>
          <Controller
            name="projectId"
            control={control}
            rules={{ required: 'Please select a project.' }}
            render={({ field }) => (
              <select
                {...field}
                id="bf-projectId"
                className={`form-select${errors.projectId ? ' is-invalid' : ''}`}
              >
                <option value="">Select project...</option>
                {projects.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                ))}
              </select>
            )}
          />
          {errors.projectId && <div className="invalid-feedback">{errors.projectId.message}</div>}
        </div>

        {/* Building */}
        <div className="col-md-6">
          <label htmlFor="bf-buildingId" className="form-label">
            Building <span className="text-danger">*</span>
          </label>
          <Controller
            name="buildingId"
            control={control}
            rules={{ required: 'Please select a building.' }}
            render={({ field }) => (
              <select
                {...field}
                id="bf-buildingId"
                className={`form-select${errors.buildingId ? ' is-invalid' : ''}`}
                disabled={!watchProject}
              >
                <option value="">Select building...</option>
                {buildings.map((b) => (
                  <option key={b._id || b.id} value={b._id || b.id}>{b.name}</option>
                ))}
              </select>
            )}
          />
          {errors.buildingId && <div className="invalid-feedback">{errors.buildingId.message}</div>}
        </div>

        {/* Unit */}
        <div className="col-md-6">
          <label htmlFor="bf-unitId" className="form-label">
            Available Unit <span className="text-danger">*</span>
          </label>
          <Controller
            name="unitId"
            control={control}
            rules={{ required: 'Please select a unit.' }}
            render={({ field }) => (
              <select
                {...field}
                id="bf-unitId"
                className={`form-select${errors.unitId ? ' is-invalid' : ''}`}
                disabled={!watchBuilding}
              >
                <option value="">Select unit...</option>
                {units.map((u) => (
                  <option key={u._id || u.id} value={u._id || u.id}>
                    {u.unitNumber || u.number} — {u.type || u.unitType} — {formatPrice(u.price)}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.unitId && <div className="invalid-feedback">{errors.unitId.message}</div>}
          {watchBuilding && units.length === 0 && (
            <div style={{ fontSize: '0.78rem', color: 'var(--clr-muted)', marginTop: 4 }}>
              No available units in this building.
            </div>
          )}
        </div>

        {/* Selected Unit Details */}
        {selectedUnit && (
          <div className="col-12">
            <div className="unit-detail-card">
              <div className="row g-2">
                <div className="col-6 col-md-3">
                  <div className="label">Unit</div>
                  <div className="value">{selectedUnit.unitNumber || selectedUnit.number}</div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="label">Type</div>
                  <div className="value">{selectedUnit.type || selectedUnit.unitType}</div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="label">Price</div>
                  <div className="value" style={{ color: 'var(--clr-orange)' }}>
                    {formatPrice(selectedUnit.price)}
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="label">Availability</div>
                  <div className="mt-1"><span className="badge-available">Available</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="d-flex justify-content-end mt-4">
        <button
          type="submit"
          id="booking-confirm-open-btn"
          className="btn btn-navy"
          disabled={loading}
        >
          {loading ? (
            <><span className="spinner-border spinner-border-sm me-1" />Processing...</>
          ) : 'Confirm Booking'}
        </button>
      </div>
    </form>
  );
}
