import { useEffect, useState } from 'react';
import { NotebookPen, Pencil, Plus, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import ConfirmDialog from '../components/ConfirmDialog.jsx';
import DiaryEntryForm from '../components/DiaryEntryForm.jsx';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import SuccessState from '../components/SuccessState.jsx';
import Timeline from '../components/Timeline.jsx';
import IconLabel from '../components/IconLabel.jsx';
import { caseApi } from '../services/caseApi.js';
import { formatDate, getTodayInputValue } from '../utils/dates.js';

function CaseDetailPage() {
  const { id } = useParams();
  const [caseItem, setCaseItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [entryFormMode, setEntryFormMode] = useState(null);
  const [entryToEdit, setEntryToEdit] = useState(null);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [nextEntryPrompt, setNextEntryPrompt] = useState(null);

  const loadCase = async () => {
    setLoading(true);
    setError(null);
    try {
      setCaseItem(await caseApi.getCase(id));
    } catch (loadError) {
      setError(loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCase();
  }, [id]);

  const handleStatusChange = async (status) => {
    setSaving(true);
    setError(null);
    try {
      setCaseItem(await caseApi.updateCase(id, { status }));
      setSuccessMessage('Status updated.');
    } catch (statusError) {
      setError(statusError);
    } finally {
      setSaving(false);
    }
  };

  const handleAddEntry = async (payload) => {
    setSaving(true);
    setError(null);
    try {
      await caseApi.createEntry(id, payload);
      closeEntryForm();
      await loadCase();
      setSuccessMessage('Diary entry added.');
    } catch (saveError) {
      setError(saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEntry = async (payload) => {
    setSaving(true);
    setError(null);
    try {
      const previousNextDate = entryToEdit.next_date;
      const updatedEntry = await caseApi.updateEntry(entryToEdit.id, payload);
      closeEntryForm();
      await loadCase();
      if (updatedEntry.next_date && updatedEntry.next_date !== previousNextDate) {
        setNextEntryPrompt(updatedEntry);
      }
      setSuccessMessage('Diary entry updated.');
    } catch (saveError) {
      setError(saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!entryToDelete) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await caseApi.deleteEntry(entryToDelete.id);
      setEntryToDelete(null);
      await loadCase();
      setSuccessMessage('Diary entry deleted.');
    } catch (deleteError) {
      setError(deleteError);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNextEntry = async () => {
    if (!nextEntryPrompt?.next_date) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await caseApi.createEntry(id, {
        entry_date: nextEntryPrompt.next_date,
        activity: 'Hearing',
        notes: null,
        next_date: null,
      });
      setNextEntryPrompt(null);
      await loadCase();
      setSuccessMessage('Next diary entry created.');
    } catch (createError) {
      setError(createError);
    } finally {
      setSaving(false);
    }
  };

  const openAddEntryForm = () => {
    setEntryToEdit(null);
    setEntryFormMode('add');
  };

  const openEditEntryForm = (entry) => {
    setEntryToEdit(entry);
    setEntryFormMode('edit');
  };

  const closeEntryForm = () => {
    setEntryFormMode(null);
    setEntryToEdit(null);
  };

  return (
    <section>
      <PageHeader title={caseItem?.case_title ?? 'Case Details'} eyebrow="Case record">
        <div className="button-row">
          {caseItem ? (
            <>
              <Link className="btn btn-outline-primary" to={`/cases/${caseItem.id}/edit`}>
                <IconLabel icon={Pencil} label="Edit Case" />
              </Link>
              <button className="btn btn-primary" type="button" onClick={openAddEntryForm}>
                <IconLabel icon={NotebookPen} label="Add Diary Entry" />
              </button>
            </>
          ) : null}
        </div>
      </PageHeader>

      {loading ? <LoadingState message="Loading case" /> : null}
      {error ? <ErrorState message="Could not complete the case timeline action." onRetry={loadCase} /> : null}
      <SuccessState message={successMessage} />
      {!loading && caseItem ? (
        <div className="detail-grid">
          <section className="panel">
            <div className="case-detail__title">
              <div>
                <p>{caseItem.case_number || 'No case number'}</p>
                <h2>{caseItem.case_title}</h2>
              </div>
              <StatusBadge status={caseItem.status} />
            </div>

            <label className="form-field case-status-control" htmlFor="case-status">
              <span>Change Status</span>
              <select
                id="case-status"
                className="form-select"
                value={caseItem.status}
                disabled={saving}
                onChange={(event) => handleStatusChange(event.target.value)}
              >
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="DISPOSED">Disposed</option>
                <option value="CLOSED">Closed</option>
                <option value="STAYED">Stayed</option>
                <option value="TRANSFERRED">Transferred</option>
              </select>
            </label>

            <dl className="detail-list">
              <div>
                <dt>Parties</dt>
                <dd>{caseItem.party_name || 'Not set'}</dd>
              </div>
              <div>
                <dt>Case type</dt>
                <dd>{caseItem.case_type || 'Not set'}</dd>
              </div>
              <div>
                <dt>Court</dt>
                <dd>{caseItem.court_name || 'Not set'}</dd>
              </div>
              <div>
                <dt>Court reference</dt>
                <dd>{caseItem.court_reference || 'Not set'}</dd>
              </div>
              <div>
                <dt>Description</dt>
                <dd>{caseItem.description || 'Not set'}</dd>
              </div>
            </dl>
          </section>

          <section className="panel">
            <div className="panel__header">
              <h2>Timeline</h2>
              <button className="btn btn-outline-primary btn-sm" type="button" onClick={openAddEntryForm}>
                <IconLabel icon={Plus} label="Add Entry" />
              </button>
            </div>

            {entryFormMode ? (
              <div className="inline-form-panel">
                <h3>{entryFormMode === 'add' ? 'Add Diary Entry' : 'Edit Diary Entry'}</h3>
                <DiaryEntryForm
                  initialValues={
                    entryFormMode === 'edit'
                      ? entryToEdit
                      : { entry_date: getTodayInputValue(), activity: '', notes: '', next_date: '' }
                  }
                  submitLabel={entryFormMode === 'add' ? 'Add Entry' : 'Update Entry'}
                  submitting={saving}
                  onCancel={closeEntryForm}
                  onSubmit={entryFormMode === 'add' ? handleAddEntry : handleUpdateEntry}
                />
              </div>
            ) : null}

            {nextEntryPrompt ? (
              <div className="next-entry-prompt">
                <div>
                  <h3>Create next diary entry?</h3>
                  <p>{formatDate(nextEntryPrompt.next_date)} is now set as the next date.</p>
                </div>
                <div className="button-row">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    type="button"
                    onClick={() => setNextEntryPrompt(null)}
                  >
                    <IconLabel icon={X} label="Not now" />
                  </button>
                  <button className="btn btn-primary btn-sm" type="button" onClick={handleCreateNextEntry}>
                    <IconLabel icon={NotebookPen} label="Create Entry" />
                  </button>
                </div>
              </div>
            ) : null}

            <Timeline
              entries={caseItem.diary_entries}
              onDeleteEntry={setEntryToDelete}
              onEditEntry={openEditEntryForm}
            />
          </section>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(entryToDelete)}
        title="Delete diary entry?"
        message="This removes the entry from the case timeline."
        confirmLabel="Delete Entry"
        onCancel={() => setEntryToDelete(null)}
        onConfirm={handleDeleteEntry}
      />
    </section>
  );
}

export default CaseDetailPage;
