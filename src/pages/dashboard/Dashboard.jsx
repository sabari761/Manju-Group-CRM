import React from 'react';
import { Link } from 'react-router-dom';
import { useDashboard, useFollowUpLeads, useRecentBookings } from '../../hooks/useDashboard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import LeadStageBadge from '../../components/leads/LeadStageBadge';
import { formatDate, formatPrice } from '../../utils/formatters';

const STAGES = ['New', 'Contacted', 'Site Visit', 'Interested', 'Negotiation', 'Booked', 'Lost'];

const STAGE_FIELD_MAP = {
  'New': 'newLeads',
  'Contacted': 'contactedLeads',
  'Site Visit': 'siteVisitLeads',
  'Interested': 'interestedLeads',
  'Negotiation': 'negotiationLeads',
  'Booked': 'bookedLeads',
  'Lost': 'lostLeads',
};

const STAGE_COLORS = {
  New: '#0369a1',
  Contacted: '#0284c7',
  'Site Visit': '#7c3aed',
  Interested: '#065f46',
  Negotiation: '#92400e',
  Booked: '#166534',
  Lost: '#991b1b',
};

export default function Dashboard() {
  const {
    data: dashboardData,
    isLoading: loadingDashboard,
    isError: errorDashboard,
    refetch: refetchDashboard,
  } = useDashboard();

  const {
    data: followUps = [],
    isLoading: loadingFollowUps,
  } = useFollowUpLeads(dashboardData);

  const {
    data: recentBookings = [],
    isLoading: loadingBookings,
  } = useRecentBookings(dashboardData);

  const loading = loadingDashboard || loadingFollowUps || loadingBookings;

  if (loadingDashboard) return <LoadingSpinner text="Loading dashboard..." />;
  if (errorDashboard) return <ErrorState message="Unable to load dashboard data." onRetry={refetchDashboard} />;

  const raw = dashboardData || {};

  // Safe fallback counts extraction
  const summary = {
    totalLeads:      raw.totalLeads      ?? raw.summary?.totalLeads      ?? 0,
    newLeads:        raw.newLeads        ?? raw.summary?.newLeads        ?? 0,
    interestedLeads: raw.interestedLeads ?? raw.summary?.interestedLeads ?? 0,
    followUpsToday:  raw.followUpsToday  ?? raw.summary?.followUps       ?? raw.followUps ?? 0,
    totalBookings:   raw.totalBookings   ?? raw.summary?.bookings        ?? raw.bookedLeads ?? 0,
    contactedLeads:  raw.contactedLeads  ?? 0,
    siteVisitLeads:  raw.siteVisitLeads  ?? 0,
    negotiationLeads:raw.negotiationLeads?? 0,
    lostLeads:       raw.lostLeads       ?? 0,
  };

  const getStageCount = (stage) => {
    if (raw.stageCounts && raw.stageCounts[stage] !== undefined) {
      return Number(raw.stageCounts[stage]) || 0;
    }
    const fieldName = STAGE_FIELD_MAP[stage];
    if (fieldName && raw[fieldName] !== undefined) {
      return Number(raw[fieldName]) || 0;
    }
    return 0;
  };

  const maxStageCount = Math.max(...STAGES.map(getStageCount), 1);

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <span style={{ fontSize: '0.82rem', color: 'var(--clr-muted)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* ---- Summary Cards ---- */}
      <div className="row g-2 g-sm-3 mb-4">
        {[
          { label: 'Total Leads',      value: summary.totalLeads,      color: 'var(--clr-navy)' },
          { label: 'New Leads',        value: summary.newLeads,        color: '#0369a1' },
          { label: 'Interested',       value: summary.interestedLeads, color: '#065f46' },
          { label: 'Follow-ups Today', value: summary.followUpsToday,  color: 'var(--clr-orange)' },
          { label: 'Total Bookings',   value: summary.totalBookings,   color: '#166534' },
        ].map((card, idx) => (
          <div className={`col-6 col-sm-6 col-md-4 col-xl ${idx === 4 ? 'col-12 col-sm-6 col-md-4 col-xl' : ''}`} key={card.label}>
            <div className="stat-card">
              <div className="stat-label">{card.label}</div>
              <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        {/* Lead Pipeline */}
        <div className="col-12 col-lg-5">
          <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: 8 }}>
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h6 className="mb-0 fw-semibold" style={{ color: 'var(--clr-navy)' }}>Lead Pipeline</h6>
            </div>
            <div className="card-body px-4 py-3">
              {STAGES.map((stage) => {
                const count = getStageCount(stage);
                const pct = (count / maxStageCount) * 100;
                return (
                  <div className="pipeline-item" key={stage}>
                    <span className="pipeline-label">{stage}</span>
                    <div className="pipeline-bar-wrap">
                      <div
                        className="pipeline-bar"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: STAGE_COLORS[stage] || 'var(--clr-navy)',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                    <span className="pipeline-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Follow-ups */}
        <div className="col-12 col-lg-7">
          <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: 8 }}>
            <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-semibold" style={{ color: 'var(--clr-navy)' }}>Upcoming Follow-ups</h6>
              <Link to="/leads?filter=followup" className="btn btn-sm btn-outline-secondary" style={{ fontSize: '0.75rem' }}>
                View All
              </Link>
            </div>
            <div className="card-body p-0">
              {loadingFollowUps ? (
                <div className="p-3"><LoadingSpinner text="Loading follow-ups..." /></div>
              ) : followUps.length === 0 ? (
                <p className="text-center py-4" style={{ color: 'var(--clr-muted)', fontSize: '0.875rem' }}>
                  No upcoming follow-ups.
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Assigned To</th>
                        <th>Follow-up Date</th>
                        <th>Stage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {followUps.map((f, idx) => {
                        const id = f._id || f.id || idx;
                        const customerName = f.name || f.customerName || 'Lead';
                        const assigned = f.assignedTo?.name || f.assignedEmployee || (typeof f.assignedTo === 'string' ? f.assignedTo : '—');
                        return (
                          <tr key={id}>
                            <td>
                              <Link
                                to={`/leads/${f._id || f.id || ''}`}
                                style={{ color: 'var(--clr-blue)', textDecoration: 'none', fontWeight: 500 }}
                              >
                                {customerName}
                              </Link>
                            </td>
                            <td>{assigned}</td>
                            <td>{formatDate(f.followUpDate)}</td>
                            <td>
                              <LeadStageBadge stage={f.stage || 'New'} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: 8 }}>
        <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-semibold" style={{ color: 'var(--clr-navy)' }}>Recent Bookings</h6>
          <Link to="/bookings" className="btn btn-sm btn-outline-secondary" style={{ fontSize: '0.75rem' }}>
            View All
          </Link>
        </div>
        <div className="card-body p-0">
          {loadingBookings ? (
            <div className="p-3"><LoadingSpinner text="Loading bookings..." /></div>
          ) : recentBookings.length === 0 ? (
            <p className="text-center py-4" style={{ color: 'var(--clr-muted)', fontSize: '0.875rem' }}>
              No recent bookings.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Project</th>
                    <th>Unit</th>
                    <th>Price</th>
                    <th>Booking Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b, idx) => {
                    const id = b._id || b.id || idx;
                    const customer = b.leadId?.name || b.leadId?.customerName || b.customerName || '—';
                    const project = b.unitId?.buildingId?.projectId?.name || b.projectName || '—';
                    const unit = b.unitId?.unitNumber || b.unitId?.number || b.unitNumber || '—';
                    const price = b.unitId?.price ?? b.price ?? b.unitPrice ?? 0;
                    const date = b.bookingDate || b.createdAt;
                    return (
                      <tr key={id}>
                        <td className="fw-medium">{customer}</td>
                        <td>{project}</td>
                        <td>{unit}</td>
                        <td style={{ color: 'var(--clr-navy)', fontWeight: 600 }}>{formatPrice(price)}</td>
                        <td>{formatDate(date)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
