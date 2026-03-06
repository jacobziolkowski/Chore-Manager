type CalendarView = 'timeGridWeek' | 'timeGridDay' | 'listMonth';

interface Props {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onAddChore: () => void;
}

const VIEWS: { key: CalendarView; label: string }[] = [
  { key: 'timeGridWeek', label: 'Week' },
  { key: 'timeGridDay', label: 'Day' },
  { key: 'listMonth', label: 'Agenda' },
];

export default function Header({ view, onViewChange, onAddChore }: Props) {
  return (
    <header className="header">
      <div className="header-left">
        <span className="header-icon">🏠</span>
        <h1 className="header-title">Home Chores</h1>
      </div>
      <div className="header-center">
        <div className="view-switcher">
          {VIEWS.map(({ key, label }) => (
            <button
              key={key}
              className={`view-btn${view === key ? ' view-btn--active' : ''}`}
              onClick={() => onViewChange(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="header-right">
        <button className="btn-primary" onClick={onAddChore}>
          + Add Chore
        </button>
      </div>
    </header>
  );
}
