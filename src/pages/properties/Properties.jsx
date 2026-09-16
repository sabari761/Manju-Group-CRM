import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../../services/propertyService';
import ProjectCard from '../../components/properties/ProjectCard';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';

// ─── Add / Edit Project Modal ─────────────────────────────────────────────────
function ProjectModal({ show, project, onClose, onSuccess }) {
  const isEdit = Boolean(project);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', location: '', description: '' },
  });

  // Populate row data into form when editing, or clear when adding
  useEffect(() => {
    if (project) {
      reset({
        name: project?.name || '',
        location: project?.location || '',
        description: project?.description || '',
      });
    } else {
      reset({
        name: '',
        location: '',
        description: '',
      });
    }
  }, [project, reset, show]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isEdit) {
        const id = project?._id || project?.id;
        await updateProject(id, data);
        toast.success('Project updated successfully.');
      } else {
        await createProject(data);
        toast.success('Project created successfully.');
      }
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} project.`
      );
    } finally {
      setSubmitting(false);
    }
  };

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
        aria-labelledby="projectModalTitle"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0 pb-0">
              <h5
                className="modal-title fw-semibold"
                id="projectModalTitle"
                style={{ color: 'var(--clr-navy)' }}
              >
                {isEdit ? 'Edit Project' : 'Add Project'}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
            </div>
            <div className="modal-body pt-2">
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="row g-3">
                  {/* Name */}
                  <div className="col-12">
                    <label htmlFor="proj-name" className="form-label">
                      Project Name <span className="text-danger">*</span>
                    </label>
                    <Controller
                      name="name"
                      control={control}
                      rules={{ required: 'Project name is required.' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="proj-name"
                          type="text"
                          className={`form-control${errors.name ? ' is-invalid' : ''}`}
                          placeholder="e.g. Manju Heights"
                        />
                      )}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                  </div>

                  {/* Location */}
                  <div className="col-12">
                    <label htmlFor="proj-location" className="form-label">
                      Location <span className="text-danger">*</span>
                    </label>
                    <Controller
                      name="location"
                      control={control}
                      rules={{ required: 'Location is required.' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="proj-location"
                          type="text"
                          className={`form-control${errors.location ? ' is-invalid' : ''}`}
                          placeholder="e.g. Chennai, Tamil Nadu"
                        />
                      )}
                    />
                    {errors.location && (
                      <div className="invalid-feedback">{errors.location.message}</div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="col-12">
                    <label htmlFor="proj-description" className="form-label">
                      Description
                    </label>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          id="proj-description"
                          className="form-control"
                          rows={3}
                          placeholder="Brief description of the project..."
                        />
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
                    id="proj-form-submit"
                    className="btn btn-navy"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" />
                        Saving...
                      </>
                    ) : isEdit ? (
                      'Update Project'
                    ) : (
                      'Add Project'
                    )}
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
export default function Properties() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Delete Modal
  const [deleteProject_, setDeleteProject] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Search & pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: LIMIT };
      if (search?.trim()) {
        params.search = search.trim();
      }
      const res = await getProjects(params);
      // Response: { success, data: [], total, page, limit, totalPages }
      const raw = res.data?.data ?? res.data?.projects ?? res.data;
      const list = Array.isArray(raw) ? raw : [];
      setProjects(list);
      setTotal(res.data?.total ?? list.length ?? 0);
      setTotalPages(
        res.data?.totalPages ?? Math.max(Math.ceil((res.data?.total ?? list.length) / LIMIT), 1)
      );
    } catch {
      setError('Unable to load projects.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleAddClick = () => {
    setSelectedProject(null);
    setShowModal(true);
  };

  const handleEditClick = (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProject_) return;
    setDeleteLoading(true);
    try {
      const id = deleteProject_?._id || deleteProject_?.id;
      await deleteProject(id);
      toast.success('Project deleted successfully.');
      setDeleteProject(null);
      fetchProjects();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete project.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Properties">
        <button
          className="btn btn-navy btn-sm"
          id="add-project-btn"
          onClick={handleAddClick}
        >
          + Add Project
        </button>
      </PageHeader>

      {/* Search by name, location, description */}
      <div className="mb-3">
        <SearchInput
          id="projects-search"
          value={search}
          onChange={handleSearch}
          placeholder="Search by name, location, description..."
          style={{ maxWidth: 360 }}
        />
      </div>

      {loading ? (
        <LoadingSpinner text="Loading properties..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProjects} />
      ) : projects?.length === 0 ? (
        <EmptyState
          title="No projects found."
          description={
            search
              ? 'Try adjusting your search term.'
              : 'Click "+ Add Project" to create your first property.'
          }
        />
      ) : (
        <>
          <div className="row g-3">
            {projects?.map((project) => (
              <div className="col-md-6 col-lg-4" key={project?._id || project?.id}>
                <ProjectCard
                  project={project}
                  onEdit={handleEditClick}
                  onDelete={(p) => setDeleteProject(p)}
                />
              </div>
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={LIMIT}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Add / Edit Project Modal */}
      <ProjectModal
        show={showModal}
        project={selectedProject}
        onClose={() => {
          setShowModal(false);
          setSelectedProject(null);
        }}
        onSuccess={() => {
          fetchProjects();
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={Boolean(deleteProject_)}
        title="Delete Project"
        body={
          deleteProject_ ? (
            <p className="mb-0">
              Are you sure you want to delete project <strong>{deleteProject_?.name}</strong>?
              This action cannot be undone.
            </p>
          ) : null
        }
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteProject(null)}
      />
    </div>
  );
}
