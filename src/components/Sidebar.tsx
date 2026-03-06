import { useState } from 'react';
import { Chore, ChoreCompletion, TeamMember } from '../types';
import { formatDuration, today } from '../utils/recurrence';

interface Props {
  chores: Chore[];
  members: TeamMember[];
  completions: ChoreCompletion[];
  onEditChore: (id: string) => void;
  onAddMember: (name: string) => void;
  onRemoveMember: (id: string) => void;
  onAddChore: () => void;
}

const PRIORITY_LABEL: Record<string, string> = {
  high: 'High',
  medium: 'Med',
  low: 'Low',
};


const RECURRENCE_LABEL: Record<string, string> = {
  none: 'Once',
  daily: 'Daily',
  weekly: 'Weekly',
};

type Tab = 'chores' | 'team';

export default function Sidebar({
  chores,
  members,
  completions,
  onEditChore,
  onAddMember,
  onRemoveMember,
  onAddChore,
}: Props) {
  const [tab, setTab] = useState<Tab>('chores');
  const [newMemberName, setNewMemberName] = useState('');

  function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    const name = newMemberName.trim();
    if (name) {
      onAddMember(name);
      setNewMemberName('');
    }
  }

  const todayStr = today();

  return (
    <div className="sidebar">
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab${tab === 'chores' ? ' sidebar-tab--active' : ''}`}
          onClick={() => setTab('chores')}
        >
          Chores ({chores.length})
        </button>
        <button
          className={`sidebar-tab${tab === 'team' ? ' sidebar-tab--active' : ''}`}
          onClick={() => setTab('team')}
        >
          Household ({members.length})
        </button>
      </div>

      {tab === 'chores' && (
        <div className="sidebar-content">
          <button className="btn-primary btn-block" onClick={onAddChore}>
            + New Chore
          </button>
          {chores.length === 0 ? (
            <div className="sidebar-empty">No chores yet. Add one!</div>
          ) : (
            <ul className="chore-list">
              {chores.map((chore) => {
                const assigneeNames = chore.assigneeIds
                  .map((id) => members.find((m) => m.id === id)?.name)
                  .filter(Boolean)
                  .join(', ');
                const todayDone = completions.some(
                  (c) =>
                    c.choreId === chore.id && c.occurrenceDate === todayStr
                );
                return (
                  <li key={chore.id} className="chore-item">
                    <div className="chore-item__header">
                      <span className={`priority-badge priority-badge--${chore.priority}`}>
                        {PRIORITY_LABEL[chore.priority]}
                      </span>
                      <span className="chore-item__title">{chore.title}</span>
                      {todayDone && (
                        <span className="done-badge" title="Done today">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="chore-item__meta">
                      <span>{RECURRENCE_LABEL[chore.recurrence]}</span>
                      {chore.duration > 0 && (
                        <span>{formatDuration(chore.duration)}</span>
                      )}
                      {assigneeNames && <span>{assigneeNames}</span>}
                    </div>
                    <button
                      className="chore-item__edit"
                      onClick={() => onEditChore(chore.id)}
                    >
                      Edit
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {tab === 'team' && (
        <div className="sidebar-content">
          <form className="add-member-form" onSubmit={handleAddMember}>
            <input
              className="form-input"
              type="text"
              placeholder="Household member name…"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
            />
            <button className="btn-primary" type="submit">
              Add
            </button>
          </form>
          {members.length === 0 ? (
            <div className="sidebar-empty">No household members yet.</div>
          ) : (
            <ul className="member-list">
              {members.map((m) => {
                const assigned = chores.filter((c) =>
                  c.assigneeIds.includes(m.id)
                ).length;
                return (
                  <li key={m.id} className="member-item">
                    <div className="member-avatar">{m.name[0].toUpperCase()}</div>
                    <div className="member-info">
                      <div className="member-name">{m.name}</div>
                      <div className="member-meta">
                        {assigned} chore{assigned !== 1 ? 's' : ''} assigned
                      </div>
                    </div>
                    <button
                      className="member-remove"
                      title="Remove member"
                      onClick={() => {
                        if (
                          confirm(
                            `Remove ${m.name}? They will be unassigned from all chores.`
                          )
                        ) {
                          onRemoveMember(m.id);
                        }
                      }}
                    >
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
