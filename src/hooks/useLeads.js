import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
} from '../services/leadService';
import { queryKeys } from './queryKeys';

/**
 * Fetches a paginated, filtered list of leads.
 */
export function useLeads(filters = {}) {
  return useQuery({
    queryKey: queryKeys.leads.list(filters),
    queryFn: async () => {
      const res = await getLeads(filters);
      const raw = res.data?.data ?? res.data?.leads ?? res.data;
      return {
        leads: Array.isArray(raw) ? raw : [],
        total: res.data?.total ?? 0,
        totalPages: res.data?.totalPages ?? 1,
      };
    },
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

/**
 * Fetches a single lead by ID.
 */
export function useLeadById(id) {
  return useQuery({
    queryKey: queryKeys.leads.detail(id),
    queryFn: async () => {
      const res = await getLeadById(id);
      return res.data?.lead || res.data?.data || res.data;
    },
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

/**
 * Mutation: Create a lead. Invalidates the leads list on success.
 */
export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createLead(data),
    onSuccess: () => {
      toast.success('Lead created successfully.');
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create lead.');
    },
  });
}

/**
 * Mutation: Update a lead. Invalidates the list and the detail on success.
 */
export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateLead(id, data),
    onSuccess: (_data, variables) => {
      toast.success('Lead updated successfully.');
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.leads.detail(variables.id),
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update lead.');
    },
  });
}

/**
 * Mutation: Delete a lead. Invalidates the leads list on success.
 */
export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteLead(id),
    onSuccess: () => {
      toast.success('Lead deleted successfully.');
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete lead.');
    },
  });
}
