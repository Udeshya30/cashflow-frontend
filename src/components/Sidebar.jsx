import { NavLink } from 'react-router-dom';

function Sidebar() {
  return (
    <aside className="app-sidebar">
      <NavLink to="/dashboard" className="app-brand">
        <span className="app-brand__mark">CF</span>
        <span>
          <strong>CaseFlow</strong>
          <small>Your Cases. Your Dates. Your Record.</small>
        </span>
      </NavLink>
      <nav className="app-nav" aria-label="Primary navigation">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/cases" end>
          All Cases
        </NavLink>
        <NavLink to="/cases/new">Add Case</NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
