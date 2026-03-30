import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getJobById, getJobs, updateJobStatus } from "../api/jobsApi";
import { JOB_STATUSES } from "../constants/enums";
import {
  jobDescriptionSnippet,
  OrganizedJobDescription,
} from "../ui/OrganizedJobDescription";
import { StatusPill } from "../ui/StatusPill";

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "N/A";
  return String(value);
}

export function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

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

  async function handleStatusUpdate(id, status) {
    setError("");
    setMessage("");
    try {
      const response = await updateJobStatus(id, status);
      setMessage(response.message || "Status updated");
      setJobs((prev) =>
        prev.map((job) => (job.id === id ? { ...job, status } : job)),
      );
    } catch (err) {
      setError(err.message || "Status update failed");
    }
  }

  async function handleViewJob(id) {
    setViewLoading(true);
    setError("");
    try {
      const response = await getJobById(id);
      setSelectedJob(response.data || null);
    } catch (err) {
      setError(err.message || "Could not load job detail");
    } finally {
      setViewLoading(false);
    }
  }

  function closeJobModal() {
    setSelectedJob(null);
  }

  return (
    <section className="section-stack">
      <header className="section-head">
        <h2>Saved Jobs</h2>
        <p>Track captured jobs and update lifecycle states.</p>
      </header>

      <article className="card">
        <h3>Job list</h3>
        {message ? <p className="success-text">{message}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        {loading ? <p>Loading jobs...</p> : null}
        {!loading && jobs.length === 0 ? <p>No saved jobs yet.</p> : null}
        {!loading && jobs.length > 0 ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Preview</th>
                  <th>Source</th>
                  <th>Status</th>
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
                    <td>{job.source_platform}</td>
                    <td>
                      <StatusPill value={job.status} />
                    </td>
                    <td className="inline-actions">
                      <button
                        className="text-btn"
                        onClick={() => handleViewJob(job.id)}
                        type="button"
                      >
                        View
                      </button>
                      <Link
                        className="text-btn"
                        to={`/app/jobs/${job.id}`}
                      >
                        Open
                      </Link>
                      <select
                        className="input compact"
                        defaultValue=""
                        onChange={(event) => {
                          if (event.target.value) {
                            handleStatusUpdate(job.id, event.target.value);
                            event.target.value = "";
                          }
                        }}
                      >
                        <option value="">Update status</option>
                        {JOB_STATUSES.map((status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </article>

      {selectedJob ? (
        <div
          className="modal-backdrop"
          onClick={closeJobModal}
          role="presentation"
        >
          <article
            aria-modal="true"
            className="modal-card modal-card-wide"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <header className="job-modal-header">
              <div>
                <p className="eyebrow">Job Details</p>
                <h3>{selectedJob.title || "Untitled Role"}</h3>
                <p className="muted">{selectedJob.company_name || "Unknown company"}</p>
              </div>
              <StatusPill value={selectedJob.status} />
            </header>

            {viewLoading ? <p>Loading details...</p> : null}

            <section className="job-modal-grid">
              <p><strong>ID:</strong> {formatValue(selectedJob.id)}</p>
              <p><strong>User ID:</strong> {formatValue(selectedJob.user_id)}</p>
              <p><strong>Source:</strong> {formatValue(selectedJob.source_platform)}</p>
              <p><strong>Location:</strong> {formatValue(selectedJob.location)}</p>
              <p><strong>Work mode:</strong> {formatValue(selectedJob.work_mode)}</p>
              <p><strong>Work time:</strong> {formatValue(selectedJob.work_time)}</p>
              <p><strong>Salary:</strong> {formatValue(selectedJob.salary)}</p>
              <p><strong>Employment type:</strong> {formatValue(selectedJob.employment_type)}</p>
              <p><strong>Experience level:</strong> {formatValue(selectedJob.experience_level)}</p>
              <p><strong>Created at:</strong> {formatValue(selectedJob.createdAt || selectedJob.created_at)}</p>
            </section>

            <section className="job-modal-section job-modal-section--description">
              <OrganizedJobDescription job={selectedJob} />
            </section>

            <section className="job-modal-section">
              <h4>Skills (from intake)</h4>
              <p>
                {selectedJob.skills?.length
                  ? selectedJob.skills.join(", ")
                  : "None"}
              </p>
            </section>

            <section className="job-modal-section">
              <h4>Source URL</h4>
              {selectedJob.source_url ? (
                <a
                  href={selectedJob.source_url}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open source posting
                </a>
              ) : (
                <p>N/A</p>
              )}
            </section>

            <details>
              <summary>Raw payload JSON</summary>
              <pre className="code-block">{JSON.stringify(selectedJob.raw_payload, null, 2)}</pre>
            </details>
            <details>
              <summary>Extracted metadata JSON</summary>
              <pre className="code-block">{JSON.stringify(selectedJob.extracted_metadata, null, 2)}</pre>
            </details>

            <div className="modal-actions">
              <button
                className="ghost-btn"
                onClick={closeJobModal}
                type="button"
              >
                Close
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
