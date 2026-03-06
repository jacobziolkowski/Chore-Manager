import { Chore } from '../types';

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function today(): string {
  return formatDate(new Date());
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Returns all occurrence dates (YYYY-MM-DD) for a chore within [rangeStart, rangeEnd] */
export function getOccurrences(chore: Chore, rangeStart: Date, rangeEnd: Date): string[] {
  const choreStart = parseDate(chore.startDate);
  const choreEnd = chore.endDate ? parseDate(chore.endDate) : null;

  const effectiveEnd = choreEnd
    ? new Date(Math.min(choreEnd.getTime(), rangeEnd.getTime()))
    : rangeEnd;

  if (choreStart > effectiveEnd) return [];

  const occurrences: string[] = [];

  if (chore.recurrence === 'none') {
    if (choreStart >= rangeStart && choreStart <= rangeEnd) {
      occurrences.push(chore.startDate);
    }
    return occurrences;
  }

  // Start iterating from the later of: chore start date, range start
  const iterStart = choreStart > rangeStart ? choreStart : new Date(rangeStart);

  if (chore.recurrence === 'daily') {
    const cursor = new Date(iterStart);
    while (cursor <= effectiveEnd) {
      occurrences.push(formatDate(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return occurrences;
  }

  if (chore.recurrence === 'weekly') {
    const days =
      chore.weekDays && chore.weekDays.length > 0
        ? chore.weekDays
        : [choreStart.getDay()];
    const cursor = new Date(iterStart);
    while (cursor <= effectiveEnd) {
      if (days.includes(cursor.getDay())) {
        occurrences.push(formatDate(cursor));
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return occurrences;
  }

  return occurrences;
}
