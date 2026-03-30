import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getJobs } from "../api/jobsApi";
import { jobDescriptionSnippet } from "../ui/OrganizedJobDescription";
import { StatusPill } from "../ui/StatusPill";
import { formatDateTimeIST, formatJobSourceLabel } from "../utils/format";

export function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadJobs() {
    setLoading(true);
    setError("");
    try {
      const response = await getJobs();
      setJobs(response.data || []);
    } catch (err) {
      setError(err.message || "Could not load jobs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <section className="section-stack">
      <header className="section-head">
        <h2>Saved Jobs</h2>
        <p>Track captured jobs and update lifecycle states.</p>
      </header>

      <article className="card jobs-table-card">
        <h3>Job list</h3>
        {error ? <p className="error-text">{error}</p> : null}
        {loading ? <p>Loading jobs...</p> : null}
        {!loading && jobs.length === 0 ? <p>No saved jobs yet.</p> : null}
        {!loading && jobs.length > 0 ? (
          <div className="table-wrap">
            <table className="table table-jobs">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Preview</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Created At (IST)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.id}</td>
                    <td>{job.title}</td>
                    <td>{job.company_name}</td>
                    <td className="cell-preview">{jobDescriptionSnippet(job)}</td>
                    <td>{formatJobSourceLabel(job.source_platform)}</td>
                    <td>
                      <StatusPill value={job.status} />
                    </td>
                    <td>{formatDateTimeIST(job.createdAt || job.created_at)}</td>
                    <td className="inline-actions">
                      <Link
                        className="text-btn action-open-btn"
                        to={`/app/jobs/${job.id}`}
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </article>
    </section>
  );
}
