import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../services/propertyService';
import { queryKeys } from './queryKeys';

/**
 * Fetches a paginated, filtered list of projects.
 */
export function useProjects(filters = {}) {
  return useQuery({
    queryKey: queryKeys.projects.list(filters),
    queryFn: async () => {
      const res = await getProjects(filters);
      const raw = res.data?.data ?? res.data?.projects ?? res.data;
      const list = Array.isArray(raw) ? raw : [];
      return {
        projects: list,
        total: res.data?.total ?? list.length ?? 0,
        totalPages:
          res.data?.totalPages ??
          Math.max(
            Math.ceil((res.data?.total ?? list.length) / (filters.limit || 10)),
            1
          ),
      };
    },
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

/**
 * Fetches a single project by ID.
 */
export function useProject(id) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: async () => {
      const res = await getProject(id);
      return res.data?.data || res.data?.project || res.data;
    },
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

/**
 * Mutation: Create a project. Invalidates the projects list on success.
 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createProject(data),
    onSuccess: () => {
      toast.success('Project created successfully.');
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create project.');
    },
  });
}

/**
 * Mutation: Update a project. Invalidates list and detail on success.
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateProject(id, data),
    onSuccess: (_data, variables) => {
      toast.success('Project updated successfully.');
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(variables.id),
      });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to update project.');
    },
  });
}

/**
 * Mutation: Delete a project. Invalidates the projects list on success.
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteProject(id),
    onSuccess: () => {
      toast.success('Project deleted successfully.');
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to delete project.');
    },
  });
}
