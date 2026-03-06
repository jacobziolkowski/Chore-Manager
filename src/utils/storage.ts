import { AppState } from '../types';

const KEY = 'office-chores-v1';
const DEFAULT: AppState = { chores: [], members: [], completions: [] };

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AppState) : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}
