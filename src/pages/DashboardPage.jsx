import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, ListChecks, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import DateSelector from '../components/DateSelector.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import SuccessState from '../components/SuccessState.jsx';
import IconLabel from '../components/IconLabel.jsx';
import { caseApi } from '../services/caseApi.js';
import { getNextKnownDate, needsNextDate } from '../utils/cases.js';
import {
  addDays,
  addMonths,
  formatDate,
  getDateRange,
  getTodayInputValue,
  parseInputDate,
  toInputDate,
} from '../utils/dates.js';

const rangeOptions = [
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'this-week', label: 'This Week' },
  { value: 'next-week', label: 'Next Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'custom', label: 'Custom' },
];

const UPCOMING_CASE_LOOKAHEAD_DAYS = 10;

function DashboardPage() {
  const today = getTodayInputValue();
  const [cases, setCases] = useState([]);
  const [todayItems, setTodayItems] = useState([]);
  const [calendarItems, setCalendarItems] = useState([]);
  const [rangeType, setRangeType] = useState('today');
  const [anchorDate, setAnchorDate] = useState(today);
  const [customStartDate, setCustomStartDate] = useState(today);
  const [customEndDate, setCustomEndDate] = useState(today);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const selectedRange = useMemo(
    () => getDateRange(rangeType, anchorDate, customStartDate, customEndDate),
    [anchorDate, customEndDate, customStartDate, rangeType],
  );

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [caseData, todayData, rangeData] = await Promise.all([
        caseApi.listCases(),
        caseApi.getCalendarDate(today),
        selectedRange.startDate === selectedRange.endDate
          ? caseApi.getCalendarDate(selectedRange.startDate)
          : caseApi.getCalendarRange(selectedRange.startDate, selectedRange.endDate),
      ]);

      setCases(caseData);
      setTodayItems(todayData.items);
      setCalendarItems(rangeData.items);
    } catch (loadError) {
      setError(loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [selectedRange.startDate, selectedRange.endDate]);

  const activeCases = useMemo(() => cases.filter((caseItem) => caseItem.status === 'ACTIVE'), [cases]);
  const casesWithoutNextDate = useMemo(() => cases.filter((caseItem) => needsNextDate(caseItem, today)), [cases, today]);
  const upcomingStartDate = useMemo(() => toInputDate(addDays(parseInputDate(today), 1)), [today]);
  const upcomingEndDate = useMemo(
    () => toInputDate(addDays(parseInputDate(today), UPCOMING_CASE_LOOKAHEAD_DAYS)),
    [today],
  );
  const upcomingCases = useMemo(
    () =>
      cases
        .filter((caseItem) => {
          const nextKnownDate = getNextKnownDate(caseItem, today);
          return nextKnownDate && nextKnownDate >= upcomingStartDate && nextKnownDate <= upcomingEndDate;
        })
        .sort((first, second) =>
          getNextKnownDate(first, today).localeCompare(getNextKnownDate(second, today)),
        ),
    [cases, today, upcomingEndDate, upcomingStartDate],
  );
  const casesTodayCount = useMemo(
    () => new Set(todayItems.map((item) => item.case.id)).size,
    [todayItems],
  );

  const groupedItems = useMemo(() => {
    return calendarItems.reduce((groups, item) => {
      const key = item.entry.entry_date;
      return {
        ...groups,
        [key]: [...(groups[key] ?? []), item],
      };
    }, {});
  }, [calendarItems]);

  const groupedDates = Object.keys(groupedItems).sort();
  const rangeCaseCount = useMemo(
    () => new Set(calendarItems.map((item) => item.case.id)).size,
    [calendarItems],
  );
  const statusCounts = useMemo(
    () =>
      cases.reduce((counts, caseItem) => {
        counts[caseItem.status] = (counts[caseItem.status] ?? 0) + 1;
        return counts;
      }, {}),
    [cases],
  );
  const nextScheduledCase = upcomingCases[0];
  const nextScheduledDate = nextScheduledCase ? getNextKnownDate(nextScheduledCase, today) : null;

  const shiftRange = (direction) => {
    if (rangeType === 'custom') {
      const start = parseInputDate(customStartDate);
      const end = parseInputDate(customEndDate);
      const span = Math.max(1, Math.round((end - start) / 86400000) + 1);
      setCustomStartDate(toInputDate(addDays(start, direction * span)));
      setCustomEndDate(toInputDate(addDays(end, direction * span)));
      return;
    }

    if (rangeType === 'this-month') {
      setAnchorDate(toInputDate(addMonths(parseInputDate(anchorDate), direction)));
      return;
    }

    const dayShift = rangeType.includes('week') ? 7 : 1;
    setAnchorDate(toInputDate(addDays(parseInputDate(anchorDate), direction * dayShift)));
  };

  const handleNextDateChange = async (entryId, nextDate) => {
    setUpdatingId(entryId);
    setError(null);
    try {
      await caseApi.updateEntry(entryId, { next_date: nextDate || null });
      await loadDashboard();
      setSuccessMessage('Next date updated.');
    } catch (updateError) {
      setError(updateError);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = async (caseId, status) => {
    setUpdatingId(`case-${caseId}`);
    setError(null);
    try {
      await caseApi.updateCase(caseId, { status });
      await loadDashboard();
      setSuccessMessage('Status updated.');
    } catch (updateError) {
      setError(updateError);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="dashboard-page">
      <PageHeader title="Dashboard" eyebrow="Date diary">
        <Link className="btn btn-primary" to="/cases/new">
          <IconLabel icon={Plus} label="Add Case" />
        </Link>
      </PageHeader>

      <div className="summary-grid summary-grid--four dashboard-summary">
        <article className="summary-tile summary-tile--today">
          <span>{casesTodayCount}</span>
          <p>Today</p>
          <small>{todayItems.length} diary entr{todayItems.length === 1 ? 'y' : 'ies'}</small>
        </article>
        <article className="summary-tile summary-tile--upcoming">
          <span>{upcomingCases.length}</span>
          <p>Upcoming</p>
          <small>Next {UPCOMING_CASE_LOOKAHEAD_DAYS} days</small>
        </article>
        <article className="summary-tile summary-tile--active">
          <span>{activeCases.length}</span>
          <p>Active</p>
          <small>{cases.length} total cases</small>
        </article>
        <article className="summary-tile summary-tile--attention">
          <span>{casesWithoutNextDate.length}</span>
          <p>Need Next Date</p>
          <small>Open items to clean up</small>
        </article>
      </div>

      <section className="dashboard-hero">
        <div className="dashboard-hero__copy">
          <p className="dashboard-hero__eyebrow">{formatDate(today)}</p>
          <h2>Today needs attention across {casesTodayCount} case{casesTodayCount === 1 ? '' : 's'}.</h2>
          <p>
            Track court dates, missing next dates, and the active diary in one working view.
          </p>
        </div>
        <div className="dashboard-hero__next">
          <span>Next scheduled</span>
          <strong>{nextScheduledCase ? formatDate(nextScheduledDate) : 'Not set'}</strong>
          <p>{nextScheduledCase ? nextScheduledCase.case_title : 'No future diary dates'}</p>
        </div>
      </section>

      <div className="dashboard-workspace">
        <section className="panel dashboard-calendar">
          <div className="panel__header">
            <div>
              <h2>{selectedRange.label}</h2>
              <p className="range-note">
                {formatDate(selectedRange.startDate)} to {formatDate(selectedRange.endDate)} - {rangeCaseCount} case
                {rangeCaseCount === 1 ? '' : 's'} - {calendarItems.length} entr
                {calendarItems.length === 1 ? 'y' : 'ies'}
              </p>
            </div>
            <div className="range-actions">
              <button
                aria-label="Previous date range"
                className="btn btn-outline-secondary btn-icon-only"
                title="Previous"
                type="button"
                onClick={() => shiftRange(-1)}
              >
                <IconLabel icon={ChevronLeft} label="Previous" hideLabel />
              </button>
              <button
                aria-label="Next date range"
                className="btn btn-outline-secondary btn-icon-only"
                title="Next"
                type="button"
                onClick={() => shiftRange(1)}
              >
                <IconLabel icon={ChevronRight} label="Next" hideLabel />
              </button>
            </div>
          </div>

          <div className="range-toolbar">
            <label className="range-select" htmlFor="dashboard-range">
              <span>Date view</span>
              <select
                id="dashboard-range"
                className="form-select"
                value={rangeType}
                onChange={(event) => setRangeType(event.target.value)}
              >
                {rangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {rangeType === 'custom' ? (
            <div className="custom-range">
              <DateSelector
                id="custom-start-date"
                label="Start date"
                value={customStartDate}
                onChange={setCustomStartDate}
              />
              <DateSelector
                id="custom-end-date"
                label="End date"
                value={customEndDate}
                onChange={setCustomEndDate}
              />
            </div>
          ) : null}

          <p className="week-definition">Weeks run Monday through Sunday.</p>

          {loading ? <LoadingState message="Loading scheduled cases" /> : null}
          {error ? <ErrorState message="Could not load or update dashboard data." onRetry={loadDashboard} /> : null}
          <SuccessState message={successMessage} />

          {!loading && !calendarItems.length ? (
            <EmptyState title="No cases scheduled for this date." message="Try another range or add a diary entry." />
          ) : null}

          {!loading && groupedDates.length ? (
            <div className="date-groups">
              {groupedDates.map((entryDate) => (
                <section className="date-group" key={entryDate}>
                  <h3>{formatDate(entryDate)}</h3>
                  <div className="date-result-list">
                    {groupedItems[entryDate].map((item) => (
                      <DateResultCard
                        item={item}
                        key={item.entry.id}
                        updatingId={updatingId}
                        onNextDateChange={handleNextDateChange}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : null}
        </section>

        <aside className="dashboard-focus">
          <section className="panel">
            <div className="panel__header">
              <div>
                <h2>Upcoming Cases</h2>
                <p className="range-note">Next {UPCOMING_CASE_LOOKAHEAD_DAYS} days</p>
              </div>
            </div>
            {upcomingCases.length ? (
              <div className="productivity-list">
                {upcomingCases.slice(0, 6).map((caseItem) => (
                  <Link className="productivity-item" key={caseItem.id} to={`/cases/${caseItem.id}`}>
                    <span>{formatDate(getNextKnownDate(caseItem, today))}</span>
                    <strong>{caseItem.case_title}</strong>
                    <small>{caseItem.court_name || 'Court not set'}</small>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState title="No upcoming diary dates" message="Add future diary entries to track upcoming cases." />
            )}
          </section>

          <section className="panel">
            <div className="panel__header">
              <h2>Needs Next Date</h2>
            </div>
            {casesWithoutNextDate.length ? (
              <div className="productivity-list">
                {casesWithoutNextDate.slice(0, 6).map((caseItem) => (
                  <Link className="productivity-item" key={caseItem.id} to={`/cases/${caseItem.id}`}>
                    <span>{caseItem.case_number || 'No case number'}</span>
                    <strong>{caseItem.case_title}</strong>
                    <small>{caseItem.party_name || 'Party not set'}</small>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState title="No cases need a next date" message="Every current case has its next date set." />
            )}
          </section>

          <section className="panel status-overview">
            <div className="panel__header">
              <h2>Status Mix</h2>
            </div>
            <div className="status-overview__list">
              {['ACTIVE', 'PENDING', 'DISPOSED', 'CLOSED', 'STAYED', 'TRANSFERRED'].map((status) => (
                <div className="status-overview__row" key={status}>
                  <StatusBadge status={status} />
                  <span>{statusCounts[status] ?? 0}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

function DateResultCard({ item, updatingId, onNextDateChange, onStatusChange }) {
  const { case: caseItem, entry } = item;

  return (
    <article className="date-result-card">
      <div className="date-result-card__main">
        <div>
          <p>{caseItem.case_number || 'No case number'}</p>
          <h4>{caseItem.case_title}</h4>
          <span>{caseItem.party_name || 'Party not set'}</span>
        </div>
        <StatusBadge status={caseItem.status} />
      </div>

      <dl className="date-result-grid">
        <div>
          <dt>Court</dt>
          <dd>{caseItem.court_name || 'Not set'}</dd>
        </div>
        <div>
          <dt>Activity</dt>
          <dd>{entry.activity}</dd>
        </div>
        <div>
          <dt>Notes</dt>
          <dd>{entry.notes || 'Not set'}</dd>
        </div>
        <div>
          <dt>Next Date</dt>
          <dd>{entry.next_date ? formatDate(entry.next_date) : 'Not Set'}</dd>
        </div>
      </dl>

      <div className="date-result-actions">
        <Link className="btn btn-outline-primary btn-sm" to={`/cases/${caseItem.id}`}>
          <IconLabel icon={Eye} label="Open Case" />
        </Link>
        <Link className="btn btn-outline-secondary btn-sm" to={`/cases/${caseItem.id}`}>
          <IconLabel icon={ListChecks} label="View Entry" />
        </Link>
        <label htmlFor={`next-date-${entry.id}`}>
          <span className="visually-hidden">Update next date</span>
          <input
            id={`next-date-${entry.id}`}
            className="form-control form-control-sm"
            type="date"
            defaultValue={entry.next_date ?? ''}
            disabled={updatingId === entry.id}
            onBlur={(event) => {
              if ((entry.next_date ?? '') !== event.target.value) {
                onNextDateChange(entry.id, event.target.value);
              }
            }}
          />
        </label>
        <label htmlFor={`status-${caseItem.id}`}>
          <span className="visually-hidden">Change status</span>
          <select
            id={`status-${caseItem.id}`}
            className="form-select form-select-sm"
            value={caseItem.status}
            disabled={updatingId === `case-${caseItem.id}`}
            onChange={(event) => onStatusChange(caseItem.id, event.target.value)}
          >
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="DISPOSED">Disposed</option>
            <option value="CLOSED">Closed</option>
            <option value="STAYED">Stayed</option>
            <option value="TRANSFERRED">Transferred</option>
          </select>
        </label>
      </div>
    </article>
  );
}

export default DashboardPage;
