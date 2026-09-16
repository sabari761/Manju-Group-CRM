import React from 'react';

const STAGE_MAP = {
  New:         { cls: 'badge-new',         label: 'New' },
  Contacted:   { cls: 'badge-contacted',   label: 'Contacted' },
  'Site Visit':{ cls: 'badge-sitevisit',   label: 'Site Visit' },
  Interested:  { cls: 'badge-interested',  label: 'Interested' },
  Negotiation: { cls: 'badge-negotiation', label: 'Negotiation' },
  Booked:      { cls: 'badge-booked',      label: 'Booked' },
  Lost:        { cls: 'badge-lost',        label: 'Lost' },
};

export default function LeadStageBadge({ stage }) {
  const s = STAGE_MAP[stage] || { cls: 'badge-new', label: stage };
  return <span className={`badge-stage ${s.cls}`}>{s.label}</span>;
}

export const STAGES = Object.keys(STAGE_MAP);
