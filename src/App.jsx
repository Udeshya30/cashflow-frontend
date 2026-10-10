import { Navigate, Route, Routes } from 'react-router-dom';

import AppLayout from './layouts/AppLayout.jsx';
import CaseDetailPage from './pages/CaseDetailPage.jsx';
import CaseEditPage from './pages/CaseEditPage.jsx';
import CaseListPage from './pages/CaseListPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import NewCasePage from './pages/NewCasePage.jsx';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/cases" element={<CaseListPage />} />
        <Route path="/cases/new" element={<NewCasePage />} />
        <Route path="/cases/:id" element={<CaseDetailPage />} />
        <Route path="/cases/:id/edit" element={<CaseEditPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
