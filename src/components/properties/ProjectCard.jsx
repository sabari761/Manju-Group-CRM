import React from 'react';
import { Link } from 'react-router-dom';

export default function ProjectCard({ project, onEdit, onDelete }) {
  const id = project?._id || project?.id;
  const name = project?.name || 'Untitled Project';
  const location = project?.location || 'Location not specified';
  const description = project?.description;
  const buildingCount = project?.buildingCount ?? project?.buildings?.length ?? '—';
  const unitCount = project?.unitCount ?? project?.units?.length ?? '—';

  return (
    <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: 8 }}>
      <div className="card-body p-4 d-flex flex-column justify-content-between">
        <div>
          <h6 className="fw-bold mb-1" style={{ color: 'var(--clr-navy)', fontSize: '1rem' }}>
            {name}
          </h6>
          <p className="mb-2" style={{ color: 'var(--clr-muted)', fontSize: '0.82rem' }}>
            📍 {location}
          </p>
          {description && (
            <p style={{ fontSize: '0.82rem', color: 'var(--clr-text)' }} className="mb-2">
              {description}
            </p>
          )}
          <div className="d-flex gap-3 mb-3" style={{ fontSize: '0.8rem', color: 'var(--clr-muted)' }}>
            <span>
              <strong style={{ color: 'var(--clr-navy)' }}>{buildingCount}</strong> Buildings
            </span>
            <span>
              <strong style={{ color: 'var(--clr-navy)' }}>{unitCount}</strong> Units
            </span>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-2">
          <Link
            to={`/properties/${id}`}
            className="btn btn-navy btn-sm"
            id={`view-project-${id}`}
            aria-label={`View project ${name}`}
          >
            View Project
          </Link>
          <div className="d-flex gap-1 align-items-center">
            {/* Edit Icon Button - Borderless & Reduced Size */}
            <button
              type="button"
              className="btn btn-sm text-primary d-inline-flex align-items-center justify-content-center p-0 border-0"
              onClick={() => onEdit?.(project)}
              title={`Edit ${name}`}
              aria-label={`Edit ${name}`}
              style={{
                width: 28,
                height: 28,
                background: 'transparent',
                color: 'var(--clr-blue)',
                borderRadius: 4,
              }}
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

            {/* Delete Icon Button - Borderless & Reduced Size */}
            <button
              type="button"
              className="btn btn-sm text-danger d-inline-flex align-items-center justify-content-center p-0 border-0"
              onClick={() => onDelete?.(project)}
              title={`Delete ${name}`}
              aria-label={`Delete ${name}`}
              style={{
                width: 28,
                height: 28,
                background: 'transparent',
                borderRadius: 4,
              }}
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
        </div>
      </div>
    </div>
  );
}
