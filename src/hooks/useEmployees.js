import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../services/employeeService';
import { queryKeys } from './queryKeys';

/**
 * Fetches a paginated, filtered list of employees.
 */
export function useEmployees(filters = {}) {
  return useQuery({
    queryKey: queryKeys.employees.list(filters),
    queryFn: async () => {
      const res = await getEmployees(filters);
      const raw = res.data?.data ?? res.data?.employees ?? res.data;
      return {
        employees: Array.isArray(raw) ? raw : [],
        total: res.data?.total ?? 0,
      };
    },
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}

/**
 * Mutation: Create an employee. Invalidates the employees list on success.
 */
export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createEmployee(data),
    onSuccess: () => {
      toast.success('Employee added successfully.');
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() });
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || 'Failed to add employee.'
      );
    },
  });
}

/**
 * Mutation: Update an employee. Invalidates the employees list on success.
 */
export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateEmployee(id, data),
    onSuccess: () => {
      toast.success('Employee updated successfully.');
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() });
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || 'Failed to update employee.'
      );
    },
  });
}

/**
 * Mutation: Delete an employee. Invalidates the employees list on success.
 */
export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteEmployee(id),
    onSuccess: () => {
      toast.success('Employee deleted successfully.');
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() });
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || 'Failed to delete employee.'
      );
    },
  });
}
