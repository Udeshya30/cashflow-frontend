import { useMemo, useState } from 'react';
import { Save, X } from 'lucide-react';

import { getTodayInputValue } from '../utils/dates.js';
import IconLabel from './IconLabel.jsx';

const emptyEntry = {
  entry_date: getTodayInputValue(),
  activity: '',
  notes: '',
  next_date: '',
};

function DiaryEntryForm({
  initialValues,
  submitLabel = 'Save Entry',
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [values, setValues] = useState({ ...emptyEntry, ...initialValues });
  const [touched, setTouched] = useState({});

  const errors = useMemo(() => {
    const nextErrors = {};
    if (!values.entry_date) {
      nextErrors.entry_date = 'Entry date is required.';
    }
    if (!values.activity.trim()) {
      nextErrors.activity = 'Activity is required.';
    }
    return nextErrors;
  }, [values.activity, values.entry_date]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleBlur = (event) => {
    setTouched((current) => ({ ...current, [event.target.name]: true }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched({ entry_date: true, activity: true });
    if (Object.keys(errors).length > 0) {
      return;
    }

    onSubmit({
      entry_date: values.entry_date,
      activity: values.activity.trim(),
      notes: values.notes.trim() || null,
      next_date: values.next_date || null,
    });
  };

  return (
    <form className="diary-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <label className="form-field" htmlFor="entry_date">
          <span>Entry Date</span>
          <input
            id="entry_date"
            className={`form-control ${touched.entry_date && errors.entry_date ? 'is-invalid' : ''}`}
            name="entry_date"
            type="date"
            value={values.entry_date}
            onBlur={handleBlur}
            onChange={handleChange}
            required
          />
          {touched.entry_date && errors.entry_date ? (
            <span className="invalid-feedback">{errors.entry_date}</span>
          ) : null}
        </label>

        <label className="form-field" htmlFor="next_date">
          <span>Next Date</span>
          <input
            id="next_date"
            className="form-control"
            name="next_date"
            type="date"
            value={values.next_date ?? ''}
            onChange={handleChange}
          />
        </label>
      </div>

      <label className="form-field" htmlFor="activity">
        <span>Activity</span>
        <input
          id="activity"
          className={`form-control ${touched.activity && errors.activity ? 'is-invalid' : ''}`}
          name="activity"
          value={values.activity}
          onBlur={handleBlur}
          onChange={handleChange}
          required
        />
        {touched.activity && errors.activity ? (
          <span className="invalid-feedback">{errors.activity}</span>
        ) : null}
      </label>

      <label className="form-field" htmlFor="notes">
        <span>Notes</span>
        <textarea
          id="notes"
          className="form-control"
          name="notes"
          rows="4"
          value={values.notes ?? ''}
          onChange={handleChange}
        />
      </label>

      <div className="form-actions form-actions--split">
        {onCancel ? (
          <button className="btn btn-outline-secondary" type="button" onClick={onCancel}>
            <IconLabel icon={X} label="Cancel" />
          </button>
        ) : null}
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          <IconLabel icon={Save} label={submitting ? 'Saving' : submitLabel} />
        </button>
      </div>
    </form>
  );
}

export default DiaryEntryForm;
