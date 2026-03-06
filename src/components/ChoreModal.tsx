import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Chore, Priority, Recurrence, TeamMember } from '../types';
import { today } from '../utils/recurrence';

interface Props {
  chore?: Chore;
  defaultDate?: string;
  members: TeamMember[];
  onSave: (chore: Chore) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface FormState {
  title: string;
  description: string;
  duration: string;
  priority: Priority;
  assigneeIds: string[];
  recurrence: Recurrence;
  weekDays: number[];
  startDate: string;
  endDate: string;
}

function defaultForm(chore?: Chore, defaultDate?: string): FormState {
  if (chore) {
    return {
      title: chore.title,
      description: chore.description,
      duration: chore.duration > 0 ? String(chore.duration) : '',
      priority: chore.priority,
      assigneeIds: [...chore.assigneeIds],
      recurrence: chore.recurrence,
      weekDays: [...chore.weekDays],
      startDate: chore.startDate,
      endDate: chore.endDate,
    };
  }
  return {
    title: '',
    description: '',
    duration: '',
    priority: 'medium',
    assigneeIds: [],
    recurrence: 'none',
    weekDays: [],
    startDate: defaultDate ?? today(),
    endDate: '',
  };
}

export default function ChoreModal({
  chore,
  defaultDate,
  members,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [form, setForm] = useState<FormState>(() => defaultForm(chore, defaultDate));
  const [error, setError] = useState('');

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleAssignee(id: string) {
    setForm((f) => ({
      ...f,
      assigneeIds: f.assigneeIds.includes(id)
        ? f.assigneeIds.filter((a) => a !== id)
        : [...f.assigneeIds, id],
    }));
  }

  function toggleWeekDay(day: number) {
    setForm((f) => ({
      ...f,
      weekDays: f.weekDays.includes(day)
        ? f.weekDays.filter((d) => d !== day)
        : [...f.weekDays, day],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!form.startDate) {
      setError('Start date is required.');
      return;
    }
    if (form.recurrence === 'weekly' && form.weekDays.length === 0) {
      setError('Select at least one day for weekly recurrence.');
      return;
    }

    const saved: Chore = {
      id: chore?.id ?? uuidv4(),
      title: form.title.trim(),
      description: form.description.trim(),
      duration: form.duration ? parseInt(form.duration, 10) : 0,
      priority: form.priority,
      assigneeIds: form.assigneeIds,
      recurrence: form.recurrence,
      weekDays: form.recurrence === 'weekly' ? form.weekDays : [],
      startDate: form.startDate,
      endDate: form.recurrence !== 'none' ? form.endDate : '',
    };
    onSave(saved);
  }

  const isEditing = Boolean(chore);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? 'Edit Chore' : 'New Chore'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                className="form-input"
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. Clean kitchen sink"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input form-textarea"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Optional notes…"
                rows={2}
              />
            </div>

            <div className="form-row">
              <div className="form-group form-group--half">
                <label className="form-label">Duration (minutes)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  value={form.duration}
                  onChange={(e) => set('duration', e.target.value)}
                  placeholder="e.g. 30"
                />
              </div>
              <div className="form-group form-group--half">
                <label className="form-label">Priority</label>
                <select
                  className="form-input"
                  value={form.priority}
                  onChange={(e) => set('priority', e.target.value as Priority)}
                >
                  <option value="high">🔴 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>
            </div>

            {members.length > 0 && (
              <div className="form-group">
                <label className="form-label">Assign to</label>
                <div className="assignee-grid">
                  {members.map((m) => (
                    <label key={m.id} className="assignee-chip">
                      <input
                        type="checkbox"
                        checked={form.assigneeIds.includes(m.id)}
                        onChange={() => toggleAssignee(m.id)}
                      />
                      <span>{m.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Recurrence</label>
              <select
                className="form-input"
                value={form.recurrence}
                onChange={(e) => set('recurrence', e.target.value as Recurrence)}
              >
                <option value="none">One-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            {form.recurrence === 'weekly' && (
              <div className="form-group">
                <label className="form-label">On these days</label>
                <div className="weekday-grid">
                  {DAY_LABELS.map((label, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`weekday-btn${form.weekDays.includes(i) ? ' weekday-btn--active' : ''}`}
                      onClick={() => toggleWeekDay(i)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group form-group--half">
                <label className="form-label">
                  {form.recurrence === 'none' ? 'Date *' : 'Start date *'}
                </label>
                <input
                  className="form-input"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => set('startDate', e.target.value)}
                />
              </div>
              {form.recurrence !== 'none' && (
                <div className="form-group form-group--half">
                  <label className="form-label">End date (optional)</label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.endDate}
                    min={form.startDate}
                    onChange={(e) => set('endDate', e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            {isEditing && onDelete && (
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  if (confirm('Delete this chore and all its history?')) {
                    onDelete(chore!.id);
                  }
                }}
              >
                Delete
              </button>
            )}
            <div className="modal-footer__actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {isEditing ? 'Save Changes' : 'Create Chore'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
