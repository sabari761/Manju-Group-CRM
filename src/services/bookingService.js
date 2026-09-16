import api from './api';

export const getBookings    = (params)   => api.get('/bookings', { params });
export const createBooking  = (data)     => api.post('/bookings', data);
export const getBookingById = (id)       => api.get(`/bookings/${id}`);

