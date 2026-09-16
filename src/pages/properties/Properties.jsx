import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from '../../hooks/useProperties';
import ProjectCard from '../../components/properties/ProjectCard';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';

const LIMIT = 10;

// ─── Add / Edit Project Modal ─────────────────────────────────────────────────
function ProjectModal({ show, project, onClose, onSuccess }) {
  const isEdit = Boolean(project);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', location: '', description: '' },
  });

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const submitting = createProject.isPending || updateProject.isPending;

  // Populate form when project changes or modal opens
  React.useEffect(() => {
    if (project) {
      reset({
        name: project?.name || '',
        location: project?.location || '',
        description: project?.description || '',
      });
    } else {
      reset({ name: '', location: '', description: '' });
    }
  }, [project, reset, show]);

  const onSubmit = (data) => {
    if (isEdit) {
      const id = project?._id || project?.id;
      updateProject.mutate(
        { id, data },
        {
          onSuccess: () => {
            reset();
            onSuccess();
            onClose();
          },
        }
      );
    } else {
      createProject.mutate(data, {
        onSuccess: () => {
          reset();
          onSuccess();
          onClose();
        },
      });
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
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);

  // Add / Edit Modal
  const [showModal, setShowModal]           = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Delete Modal
  const [deleteProject_, setDeleteProject] = useState(null);

  // ── Queries ───────────────────────────────────────────────────────────────────
  const filters = {
    page,
    limit: LIMIT,
    ...(search?.trim() && { search: search.trim() }),
  };

  const { data, isLoading, isError, refetch } = useProjects(filters);

  const projects   = data?.projects   ?? [];
  const total      = data?.total      ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const deleteProject = useDeleteProject();
  const deleteLoading = deleteProject.isPending;

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleAddClick  = () => { setSelectedProject(null); setShowModal(true); };
  const handleEditClick = (project) => { setSelectedProject(project); setShowModal(true); };

  const handleDeleteConfirm = () => {
    if (!deleteProject_) return;
    const id = deleteProject_?._id || deleteProject_?.id;
    deleteProject.mutate(id, {
      onSuccess: () => setDeleteProject(null),
    });
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

      {/* Search */}
      <div className="mb-3">
        <SearchInput
          id="projects-search"
          value={search}
          onChange={handleSearch}
          placeholder="Search by name, location, description..."
          style={{ maxWidth: 360 }}
        />
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading properties..." />
      ) : isError ? (
        <ErrorState message="Unable to load projects." onRetry={refetch} />
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
              <div className="col-12 col-sm-6 col-lg-4" key={project?._id || project?.id}>
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
        onClose={() => { setShowModal(false); setSelectedProject(null); }}
        onSuccess={() => {}}
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
