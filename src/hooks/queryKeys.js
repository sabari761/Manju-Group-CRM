/**
 * Centralized query key factory for TanStack React Query.
 * Consistent keys ensure proper cache invalidation across the app.
 */

export const queryKeys = {
  // ── Dashboard ──────────────────────────────────────────────────────────────
  dashboard: {
    all: ['dashboard'],
    summary: () => ['dashboard', 'summary'],
    followUps: () => ['dashboard', 'followUps'],
    recentBookings: () => ['dashboard', 'recentBookings'],
  },

  // ── Leads ──────────────────────────────────────────────────────────────────
  leads: {
    all: ['leads'],
    lists: () => ['leads', 'list'],
    list: (filters) => ['leads', 'list', filters],
    details: () => ['leads', 'detail'],
    detail: (id) => ['leads', 'detail', id],
  },

  // ── Employees ──────────────────────────────────────────────────────────────
  employees: {
    all: ['employees'],
    lists: () => ['employees', 'list'],
    list: (filters) => ['employees', 'list', filters],
  },

  // ── Projects (Properties) ──────────────────────────────────────────────────
  projects: {
    all: ['projects'],
    lists: () => ['projects', 'list'],
    list: (filters) => ['projects', 'list', filters],
    details: () => ['projects', 'detail'],
    detail: (id) => ['projects', 'detail', id],
  },

  // ── Buildings ──────────────────────────────────────────────────────────────
  buildings: {
    all: ['buildings'],
    byProject: (projectId) => ['buildings', 'project', projectId],
  },

  // ── Units ──────────────────────────────────────────────────────────────────
  units: {
    all: ['units'],
    byBuilding: (buildingId) => ['units', 'building', buildingId],
  },

  // ── Bookings ──────────────────────────────────────────────────────────────
  bookings: {
    all: ['bookings'],
    lists: () => ['bookings', 'list'],
    list: (filters) => ['bookings', 'list', filters],
    detail: (id) => ['bookings', 'detail', id],
  },
};
