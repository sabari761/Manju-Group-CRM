import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getBookings, createBooking } from '../../services/bookingService';
import BookingTable from '../../components/bookings/BookingTable';
import BookingForm from '../../components/bookings/BookingForm';
import BookingConfirmModal from '../../components/bookings/BookingConfirmModal';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';

export default function Bookings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const prefillLeadId = searchParams.get('leadId') || '';
  const prefillLeadName = searchParams.get('leadName') || '';
  const urlSearch = searchParams.get('search') || '';
  const urlPage = parseInt(searchParams.get('page'), 10) || 1;

  const [search, setSearch] = useState(urlSearch);
  const [page, setPage] = useState(urlPage);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  // New Booking form / modal states
  const [showForm, setShowForm] = useState(!!prefillLeadId);
  const [pendingData, setPendingData] = useState(null); // { formData, summary }
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: LIMIT };
      if (search?.trim()) {
        params.search = search.trim();
      }
      const res = await getBookings(params);
      // Response: { success, data: [], total, page, limit, totalPages }
      const raw = res.data?.data ?? res.data?.bookings ?? res.data;
      const list = Array.isArray(raw) ? raw : [];
      setBookings(list);
      setTotal(res.data?.total ?? list.length ?? 0);
      setTotalPages(
        res.data?.totalPages ?? Math.max(Math.ceil((res.data?.total ?? list.length) / LIMIT), 1)
      );
    } catch {
      setError('Unable to load bookings.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Handle search and synchronize query parameter in URL
  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
    const newParams = {};
    if (prefillLeadId) newParams.leadId = prefillLeadId;
    if (prefillLeadName) newParams.leadName = prefillLeadName;
    if (val?.trim()) newParams.search = val.trim();
    setSearchParams(newParams, { replace: true });
  };

  // Handle page change and synchronize query parameter in URL
  const handlePageChange = (newPage) => {
    setPage(newPage);
    const newParams = {};
    if (prefillLeadId) newParams.leadId = prefillLeadId;
    if (prefillLeadName) newParams.leadName = prefillLeadName;
    if (newPage > 1) newParams.page = newPage;
    if (search?.trim()) newParams.search = search.trim();
    setSearchParams(newParams, { replace: true });
  };

  // Called when BookingForm is submitted → open confirm modal
  const handleFormSubmit = (formData, summary) => {
    setPendingData({ formData, summary });
  };

  // Final booking confirmation
  const handleConfirm = async () => {
    if (!pendingData) return;
    setConfirmLoading(true);
    try {
      await createBooking(pendingData.formData);
      toast.success('Booking confirmed successfully.');
      setPendingData(null);
      setShowForm(false);
      fetchBookings();
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        toast.error('This unit has already been booked. Please select another available unit.');
        setPendingData(null);
      } else {
        toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
      }
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Bookings">
        {!showForm && (
          <button
            className="btn btn-navy btn-sm"
            id="new-booking-btn"
            onClick={() => setShowForm(true)}
          >
            + New Booking
          </button>
        )}
        {showForm && (
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setShowForm(false)}
          >
            ← Back to List
          </button>
        )}
      </PageHeader>

      {/* Search Bar */}
      {!showForm && (
        <div className="mb-3">
          <SearchInput
            id="bookings-search"
            value={search}
            onChange={handleSearch}
            placeholder="Search by customer, project, unit..."
            style={{ maxWidth: 360 }}
          />
        </div>
      )}

      {showForm ? (
        <div className="card border-0 shadow-sm" style={{ borderRadius: 8 }}>
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h6 className="mb-0 fw-semibold" style={{ color: 'var(--clr-navy)' }}>
              New Booking
            </h6>
          </div>
          <div className="card-body px-4 py-3">
            <BookingForm
              prefillLeadId={prefillLeadId}
              prefillLeadName={prefillLeadName}
              onSubmit={handleFormSubmit}
              loading={confirmLoading}
            />
          </div>
        </div>
      ) : (
        <>
          {loading ? (
            <LoadingSpinner text="Loading bookings..." />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchBookings} />
          ) : (
            <>
              <BookingTable
                bookings={bookings}
                loading={loading}
                page={page}
                limit={LIMIT}
                search={search}
              />
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={LIMIT}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </>
      )}

      {/* Confirmation Modal for New Booking */}
      <BookingConfirmModal
        show={!!pendingData}
        booking={pendingData?.summary}
        onConfirm={handleConfirm}
        onCancel={() => setPendingData(null)}
        loading={confirmLoading}
      />
    </div>
  );
}
