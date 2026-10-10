export function formatDate(value) {
  if (!value) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

export function formatDateTime(value) {
  if (!value) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function getTodayInputValue() {
  return toInputDate(new Date());
}

export function parseInputDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toInputDate(value) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(value, days) {
  const nextDate = new Date(value);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function addMonths(value, months) {
  const nextDate = new Date(value);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
}

export function startOfWeek(value) {
  const date = new Date(value);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return addDays(date, mondayOffset);
}

export function endOfWeek(value) {
  return addDays(startOfWeek(value), 6);
}

export function startOfMonth(value) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

export function endOfMonth(value) {
  return new Date(value.getFullYear(), value.getMonth() + 1, 0);
}

export function getDateRange(rangeType, anchorDateValue, customStart, customEnd) {
  const anchorDate = parseInputDate(anchorDateValue);

  if (rangeType === 'today') {
    return { startDate: toInputDate(anchorDate), endDate: toInputDate(anchorDate), label: 'Today' };
  }

  if (rangeType === 'tomorrow') {
    const tomorrow = addDays(anchorDate, 1);
    return { startDate: toInputDate(tomorrow), endDate: toInputDate(tomorrow), label: 'Tomorrow' };
  }

  if (rangeType === 'this-week') {
    return {
      startDate: toInputDate(startOfWeek(anchorDate)),
      endDate: toInputDate(endOfWeek(anchorDate)),
      label: 'This Week',
    };
  }

  if (rangeType === 'next-week') {
    const nextWeekStart = addDays(startOfWeek(anchorDate), 7);
    return {
      startDate: toInputDate(nextWeekStart),
      endDate: toInputDate(addDays(nextWeekStart, 6)),
      label: 'Next Week',
    };
  }

  if (rangeType === 'this-month') {
    return {
      startDate: toInputDate(startOfMonth(anchorDate)),
      endDate: toInputDate(endOfMonth(anchorDate)),
      label: 'This Month',
    };
  }

  return {
    startDate: customStart,
    endDate: customEnd,
    label: 'Custom Range',
  };
}
