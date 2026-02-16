import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Pattern Visualizer' },
  { to: '/study-lab', label: 'Study Lab' },
  { to: '/complexity-trainer', label: 'Complexity Trainer' },
];

export function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Algo Studio</h1>
        <p className="muted">Interview pattern learning workspace</p>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
