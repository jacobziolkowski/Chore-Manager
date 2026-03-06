export type Priority = 'high' | 'medium' | 'low';
export type Recurrence = 'none' | 'daily' | 'weekly';

export interface TeamMember {
  id: string;
  name: string;
}

export interface Chore {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  priority: Priority;
  assigneeIds: string[];
  recurrence: Recurrence;
  weekDays: number[]; // 0=Sun..6=Sat, used when recurrence === 'weekly'
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD, '' means no end
}

export interface ChoreCompletion {
  id: string;
  choreId: string;
  occurrenceDate: string; // YYYY-MM-DD
  completedAt: string; // ISO datetime
}

export interface AppState {
  chores: Chore[];
  members: TeamMember[];
  completions: ChoreCompletion[];
}
