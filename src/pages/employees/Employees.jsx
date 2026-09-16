import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../../services/employeeService';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';

// ─── Role helpers ─────────────────────────────────────────────────────────────
const ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SALES_EMPLOYEE', label: 'Sales Employee' },
];

const roleLabel = (role) => ROLES.find((r) => r.value === role)?.label || role;

const roleBadgeStyle = (role) => {
  switch (role) {
    case 'SUPER_ADMIN':
      return { backgroundColor: '#fef3c7', color: '#92400e' };
    case 'ADMIN':
      return { backgroundColor: '#ffe4e6', color: '#9f1239' };
    default:
      return { backgroundColor: '#e0f2fe', color: '#0369a1' };
  }
};

// ─── Add / Edit Employee Modal ────────────────────────────────────────────────
function EmployeeModal({ show, employee, onClose, onSuccess }) {
  const isEdit = Boolean(employee);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      mobileNumber: '',
      email: '',
      password: '',
      role: 'SALES_EMPLOYEE',
    },
  });

  // Populate row data into form when editing, or clear when adding
  useEffect(() => {
    if (employee) {
      reset({
        name: employee.name || '',
        mobileNumber: employee.mobileNumber || '',
        email: employee.email || '',
        password: '',
        role: employee.role || 'SALES_EMPLOYEE',
      });
    } else {
      reset({
        name: '',
        mobileNumber: '',
        email: '',
        password: '',
        role: 'SALES_EMPLOYEE',
      });
    }
  }, [employee, reset, show]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = { ...data };
      // When editing, do not send empty password if untouched
      if (isEdit && !payload.password?.trim()) {
        delete payload.password;
      }

      if (isEdit) {
        const id = employee._id || employee.id;
        await updateEmployee(id, payload);
        toast.success('Employee updated successfully.');
      } else {
        await createEmployee(payload);
        toast.success('Employee added successfully.');
      }
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'add'} employee.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 1040 }}
      />
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        style={{ zIndex: 1050 }}
        aria-modal="true"
        aria-labelledby="employeeModalTitle"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header border-0 pb-0">
              <h5
                className="modal-title fw-semibold"
                id="employeeModalTitle"
                style={{ color: 'var(--clr-navy)' }}
              >
                {isEdit ? 'Edit Employee' : 'Add Employee'}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              />
            </div>

            {/* Body */}
            <div className="modal-body pt-2">
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="row g-3">
                  {/* Name */}
                  <div className="col-12">
                    <label htmlFor="emp-name" className="form-label">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <Controller
                      name="name"
                      control={control}
                      rules={{ required: 'Name is required.' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="emp-name"
                          type="text"
                          className={`form-control${errors.name ? ' is-invalid' : ''}`}
                          placeholder="e.g. Ravi Kumar"
                        />
                      )}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                  </div>

                  {/* Mobile */}
                  <div className="col-12 col-sm-6">
                    <label htmlFor="emp-mobile" className="form-label">
                      Mobile Number <span className="text-danger">*</span>
                    </label>
                    <Controller
                      name="mobileNumber"
                      control={control}
                      rules={{
                        required: 'Mobile number is required.',
                        pattern: { value: /^[0-9]{10}$/, message: 'Enter a valid 10-digit number.' },
                      }}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="emp-mobile"
                          type="tel"
                          className={`form-control${errors.mobileNumber ? ' is-invalid' : ''}`}
                          placeholder="e.g. 9876543210"
                        />
                      )}
                    />
                    {errors.mobileNumber && <div className="invalid-feedback">{errors.mobileNumber.message}</div>}
                  </div>

                  {/* Role */}
                  <div className="col-12 col-sm-6">
                    <label htmlFor="emp-role" className="form-label">
                      Role <span className="text-danger">*</span>
                    </label>
                    <Controller
                      name="role"
                      control={control}
                      rules={{ required: 'Role is required.' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          id="emp-role"
                          className={`form-select${errors.role ? ' is-invalid' : ''}`}
                        >
                          {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.role && <div className="invalid-feedback">{errors.role.message}</div>}
                  </div>

                  {/* Email */}
                  <div className="col-12">
                    <label htmlFor="emp-email" className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <Controller
                      name="email"
                      control={control}
                      rules={{
                        required: 'Email is required.',
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email.' },
                      }}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="emp-email"
                          type="email"
                          className={`form-control${errors.email ? ' is-invalid' : ''}`}
                          placeholder="e.g. ravi@company.com"
                        />
                      )}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                  </div>

                  {/* Password */}
                  <div className="col-12">
                    <label htmlFor="emp-password" className="form-label">
                      Password {isEdit ? <span className="text-muted fw-normal">(Leave blank to keep unchanged)</span> : <span className="text-danger">*</span>}
                    </label>
                    <Controller
                      name="password"
                      control={control}
                      rules={{
                        required: !isEdit ? 'Password is required.' : false,
                        minLength: { value: 6, message: 'Minimum 6 characters.' },
                      }}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="emp-password"
                          type="password"
                          className={`form-control${errors.password ? ' is-invalid' : ''}`}
                          placeholder={isEdit ? 'Enter new password (optional)' : 'Min 6 characters'}
                          autoComplete="new-password"
                        />
                      )}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                  </div>
                </div>

                {/* Actions */}
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
                    id="emp-form-submit"
                    className="btn btn-navy"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" />
                        Saving...
                      </>
                    ) : isEdit ? 'Update Employee' : 'Add Employee'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Delete Modal
  const [deleteEmp, setDeleteEmp] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: LIMIT };
      if (search.trim()) params.search = search.trim();
      const res = await getEmployees(params);
      // Response: { success, data: [...], total, page, limit, totalPages }
      const raw = res.data?.data ?? res.data?.employees ?? res.data;
      setEmployees(Array.isArray(raw) ? raw : []);
      setTotal(res.data?.total ?? 0);
    } catch {
      setError('Unable to load employees.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Open Add Modal
  const handleAddClick = () => {
    setSelectedEmployee(null);
    setShowModal(true);
  };

  // Open Edit Modal with row data passed
  const handleEditClick = (emp) => {
    setSelectedEmployee(emp);
    setShowModal(true);
  };

  // Confirm and execute DELETE /api/users/:id
  const handleDeleteConfirm = async () => {
    if (!deleteEmp) return;
    setDeleteLoading(true);
    try {
      const id = deleteEmp._id || deleteEmp.id;
      await deleteEmployee(id);
      toast.success('Employee deleted successfully.');
      setDeleteEmp(null);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete employee.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Reset to page 1 when search changes
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <PageHeader title="Employees">
        <button
          className="btn btn-navy btn-sm"
          id="add-employee-btn"
          onClick={handleAddClick}
        >
          + Add Employee
        </button>
      </PageHeader>

      {/* Search */}
      <div className="mb-3">
        <input
          id="employees-search"
          type="text"
          className="form-control"
          style={{ maxWidth: 320, borderColor: 'var(--clr-border)' }}
          placeholder="Search by name, email..."
          value={search}
          onChange={handleSearch}
        />
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner text="Loading employees..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchEmployees} />
      ) : employees.length === 0 ? (
        <EmptyState
          title="No employees found."
          description={search ? 'Try a different search term.' : 'Click "+ Add Employee" to get started.'}
        />
      ) : (
        <>
          <div className="table-responsive">
            <table
              className="table table-hover table-bordered align-middle mb-0"
              id="employees-table"
            >
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>NAME</th>
                  <th>MOBILE</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th style={{ width: 100, textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {employees?.map((emp, idx) => (
                  <tr key={emp?._id || emp?.id || idx}>
                    <td style={{ color: 'var(--clr-muted)', fontSize: '0.82rem' }}>
                      {(page - 1) * LIMIT + idx + 1}
                    </td>
                    <td className="fw-medium">{emp?.name || '—'}</td>
                    <td>{emp?.mobileNumber || '—'}</td>
                    <td>{emp?.email || '—'}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          ...roleBadgeStyle(emp?.role),
                          fontSize: '0.72rem',
                          fontWeight: 600,
                        }}
                      >
                        {roleLabel(emp?.role)}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        {/* Edit Icon Button */}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center justify-content-center"
                          onClick={() => handleEditClick(emp)}
                          title={`Edit ${emp?.name || ''}`}
                          aria-label={`Edit ${emp?.name || ''}`}
                          style={{
                            width: 32,
                            height: 32,
                            padding: 0,
                            borderRadius: 6,
                            borderColor: 'var(--clr-blue)',
                            color: 'var(--clr-blue)',
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                            aria-hidden="true"
                          >
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                          </svg>
                        </button>

                        {/* Delete Icon Button */}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center"
                          onClick={() => setDeleteEmp(emp)}
                          title={`Delete ${emp?.name || ''}`}
                          aria-label={`Delete ${emp?.name || ''}`}
                          style={{
                            width: 32,
                            height: 32,
                            padding: 0,
                            borderRadius: 6,
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                            aria-hidden="true"
                          >
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bootstrap 5 Pagination */}
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={LIMIT}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Add / Edit Employee Modal */}
      <EmployeeModal
        show={showModal}
        employee={selectedEmployee}
        onClose={() => {
          setShowModal(false);
          setSelectedEmployee(null);
        }}
        onSuccess={() => {
          fetchEmployees();
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={Boolean(deleteEmp)}
        title="Delete Employee"
        body={
          deleteEmp ? (
            <p className="mb-0">
              Are you sure you want to delete employee <strong>{deleteEmp.name}</strong> ({deleteEmp.email})?
              This action cannot be undone.
            </p>
          ) : null
        }
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteEmp(null)}
      />
    </div>
  );
}
