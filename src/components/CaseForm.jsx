import { useMemo, useState } from 'react';
import { Save } from 'lucide-react';

import { getTodayInputValue } from '../utils/dates.js';
import IconLabel from './IconLabel.jsx';

const emptyCase = {
  case_title: '',
  case_number: '',
  party_name: '',
  case_type: '',
  court_name: '',
  court_reference: '',
  status: 'ACTIVE',
  description: '',
};

const caseFields = Object.keys(emptyCase);

function splitPartyName(partyName = '') {
  const parts = partyName.split(/\s+v(?:s\.?|ersus)\s+/i);
  return {
    firstParty: parts[0]?.trim() ?? '',
    secondParty: parts.slice(1).join(' VS ').trim(),
  };
}

function joinPartyName(firstParty, secondParty) {
  const first = firstParty.trim();
  const second = secondParty.trim();

  if (first && second) {
    return `${first} VS ${second}`;
  }

  return first || second;
}

function parseCaseLine(value) {
  const normalizedValue = value.trim().replace(/\s+/g, ' ');
  const match = normalizedValue.match(/^(\S+)\s+(.+?)\s+v(?:s\.?|ersus)\s+(.+)$/i);

  if (!match) {
    return null;
  }

  return {
    caseNumber: match[1],
    firstParty: match[2].trim(),
    secondParty: match[3].trim(),
  };
}

function buildCaseTitle(values) {
  const caseNumber = (values.case_number ?? '').trim();
  const partyName = (values.party_name ?? '').trim();

  if (caseNumber && partyName) {
    return `${caseNumber} - ${partyName}`;
  }

  return caseNumber || partyName || 'Untitled case';
}

function CaseForm({
  initialValues,
  submitLabel = 'Save Case',
  onSubmit,
  submitting = false,
  includeInitialDiaryEntry = false,
}) {
  const today = getTodayInputValue();
  const [values, setValues] = useState({ ...emptyCase, ...initialValues });
  const [partyValues, setPartyValues] = useState(() => splitPartyName(initialValues?.party_name));
  const [initialEntryValues, setInitialEntryValues] = useState({
    startDateToday: true,
    startDate: today,
    nextDate: '',
  });
  const [touched, setTouched] = useState({});

  const errors = useMemo(() => {
    const nextErrors = {};
    if (includeInitialDiaryEntry && !initialEntryValues.startDateToday && !initialEntryValues.startDate) {
      nextErrors.startDate = 'Start date is required.';
    }
    return nextErrors;
  }, [includeInitialDiaryEntry, initialEntryValues.startDate, initialEntryValues.startDateToday]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handlePartyChange = (event) => {
    const { name, value } = event.target;
    setPartyValues((current) => ({ ...current, [name]: value }));
  };

  const handleCaseLinePaste = (event) => {
    const pastedValue = event.clipboardData.getData('text');
    const parsedValue = parseCaseLine(pastedValue);

    if (!parsedValue) {
      return;
    }

    event.preventDefault();
    setValues((current) => ({ ...current, case_number: parsedValue.caseNumber }));
    setPartyValues({
      firstParty: parsedValue.firstParty,
      secondParty: parsedValue.secondParty,
    });
  };

  const handleInitialEntryChange = (event) => {
    const { checked, name, type, value } = event.target;
    setInitialEntryValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'startDateToday' ? { startDate: checked ? today : '' } : {}),
    }));
  };

  const handleBlur = (event) => {
    setTouched((current) => ({ ...current, [event.target.name]: true }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched({ startDate: true });
    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload = Object.fromEntries(
      caseFields.map((key) => {
        const value = values[key] ?? '';
        return [key, value.trim() === '' ? null : value.trim()];
      }),
    );
    payload.party_name = joinPartyName(partyValues.firstParty, partyValues.secondParty) || null;
    payload.case_title = buildCaseTitle({ ...values, party_name: payload.party_name });
    payload.status = values.status;

    if (!includeInitialDiaryEntry) {
      onSubmit(payload);
      return;
    }

    onSubmit(payload, {
      entry_date: initialEntryValues.startDateToday ? today : initialEntryValues.startDate,
      activity: 'Case started',
      notes: 'Initial diary entry created while adding the case.',
      next_date: initialEntryValues.nextDate || null,
    });
  };

  return (
    <form className="case-form" onSubmit={handleSubmit} noValidate>
      <section className="case-form-section">
        <div className="case-form-section__header">
          <span>01</span>
          <div>
            <h2>Case Details</h2>
            <p>Start with the core identity of the matter.</p>
          </div>
        </div>

        <div className="form-grid">
          <label className="form-field" htmlFor="court_name">
            <span>Court name</span>
            <input
              id="court_name"
              className="form-control"
              name="court_name"
              value={values.court_name ?? ''}
              onChange={handleChange}
            />
          </label>
          <label className="form-field" htmlFor="case_number">
            <span>Case number</span>
            <input
              id="case_number"
              className="form-control"
              name="case_number"
              value={values.case_number ?? ''}
              onChange={handleChange}
              onPaste={handleCaseLinePaste}
            />
          </label>
          <label className="form-field" htmlFor="party_name">
            <span>First party</span>
            <input
              id="party_name"
              className="form-control"
              name="firstParty"
              value={partyValues.firstParty}
              onChange={handlePartyChange}
              onPaste={handleCaseLinePaste}
            />
          </label>
          <label className="form-field" htmlFor="second_party">
            <span>Second party</span>
            <input
              id="second_party"
              className="form-control"
              name="secondParty"
              value={partyValues.secondParty}
              onChange={handlePartyChange}
            />
          </label>
          <label className="form-field" htmlFor="status">
            <span>Status</span>
            <select
              id="status"
              className="form-select"
              name="status"
              value={values.status}
              onChange={handleChange}
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

        <label className="form-field" htmlFor="description">
          <span>Info</span>
          <textarea
            id="description"
            className="form-control"
            name="description"
            rows="4"
            value={values.description ?? ''}
            onChange={handleChange}
          />
        </label>
      </section>

      {includeInitialDiaryEntry ? (
        <section className="initial-diary-fields" aria-labelledby="initial-diary-title">
          <div className="case-form-section__header">
            <span>02</span>
            <div>
              <h2 id="initial-diary-title">Diary Setup</h2>
              <p>Set the case start date and optional next date while creating this case.</p>
            </div>
          </div>

          <label className="toolbar__check initial-diary-fields__check" htmlFor="start-date-today">
            <input
              id="start-date-today"
              name="startDateToday"
              type="checkbox"
              checked={initialEntryValues.startDateToday}
              onChange={handleInitialEntryChange}
            />
            <span>Start date today</span>
          </label>

          <div className="form-grid">
            <label className="form-field initial-diary-fields__date" htmlFor="start-date">
              <span>Start Date</span>
              <input
                id="start-date"
                className={`form-control ${
                  !initialEntryValues.startDateToday && !initialEntryValues.startDate ? 'date-input--empty' : ''
                } ${touched.startDate && errors.startDate ? 'is-invalid' : ''}`}
                name="startDate"
                type="date"
                value={initialEntryValues.startDateToday ? today : initialEntryValues.startDate}
                disabled={initialEntryValues.startDateToday}
                onBlur={handleBlur}
                onChange={handleInitialEntryChange}
                required
              />
              {!initialEntryValues.startDateToday && !initialEntryValues.startDate ? (
                <span className="date-placeholder">dd mm yyyy</span>
              ) : null}
              {touched.startDate && errors.startDate ? (
                <span className="invalid-feedback">{errors.startDate}</span>
              ) : null}
            </label>

            <label className="form-field initial-diary-fields__date" htmlFor="initial-next-date">
              <span>Next Date</span>
              <input
                id="initial-next-date"
                className="form-control"
                name="nextDate"
                type="date"
                value={initialEntryValues.nextDate}
                onChange={handleInitialEntryChange}
              />
            </label>
          </div>
        </section>
      ) : null}

      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          <IconLabel icon={Save} label={submitting ? 'Saving' : submitLabel} />
        </button>
      </div>
    </form>
  );
}

export default CaseForm;
