import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput, EventContentArg, DatesSetArg } from '@fullcalendar/core';
import { useRef, useEffect, useMemo, useState } from 'react';
import { Chore, ChoreCompletion, TeamMember } from '../types';
import { getOccurrences, formatDate, formatDuration } from '../utils/recurrence';

type CalendarView = 'timeGridWeek' | 'timeGridDay' | 'listMonth';

const PRIORITY_COLOR: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
};

interface EventMeta {
  choreId: string;
  occurrenceDate: string;
  isCompleted: boolean;
  isOverdue: boolean;
  priority: string;
  assigneeNames: string;
  duration: number;
}

interface Props {
  chores: Chore[];
  completions: ChoreCompletion[];
  members: TeamMember[];
  view: CalendarView;
  onDateClick: (date: string) => void;
  onEventClick: (choreId: string) => void;
  onToggleCompletion: (choreId: string, date: string) => void;
}

function buildEvents(
  chores: Chore[],
  completions: ChoreCompletion[],
  members: TeamMember[],
  rangeStart: Date,
  rangeEnd: Date
): EventInput[] {
  const today = formatDate(new Date());
  const events: EventInput[] = [];

  for (const chore of chores) {
    const occurrences = getOccurrences(chore, rangeStart, rangeEnd);
    for (const date of occurrences) {
      const isCompleted = completions.some(
        (c) => c.choreId === chore.id && c.occurrenceDate === date
      );
      const isOverdue = !isCompleted && date < today;
      const assigneeNames = chore.assigneeIds
        .map((id) => members.find((m) => m.id === id)?.name)
        .filter(Boolean)
        .join(', ');

      const color = isCompleted ? '#9ca3af' : PRIORITY_COLOR[chore.priority];

      events.push({
        id: `${chore.id}-${date}`,
        title: chore.title,
        start: date,
        allDay: true,
        backgroundColor: color,
        borderColor: isOverdue ? '#b91c1c' : color,
        extendedProps: {
          choreId: chore.id,
          occurrenceDate: date,
          isCompleted,
          isOverdue,
          priority: chore.priority,
          assigneeNames,
          duration: chore.duration,
        } satisfies EventMeta,
      });
    }
  }
  return events;
}

function EventContent({
  arg,
  onToggle,
}: {
  arg: EventContentArg;
  onToggle: (choreId: string, date: string) => void;
}) {
  const meta = arg.event.extendedProps as EventMeta;
  return (
    <div
      className={`chore-event${meta.isCompleted ? ' chore-event--done' : ''}${meta.isOverdue ? ' chore-event--overdue' : ''}`}
    >
      <button
        className="chore-event__check"
        title={meta.isCompleted ? 'Mark incomplete' : 'Mark complete'}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(meta.choreId, meta.occurrenceDate);
        }}
      >
        {meta.isCompleted ? '✓' : '○'}
      </button>
      <div className="chore-event__body">
        <div className="chore-event__title">{arg.event.title}</div>
        {meta.assigneeNames && (
          <div className="chore-event__meta">{meta.assigneeNames}</div>
        )}
        {meta.duration > 0 && (
          <div className="chore-event__meta">{formatDuration(meta.duration)}</div>
        )}
      </div>
    </div>
  );
}

export default function ChoreCalendar({
  chores,
  completions,
  members,
  view,
  onDateClick,
  onEventClick,
  onToggleCompletion,
}: Props) {
  const calRef = useRef<FullCalendar>(null);

  const [range, setRange] = useState<{ start: Date; end: Date }>(() => {
    const now = new Date();
    return {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end: new Date(now.getFullYear(), now.getMonth() + 3, 0),
    };
  });

  useEffect(() => {
    const api = calRef.current?.getApi();
    if (api && api.view.type !== view) {
      api.changeView(view);
    }
  }, [view]);

  const events = useMemo(
    () => buildEvents(chores, completions, members, range.start, range.end),
    [chores, completions, members, range]
  );

  return (
    <FullCalendar
      ref={calRef}
      plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
      initialView={view}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: '',
      }}
      events={events}
      allDaySlot={true}
      allDayText="Chores"
      dayMaxEvents={4}
      height="100%"
      dateClick={(arg) => onDateClick(formatDate(arg.date))}
      eventClick={(arg) => {
        const meta = arg.event.extendedProps as EventMeta;
        onEventClick(meta.choreId);
      }}
      datesSet={(arg: DatesSetArg) =>
        setRange({ start: arg.start, end: arg.end })
      }
      eventContent={(arg) => (
        <EventContent arg={arg} onToggle={onToggleCompletion} />
      )}
      nowIndicator={true}
      businessHours={true}
    />
  );
}
