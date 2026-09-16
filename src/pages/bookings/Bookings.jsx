import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBookings, useCreateBooking } from '../../hooks/useBookings';
import BookingTable from '../../components/bookings/BookingTable';
import BookingForm from '../../components/bookings/BookingForm';
import BookingConfirmModal from '../../components/bookings/BookingConfirmModal';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';

const LIMIT = 10;

export default function Bookings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const prefillLeadId   = searchParams.get('leadId')   || '';
  const prefillLeadName = searchParams.get('leadName') || '';
  const urlSearch = searchParams.get('search') || '';
  const urlPage   = parseInt(searchParams.get('page'), 10) || 1;

  const [search, setSearch] = useState(urlSearch);
  const [page, setPage]     = useState(urlPage);

  // New Booking form / confirm modal
  const [showForm, setShowForm]       = useState(!!prefillLeadId);
  const [pendingData, setPendingData] = useState(null); // { formData, summary }

  // ── Queries ───────────────────────────────────────────────────────────────────
  const filters = {
    page,
    limit: LIMIT,
    ...(search?.trim() && { search: search.trim() }),
  };

  const { data, isLoading, isError, refetch } = useBookings(filters);

  const bookings   = data?.bookings   ?? [];
  const total      = data?.total      ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const createBooking = useCreateBooking();
  const confirmLoading = createBooking.isPending;

  // ── Search / page handlers ────────────────────────────────────────────────────
  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
    const newParams = {};
    if (prefillLeadId)   newParams.leadId   = prefillLeadId;
    if (prefillLeadName) newParams.leadName = prefillLeadName;
    if (val?.trim())     newParams.search   = val.trim();
    setSearchParams(newParams, { replace: true });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    const newParams = {};
    if (prefillLeadId)   newParams.leadId   = prefillLeadId;
    if (prefillLeadName) newParams.leadName = prefillLeadName;
    if (newPage > 1)     newParams.page     = newPage;
    if (search?.trim())  newParams.search   = search.trim();
    setSearchParams(newParams, { replace: true });
  };

  // Called when BookingForm submits → open confirm modal
  const handleFormSubmit = (formData, summary) => {
    setPendingData({ formData, summary });
  };

  // Final booking confirmation
  const handleConfirm = () => {
    if (!pendingData) return;
    createBooking.mutate(pendingData.formData, {
      onSuccess: () => {
        setPendingData(null);
        setShowForm(false);
      },
      onError: () => {
        setPendingData(null);
      },
    });
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
          {isLoading ? (
            <LoadingSpinner text="Loading bookings..." />
          ) : isError ? (
            <ErrorState message="Unable to load bookings." onRetry={refetch} />
          ) : (
            <>
              <BookingTable
                bookings={bookings}
                loading={isLoading}
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
