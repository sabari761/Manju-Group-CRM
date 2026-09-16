import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  getBuildings,
  createBuilding,
  updateBuilding,
  deleteBuilding,
} from '../services/propertyService';
import { queryKeys } from './queryKeys';

/**
 * Fetches all buildings for a given project.
 */
export function useBuildings(projectId) {
  return useQuery({
    queryKey: queryKeys.buildings.byProject(projectId),
    queryFn: async () => {
      const r = await getBuildings(projectId);
      const raw = r.data?.data ?? r.data?.buildings ?? r.data;
      return Array.isArray(raw) ? raw : [];
    },
    enabled: Boolean(projectId),
    staleTime: 30_000,
  });
}

/**
 * Mutation: Create a building under a project. Invalidates buildings for that project.
 */
export function useCreateBuilding(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createBuilding(projectId, data),
    onSuccess: () => {
      toast.success('Building added successfully.');
      queryClient.invalidateQueries({
        queryKey: queryKeys.buildings.byProject(projectId),
      });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to add building.');
    },
  });
}

/**
 * Mutation: Update a building. Invalidates buildings for the parent project.
 */
export function useUpdateBuilding(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateBuilding(id, data),
    onSuccess: () => {
      toast.success('Building updated successfully.');
      queryClient.invalidateQueries({
        queryKey: queryKeys.buildings.byProject(projectId),
      });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to update building.');
    },
  });
}

/**
 * Mutation: Delete a building. Invalidates buildings for the parent project.
 */
export function useDeleteBuilding(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteBuilding(id),
    onSuccess: () => {
      toast.success('Building deleted successfully.');
      queryClient.invalidateQueries({
        queryKey: queryKeys.buildings.byProject(projectId),
      });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to delete building.');
    },
  });
}
