import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppState, Chore, ChoreCompletion, TeamMember } from './types';
import { loadState, saveState } from './utils/storage';
import { today } from './utils/recurrence';
import Header from './components/Header';
import ChoreCalendar from './components/ChoreCalendar';
import Sidebar from './components/Sidebar';
import ChoreModal from './components/ChoreModal';

type CalendarView = 'timeGridWeek' | 'timeGridDay' | 'listMonth';

type ModalState =
  | { type: 'closed' }
  | { type: 'add'; date: string }
  | { type: 'edit'; choreId: string };

export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [modal, setModal] = useState<ModalState>({ type: 'closed' });
  const [calendarView, setCalendarView] = useState<CalendarView>('timeGridWeek');

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addMember = useCallback((name: string) => {
    const member: TeamMember = { id: uuidv4(), name: name.trim() };
    setState((s) => ({ ...s, members: [...s.members, member] }));
  }, []);

  const removeMember = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      members: s.members.filter((m) => m.id !== id),
      chores: s.chores.map((c) => ({
        ...c,
        assigneeIds: c.assigneeIds.filter((aid) => aid !== id),
      })),
    }));
  }, []);

  const saveChore = useCallback(
    (chore: Chore) => {
      setState((s) => {
        const exists = s.chores.some((c) => c.id === chore.id);
        return {
          ...s,
          chores: exists
            ? s.chores.map((c) => (c.id === chore.id ? chore : c))
            : [...s.chores, chore],
        };
      });
      setModal({ type: 'closed' });
    },
    []
  );

  const deleteChore = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      chores: s.chores.filter((c) => c.id !== id),
      completions: s.completions.filter((comp) => comp.choreId !== id),
    }));
    setModal({ type: 'closed' });
  }, []);

  const toggleCompletion = useCallback(
    (choreId: string, occurrenceDate: string) => {
      setState((s) => {
        const existing = s.completions.find(
          (c) => c.choreId === choreId && c.occurrenceDate === occurrenceDate
        );
        if (existing) {
          return {
            ...s,
            completions: s.completions.filter((c) => c.id !== existing.id),
          };
        }
        const newCompletion: ChoreCompletion = {
          id: uuidv4(),
          choreId,
          occurrenceDate,
          completedAt: new Date().toISOString(),
        };
        return { ...s, completions: [...s.completions, newCompletion] };
      });
    },
    []
  );

  const editingChore =
    modal.type === 'edit'
      ? state.chores.find((c) => c.id === modal.choreId)
      : undefined;

  return (
    <div className="app">
      <Header
        view={calendarView}
        onViewChange={setCalendarView}
        onAddChore={() => setModal({ type: 'add', date: today() })}
      />
      <div className="app-body">
        <div className="calendar-area">
          <ChoreCalendar
            chores={state.chores}
            completions={state.completions}
            members={state.members}
            view={calendarView}
            onDateClick={(date) => setModal({ type: 'add', date })}
            onEventClick={(choreId) => setModal({ type: 'edit', choreId })}
            onToggleCompletion={toggleCompletion}
          />
        </div>
        <div className="sidebar-area">
          <Sidebar
            chores={state.chores}
            members={state.members}
            completions={state.completions}
            onEditChore={(id) => setModal({ type: 'edit', choreId: id })}
            onAddMember={addMember}
            onRemoveMember={removeMember}
            onAddChore={() => setModal({ type: 'add', date: today() })}
          />
        </div>
      </div>
      {modal.type !== 'closed' && (
        <ChoreModal
          chore={editingChore}
          defaultDate={modal.type === 'add' ? modal.date : undefined}
          members={state.members}
          onSave={saveChore}
          onDelete={editingChore ? deleteChore : undefined}
          onClose={() => setModal({ type: 'closed' })}
        />
      )}
    </div>
  );
}
