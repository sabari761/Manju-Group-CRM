import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../services/dashboardService';
import { getLeads } from '../services/leadService';
import { getBookings } from '../services/bookingService';
import { queryKeys } from './queryKeys';

/**
 * Fetches the main dashboard summary data.
 */
export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: async () => {
      const res = await getDashboard();
      const raw = res?.data?.data ?? res?.data ?? {};
      return raw;
    },
    staleTime: 60_000,
  });
}

/**
 * Fetches follow-up leads for the dashboard.
 * Falls back to the leads API if the dashboard doesn't include them.
 */
export function useFollowUpLeads(dashboardData) {
  return useQuery({
    queryKey: queryKeys.dashboard.followUps(),
    queryFn: async () => {
      if (
        Array.isArray(dashboardData?.upcomingFollowUps) &&
        dashboardData.upcomingFollowUps.length > 0
      ) {
        return dashboardData.upcomingFollowUps;
      }
      const leadsRes = await getLeads({ page: 1, limit: 10 });
      const leadsList =
        leadsRes?.data?.data ?? leadsRes?.data?.leads ?? leadsRes?.data ?? [];
      const safeLeads = Array.isArray(leadsList) ? leadsList : [];
      const withDate = safeLeads.filter((l) => l.followUpDate);
      return withDate.length > 0 ? withDate.slice(0, 5) : safeLeads.slice(0, 5);
    },
    enabled: dashboardData !== undefined,
    staleTime: 60_000,
  });
}

/**
 * Fetches recent bookings for the dashboard.
 * Falls back to the bookings API if the dashboard doesn't include them.
 */
export function useRecentBookings(dashboardData) {
  return useQuery({
    queryKey: queryKeys.dashboard.recentBookings(),
    queryFn: async () => {
      if (
        Array.isArray(dashboardData?.recentBookings) &&
        dashboardData.recentBookings.length > 0
      ) {
        return dashboardData.recentBookings;
      }
      const bookingsRes = await getBookings({ page: 1, limit: 5 });
      const bookingsList =
        bookingsRes?.data?.data ??
        bookingsRes?.data?.bookings ??
        bookingsRes?.data ??
        [];
      return Array.isArray(bookingsList) ? bookingsList.slice(0, 5) : [];
    },
    enabled: dashboardData !== undefined,
    staleTime: 60_000,
  });
}
