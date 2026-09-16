import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { STAGES } from './LeadStageBadge';

/**
 * Reusable lead form for both create and edit modes.
 * Mode: 'create' | 'edit'
 */
export default function LeadForm({ defaultValues, employees = [], onSubmit, onCancel, loading, mode = 'create' }) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: defaultValues || {} });

  useEffect(() => {
    reset(defaultValues || {});
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="row g-3">
        {/* Customer Name */}
        <div className="col-md-6">
          <label htmlFor="lf-name" className="form-label">
            Customer Name <span className="text-danger">*</span>
          </label>
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Customer name is required.' }}
            render={({ field }) => (
              <input
                {...field}
                id="lf-name"
                type="text"
                className={`form-control${errors.name ? ' is-invalid' : ''}`}
                placeholder="e.g. Rahul Kumar"
              />
            )}
          />
          {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
        </div>

        {/* Phone */}
        <div className="col-md-6">
          <label htmlFor="lf-phone" className="form-label">
            Phone <span className="text-danger">*</span>
          </label>
          <Controller
            name="phone"
            control={control}
            rules={{
              required: 'Phone is required.',
              pattern: { value: /^[0-9+\-\s()]{7,15}$/, message: 'Enter a valid phone number.' },
            }}
            render={({ field }) => (
              <input
                {...field}
                id="lf-phone"
                type="tel"
                className={`form-control${errors.phone ? ' is-invalid' : ''}`}
                placeholder="e.g. 9876543210"
              />
            )}
          />
          {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
        </div>

        {/* Email */}
        <div className="col-md-6">
          <label htmlFor="lf-email" className="form-label">Email</label>
          <Controller
            name="email"
            control={control}
            rules={{
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address.' },
            }}
            render={({ field }) => (
              <input
                {...field}
                id="lf-email"
                type="email"
                className={`form-control${errors.email ? ' is-invalid' : ''}`}
                placeholder="e.g. rahul@example.com"
              />
            )}
          />
          {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
        </div>

        {/* Stage */}
        <div className="col-md-6">
          <label htmlFor="lf-stage" className="form-label">
            Stage <span className="text-danger">*</span>
          </label>
          <Controller
            name="stage"
            control={control}
            rules={{ required: 'Stage is required.' }}
            render={({ field }) => (
              <select
                {...field}
                id="lf-stage"
                className={`form-select${errors.stage ? ' is-invalid' : ''}`}
              >
                <option value="">Select stage...</option>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
          />
          {errors.stage && <div className="invalid-feedback">{errors.stage.message}</div>}
        </div>

        {/* Assigned Employee */}
        <div className="col-md-6">
          <label htmlFor="lf-assignedTo" className="form-label">Assigned Employee</label>
          <Controller
            name="assignedTo"
            control={control}
            render={({ field }) => (
              <select {...field} id="lf-assignedTo" className="form-select">
                <option value="">Unassigned</option>
                {employees.map((emp) => (
                  <option key={emp._id || emp.id} value={emp._id || emp.id}>{emp.name}</option>
                ))}
              </select>
            )}
          />
        </div>

        {/* Follow-up Date */}
        <div className="col-md-6">
          <label htmlFor="lf-followUpDate" className="form-label">Follow-up Date</label>
          <Controller
            name="followUpDate"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                id="lf-followUpDate"
                type="date"
                className={`form-control${errors.followUpDate ? ' is-invalid' : ''}`}
              />
            )}
          />
          {errors.followUpDate && <div className="invalid-feedback">{errors.followUpDate.message}</div>}
        </div>

        {/* Notes */}
        <div className="col-12">
          <label htmlFor="lf-notes" className="form-label">Notes</label>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                id="lf-notes"
                className="form-control"
                rows={3}
                placeholder="Any relevant notes about the lead..."
              />
            )}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="d-flex justify-content-end gap-2 mt-4">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-navy"
          id={`lead-form-submit-${mode}`}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" role="status" />
              Saving...
            </>
          ) : mode === 'edit' ? 'Update Lead' : 'Save Lead'}
        </button>
      </div>
    </form>
  );
}
