import React from 'react';
import { STAGES } from './LeadStageBadge';

export default function LeadFilters({ stage, onStageChange, employees: employeesProp, assignedTo, onAssignedToChange }) {
  const employees = Array.isArray(employeesProp) ? employeesProp : [];
  return (
    <div className="d-flex gap-2 flex-wrap flex-grow-1 flex-sm-grow-0">
      {/* Stage filter */}
      <select
        id="filter-stage"
        className="form-select form-select-sm flex-grow-1 flex-sm-grow-0"
        style={{ width: 'auto', minWidth: 130, borderColor: 'var(--clr-border)' }}
        value={stage}
        onChange={(e) => onStageChange(e.target.value)}
        aria-label="Filter by stage"
      >
        <option value="">All Stages</option>
        {STAGES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Assigned employee filter */}
      {employees && employees.length > 0 && (
        <select
          id="filter-employee"
          className="form-select form-select-sm flex-grow-1 flex-sm-grow-0"
          style={{ width: 'auto', minWidth: 150, borderColor: 'var(--clr-border)' }}
          value={assignedTo}
          onChange={(e) => onAssignedToChange(e.target.value)}
          aria-label="Filter by employee"
        >
          <option value="">All Employees</option>
          {employees.map((emp) => (
            <option key={emp._id || emp.id} value={emp._id || emp.id}>{emp.name}</option>
          ))}
        </select>
      )}
    </div>
  );
}
