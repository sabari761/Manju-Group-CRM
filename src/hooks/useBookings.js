import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getBookings, createBooking } from '../services/bookingService';
import { queryKeys } from './queryKeys';

/**
 * Fetches a paginated, filtered list of bookings.
 */
export function useBookings(filters = {}) {
  return useQuery({
    queryKey: queryKeys.bookings.list(filters),
    queryFn: async () => {
      const res = await getBookings(filters);
      const raw = res.data?.data ?? res.data?.bookings ?? res.data;
      const list = Array.isArray(raw) ? raw : [];
      return {
        bookings: list,
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
 * Mutation: Create a booking. Invalidates the bookings list on success.
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createBooking(data),
    onSuccess: () => {
      toast.success('Booking confirmed successfully.');
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      // Also invalidate units so availability status updates
      queryClient.invalidateQueries({ queryKey: queryKeys.units.all });
    },
    onError: (err) => {
      const status = err.response?.status;
      if (status === 409) {
        toast.error(
          'This unit has already been booked. Please select another available unit.'
        );
      } else {
        toast.error(
          err.response?.data?.message || 'Booking failed. Please try again.'
        );
      }
    },
  });
}
