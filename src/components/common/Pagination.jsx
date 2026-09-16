import React from 'react';

/**
 * Reusable Bootstrap 5 Pagination component.
 *
 * Props:
 *  - page        {number}   Current active page (1-indexed)
 *  - totalPages  {number}   Total number of pages
 *  - total       {number}   Total record count (for the "Showing X–Y of Z" label)
 *  - limit       {number}   Records per page
 *  - onPageChange {func}   Called with the new page number
 *  - siblingCount {number} (optional) Pages shown either side of active, default 1
 */
export default function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  siblingCount = 1,
}) {
  // Always show the count label; only skip the nav when there's nothing to paginate
  if (!total) return null;

  // ─── Build page range with ellipsis ────────────────────────────────────────
  const range = (start, end) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const DOTS = '...';

  const buildPages = () => {
    const totalShown = siblingCount * 2 + 5; // siblings + first + last + 2 dots + current

    if (totalPages <= totalShown) {
      return range(1, totalPages);
    }

    const leftSibling  = Math.max(page - siblingCount, 1);
    const rightSibling = Math.min(page + siblingCount, totalPages);

    const showLeftDots  = leftSibling > 2;
    const showRightDots = rightSibling < totalPages - 1;

    if (!showLeftDots && showRightDots) {
      const leftCount = 3 + siblingCount * 2;
      return [...range(1, leftCount), DOTS, totalPages];
    }

    if (showLeftDots && !showRightDots) {
      const rightCount = 3 + siblingCount * 2;
      return [1, DOTS, ...range(totalPages - rightCount + 1, totalPages)];
    }

    return [1, DOTS, ...range(leftSibling, rightSibling), DOTS, totalPages];
  };

  const pages = buildPages();

  // ─── Label: "Showing 1–10 of 45" ───────────────────────────────────────────
  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  return (
    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-3 text-center text-sm-start">
      {/* Record count label — always visible */}
      <span style={{ fontSize: '0.82rem', color: 'var(--clr-muted)' }}>
        Showing <strong>{from}</strong>–<strong>{to}</strong> of{' '}
        <strong>{total}</strong>
      </span>

      {/* Bootstrap 5 pagination nav — only when more than 1 page */}
      {totalPages > 1 && (
        <nav aria-label="Page navigation" className="overflow-auto max-w-100">
          <ul className="pagination pagination-sm mb-0">
            {/* Previous */}
            <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                aria-label="Previous page"
              >
                ‹
              </button>
            </li>

            {/* Page numbers + dots */}
            {pages.map((p, idx) =>
              p === DOTS ? (
                <li key={`dots-${idx}`} className="page-item disabled">
                  <span className="page-link" style={{ pointerEvents: 'none' }}>
                    {DOTS}
                  </span>
                </li>
              ) : (
                <li
                  key={p}
                  className={`page-item${p === page ? ' active' : ''}`}
                >
                  <button
                    className="page-link"
                    onClick={() => onPageChange(p)}
                    aria-current={p === page ? 'page' : undefined}
                    style={
                      p === page
                        ? { backgroundColor: 'var(--clr-navy)', borderColor: 'var(--clr-navy)' }
                        : {}
                    }
                  >
                    {p}
                  </button>
                </li>
              )
            )}

            {/* Next */}
            <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                ›
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
