import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../state/useAuth";

const navItems = [
  { to: "/app/dashboard", label: "Dashboard" },
  { to: "/app/resumes", label: "Resumes" },
  { to: "/app/jobs", label: "Jobs" },
  { to: "/app/profile", label: "Profile" },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">HireReach</p>
          <h1 className="app-title">Find the right job. Reach the right person.</h1>
        </div>
        <button
          className="ghost-btn"
          onClick={handleLogout}
          type="button"
        >
          Logout
        </button>
      </header>

      <div className="app-grid">
        <aside className="sidebar">
          <p className="sidebar-user">
            Signed in as <strong>{user?.email || "unknown user"}</strong>
          </p>
          <nav className="nav-links">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  isActive ? "nav-link nav-link-active" : "nav-link"
                }
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="content-panel">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
