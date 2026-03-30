import { Link } from "react-router-dom";
import { useAuth } from "../state/useAuth";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <section className="section-stack">
      <article className="hero-panel hero-panel-rich">
        <p className="eyebrow">MVP Dashboard</p>
        <h2>Welcome back, {user?.first_name || "Job Seeker"}.</h2>
        <p className="hero-panel-copy">
          This dashboard connects directly to your NestJS API for auth, resumes,
          and saved jobs so you can move from random applications to targeted outreach.
        </p>
        <div className="hero-quick-links">
          <Link
            className="text-btn"
            to="/app/jobs"
          >
            View jobs
          </Link>
          <Link
            className="text-btn"
            to="/app/resumes"
          >
            Manage resumes
          </Link>
        </div>
      </article>

      <div className="kpi-grid">
        <Link
          className="kpi-card"
          to="/app/resumes"
        >
          <h3>Resume Workspace</h3>
          <p>Upload, inspect parsing status, and keep only your active versions.</p>
        </Link>
        <Link
          className="kpi-card"
          to="/app/jobs"
        >
          <h3>Saved Jobs</h3>
          <p>Create manual intake entries and update lifecycle status.</p>
        </Link>
        <Link
          className="kpi-card"
          to="/app/profile"
        >
          <h3>Profile Control</h3>
          <p>Maintain personal details used across authentication flows.</p>
        </Link>
      </div>
    </section>
  );
}
