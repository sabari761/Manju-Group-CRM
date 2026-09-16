import React from 'react';
import { Link } from 'react-router-dom';
import LeadStageBadge from './LeadStageBadge';
import { formatDate } from '../../utils/formatters';
import EmptyState from '../common/EmptyState';

export default function LeadTable({ leads: leadsProp, onEdit, onDelete, loading }) {
  // Safe fallback — always work with an array even if parent passes undefined/null/object
  const leads = Array.isArray(leadsProp) ? leadsProp : [];
  if (loading) return null; // Parent shows spinner

  if (!leads || leads.length === 0) {
    return (
      <EmptyState
        title="No leads found."
        description="Try adjusting your search or filters."
      />
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover table-bordered align-middle mb-0" id="leads-table">
        <thead>
          <tr>
            <th>CUSTOMER NAME</th>
            <th>PHONE</th>
            <th>EMAIL</th>
            <th>STAGE</th>
            <th>ASSIGNED EMPLOYEE</th>
            <th>FOLLOW-UP DATE</th>
            <th style={{ width: 130, textAlign: 'center' }}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {leads?.map((lead) => {
            const id = lead?._id || lead?.id;
            const customerName = lead?.name || lead?.customerName || '—';
            const assigned =
              lead?.assignedTo?.name ||
              lead?.assignedEmployee ||
              (typeof lead?.assignedTo === 'string' ? lead?.assignedTo : '—');

            return (
              <tr key={id}>
                <td className="fw-medium">
                  <Link
                    to={`/leads/${id}`}
                    style={{ color: 'var(--clr-blue)', textDecoration: 'none' }}
                  >
                    {customerName}
                  </Link>
                </td>
                <td>{lead?.phone || '—'}</td>
                <td>{lead?.email || '—'}</td>
                <td><LeadStageBadge stage={lead?.stage} /></td>
                <td>{assigned}</td>
                <td>{formatDate(lead?.followUpDate)}</td>
                <td>
                  <div className="d-flex gap-2 justify-content-center">
                    {/* View Icon Button */}
                    <Link
                      to={`/leads/${id}`}
                      className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center"
                      title={`View ${customerName}`}
                      aria-label={`View ${customerName}`}
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
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                      </svg>
                    </Link>

                    {/* Edit Icon Button */}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary d-inline-flex align-items-center justify-content-center"
                      onClick={() => onEdit?.(lead)}
                      title={`Edit ${customerName}`}
                      aria-label={`Edit ${customerName}`}
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
                      onClick={() => onDelete?.(lead)}
                      title={`Delete ${customerName}`}
                      aria-label={`Delete ${customerName}`}
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
