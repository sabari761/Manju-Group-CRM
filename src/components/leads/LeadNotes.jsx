import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { addNote, updateLead } from '../../services/leadService';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/formatters';

export default function LeadNotes({ leadId, notes, onNoteAdded }) {
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { note: '' },
  });

  // Safe fallback: normalize notes into an array whether it is:
  // - an array of note objects
  // - an array of strings
  // - a single string (e.g. "N/A" or "Client requested followup")
  // - null or undefined
  const safeNotesList = Array.isArray(notes)
    ? notes
    : typeof notes === 'string' && notes.trim() && notes.trim().toUpperCase() !== 'N/A'
    ? [{ id: 'note-0', note: notes.trim() }]
    : [];

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      try {
        await addNote(leadId, { note: data.note });
      } catch (err) {
        // If /api/leads/:id/notes endpoint is not available, fallback to updating lead.notes directly
        if (err?.response?.status === 404) {
          await updateLead(leadId, { notes: data.note });
        } else {
          throw err;
        }
      }
      toast.success('Note saved successfully.');
      reset();
      if (onNoteAdded) onNoteAdded();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add note.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Notes List */}
      <div className="mb-3">
        {safeNotesList.length === 0 ? (
          <p style={{ color: 'var(--clr-muted)', fontSize: '0.875rem' }}>No notes yet.</p>
        ) : (
          <ul className="list-unstyled mb-0">
            {safeNotesList?.map((n, i) => {
              const text = typeof n === 'string' ? n : (n?.note || n?.text || n?.content || '—');
              const date = typeof n === 'object' ? (n?.createdAt || n?.date) : null;
              const author = typeof n === 'object' ? (n?.author?.name || n?.author) : null;

              return (
                <li
                  key={n?.id || n?._id || i}
                  className="mb-2 pb-2"
                  style={{ borderBottom: '1px solid var(--clr-border)', fontSize: '0.875rem' }}
                >
                  <div style={{ color: 'var(--clr-text)' }}>{text}</div>
                  {date && (
                    <div style={{ color: 'var(--clr-muted)', fontSize: '0.75rem', marginTop: 2 }}>
                      {formatDate(date)}
                      {author && ` · ${author}`}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Add Note Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-2">
          <label htmlFor="note-input" className="form-label">
            Add Note
          </label>
          <Controller
            name="note"
            control={control}
            rules={{ required: 'Note cannot be empty.' }}
            render={({ field }) => (
              <textarea
                {...field}
                id="note-input"
                className={`form-control${errors.note ? ' is-invalid' : ''}`}
                rows={3}
                placeholder="Type your note here..."
              />
            )}
          />
          {errors.note && <div className="invalid-feedback">{errors.note.message}</div>}
        </div>
        <button
          type="submit"
          className="btn btn-navy btn-sm"
          id="add-note-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" role="status" />
              Adding...
            </>
          ) : (
            'Add Note'
          )}
        </button>
      </form>
    </div>
  );
}
