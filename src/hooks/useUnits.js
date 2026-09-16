import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  getUnits,
  createUnit,
  updateUnit,
  deleteUnit,
} from '../services/propertyService';
import { queryKeys } from './queryKeys';

/**
 * Fetches all units for a given building.
 */
export function useUnits(buildingId) {
  return useQuery({
    queryKey: queryKeys.units.byBuilding(buildingId),
    queryFn: async () => {
      const r = await getUnits(buildingId);
      const raw = r.data?.data ?? r.data?.units ?? r.data;
      return Array.isArray(raw) ? raw : [];
    },
    enabled: Boolean(buildingId),
    staleTime: 30_000,
  });
}

/**
 * Mutation: Create a unit under a building. Invalidates units for that building.
 */
export function useCreateUnit(buildingId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createUnit(buildingId, data),
    onSuccess: () => {
      toast.success('Unit added successfully.');
      queryClient.invalidateQueries({
        queryKey: queryKeys.units.byBuilding(buildingId),
      });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to add unit.');
    },
  });
}

/**
 * Mutation: Update a unit. Invalidates units for the parent building.
 */
export function useUpdateUnit(buildingId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateUnit(id, data),
    onSuccess: () => {
      toast.success('Unit updated successfully.');
      queryClient.invalidateQueries({
        queryKey: queryKeys.units.byBuilding(buildingId),
      });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to update unit.');
    },
  });
}

/**
 * Mutation: Delete a unit. Invalidates units for the parent building.
 */
export function useDeleteUnit(buildingId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteUnit(id),
    onSuccess: () => {
      toast.success('Unit deleted successfully.');
      queryClient.invalidateQueries({
        queryKey: queryKeys.units.byBuilding(buildingId),
      });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to delete unit.');
    },
  });
}
