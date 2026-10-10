import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import CaseForm from '../components/CaseForm.jsx';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { caseApi } from '../services/caseApi.js';

function CaseEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseItem, setCaseItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCase() {
      setLoading(true);
      setError(null);
      try {
        setCaseItem(await caseApi.getCase(id));
      } catch (loadError) {
        setError(loadError);
      } finally {
        setLoading(false);
      }
    }

    loadCase();
  }, [id]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError(null);
    try {
      const updatedCase = await caseApi.updateCase(id, payload);
      navigate(`/cases/${updatedCase.id}`);
    } catch (submitError) {
      setError(submitError);
      setSubmitting(false);
    }
  };

  return (
    <section>
      <PageHeader title="Edit Case" eyebrow="Case record" />
      {loading ? <LoadingState message="Loading case" /> : null}
      {error ? <ErrorState message="Could not load or update this case." /> : null}
      {!loading && caseItem ? (
        <div className="panel">
          <CaseForm
            initialValues={caseItem}
            submitLabel="Update Case"
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        </div>
      ) : null}
    </section>
  );
}

export default CaseEditPage;
