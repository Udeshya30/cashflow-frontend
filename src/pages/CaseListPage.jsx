import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import CaseTable from '../components/CaseTable.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import SuccessState from '../components/SuccessState.jsx';
import IconLabel from '../components/IconLabel.jsx';
import { caseApi } from '../services/caseApi.js';

function CaseListPage() {
  const [cases, setCases] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [caseType, setCaseType] = useState('');
  const [needsNextDate, setNeedsNextDate] = useState(false);
  const [sort, setSort] = useState('next_date_asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [debouncedCaseType, setDebouncedCaseType] = useState('');

  const caseTypes = useMemo(() => {
    return [...new Set(cases.map((caseItem) => caseItem.case_type).filter(Boolean))].sort();
  }, [cases]);

  const loadCases = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.query?.trim()) {
        params.q = filters.query.trim();
      }
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.caseType) {
        params.case_type = filters.caseType;
      }
      if (filters.needsNextDate) {
        params.needs_next_date = true;
      }
      if (filters.sort) {
        params.sort = filters.sort;
      }
      setCases(await caseApi.listCases(params));
    } catch (loadError) {
      setError(loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedCaseType(caseType);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [caseType]);

  useEffect(() => {
    loadCases({
      query: debouncedQuery,
      status,
      caseType: debouncedCaseType,
      needsNextDate,
      sort,
    });
  }, [debouncedCaseType, debouncedQuery, needsNextDate, sort, status]);

  const handleStatusChange = async (caseId, nextStatus) => {
    setError(null);
    try {
      await caseApi.updateCase(caseId, { status: nextStatus });
      await loadCases({
        query: debouncedQuery,
        status,
        caseType: debouncedCaseType,
        needsNextDate,
        sort,
      });
      setSuccessMessage('Status updated.');
    } catch (updateError) {
      setError(updateError);
    }
  };

  return (
    <section>
      <PageHeader title="All Cases" eyebrow="Case register">
        <Link className="btn btn-primary" to="/cases/new">
          <IconLabel icon={Plus} label="Add Case" />
        </Link>
      </PageHeader>

      <form className="toolbar" role="search">
        <label className="toolbar__search" htmlFor="case-search">
          <span className="visually-hidden">Search cases</span>
          <input
            id="case-search"
            className="form-control"
            type="search"
            placeholder="Search case number, title, party, court, or case type"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label htmlFor="status-filter">
          <span className="visually-hidden">Filter by status</span>
          <select
            id="status-filter"
            className="form-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="DISPOSED">Disposed</option>
            <option value="CLOSED">Closed</option>
            <option value="STAYED">Stayed</option>
            <option value="TRANSFERRED">Transferred</option>
          </select>
        </label>
        <label htmlFor="case-type-filter">
          <span className="visually-hidden">Filter by case type</span>
          <input
            id="case-type-filter"
            className="form-control"
            list="case-type-options"
            placeholder="Case type"
            value={caseType}
            onChange={(event) => setCaseType(event.target.value)}
          />
          <datalist id="case-type-options">
            {caseTypes.map((type) => (
              <option key={type} value={type} />
            ))}
          </datalist>
        </label>
        <label htmlFor="sort-filter">
          <span className="visually-hidden">Sort cases</span>
          <select
            id="sort-filter"
            className="form-select"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="next_date_asc">Upcoming first</option>
            <option value="updated_desc">Recently updated</option>
            <option value="updated_asc">Oldest updated</option>
            <option value="title_asc">Title A-Z</option>
            <option value="title_desc">Title Z-A</option>
          </select>
        </label>
        <label className="toolbar__check" htmlFor="needs-next-date-filter">
          <input
            id="needs-next-date-filter"
            type="checkbox"
            checked={needsNextDate}
            onChange={(event) => setNeedsNextDate(event.target.checked)}
          />
          <span>Needs next date</span>
        </label>
      </form>

      {loading ? <LoadingState message="Loading cases" /> : null}
      {error ? (
        <ErrorState
          message="Could not load cases."
          onRetry={() =>
            loadCases({
              query: debouncedQuery,
              status,
              caseType: debouncedCaseType,
              needsNextDate,
              sort,
            })
          }
        />
      ) : null}
      <SuccessState message={successMessage} />
      {!loading && cases.length ? (
        <CaseTable cases={cases} onStatusChange={handleStatusChange} />
      ) : null}
      {!loading && !error && !cases.length ? (
        <EmptyState title="No cases found" message="Add a case or change the current filters." />
      ) : null}
    </section>
  );
}

export default CaseListPage;
