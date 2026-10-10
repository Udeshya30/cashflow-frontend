import { getTodayInputValue } from './dates.js';

export function getNextKnownDate(caseItem, today = getTodayInputValue()) {
  const dates = (caseItem.diary_entries ?? [])
    .map((entry) => entry.entry_date)
    .filter((entryDate) => entryDate >= today)
    .sort();

  return dates[0] ?? null;
}

export function getRelevantDiaryEntry(caseItem, today = getTodayInputValue()) {
  const entries = [...(caseItem.diary_entries ?? [])].sort((first, second) => {
    if (first.entry_date === second.entry_date) {
      return first.id - second.id;
    }
    return first.entry_date.localeCompare(second.entry_date);
  });

  if (!entries.length) {
    return null;
  }

  const currentOrPastEntries = entries.filter((entry) => entry.entry_date <= today);
  return currentOrPastEntries.at(-1) ?? entries.at(-1);
}

export function needsNextDate(caseItem, today = getTodayInputValue()) {
  const relevantEntry = getRelevantDiaryEntry(caseItem, today);
  return !relevantEntry || !relevantEntry.next_date;
}
