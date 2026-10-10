import { useState } from 'react';
import { CalendarCheck, FileText, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import CaseForm from '../components/CaseForm.jsx';
import ErrorState from '../components/ErrorState.jsx';
import IconLabel from '../components/IconLabel.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { caseApi } from '../services/caseApi.js';

function NewCasePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (payload, initialEntry) => {
    setSubmitting(true);
    setError(null);
    try {
      const createdCase = await caseApi.createCase(payload);
      if (initialEntry) {
        await caseApi.createEntry(createdCase.id, initialEntry);
      }
      navigate(`/cases/${createdCase.id}`);
    } catch (submitError) {
      setError(submitError);
      setSubmitting(false);
    }
  };

  return (
    <section className="add-case-page">
      <PageHeader title="Add Case" eyebrow="Manual entry" />
      {error ? <ErrorState message="Could not create the case." /> : null}

      <div className="add-case-shell">
        <div className="panel add-case-form-panel">
          <CaseForm
            includeInitialDiaryEntry
            submitLabel="Create Case"
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        </div>

        <aside className="add-case-guide" aria-label="Add case guide">
          <div className="add-case-guide__header">
            <span className="add-case-guide__mark">
              <FileText aria-hidden="true" size={22} />
            </span>
            <div>
              <h2>New case setup</h2>
              <p>Create the case record and first diary date together.</p>
            </div>
          </div>

          <div className="add-case-guide__steps">
            <div>
              <IconLabel icon={FileText} label="Case identity" />
              <p>Capture court name, case number, both parties, info, and status.</p>
            </div>
            <div>
              <IconLabel icon={CalendarCheck} label="Diary dates" />
              <p>Use today as the start date or pick a custom start date.</p>
            </div>
            <div>
              <IconLabel icon={ShieldCheck} label="Saved history" />
              <p>The first diary entry is created automatically after save.</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default NewCasePage;
