import { Outlet } from 'react-router-dom';

import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';

function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-content">
        <Header />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
