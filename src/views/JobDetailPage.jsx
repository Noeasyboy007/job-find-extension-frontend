import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getJobById, updateJobStatus } from "../api/jobsApi";
import { JOB_STATUSES } from "../constants/enums";
import { OrganizedJobDescription } from "../ui/OrganizedJobDescription";
import { StatusPill } from "../ui/StatusPill";

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "N/A";
  return String(value);
}

export function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadJob() {
      setLoading(true);
      setError("");
      try {
        const response = await getJobById(id);
        setJob(response.data);
      } catch (err) {
        setError(err.message || "Could not load job detail");
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [id]);

  async function handleStatusChange(status) {
    if (!status) return;
    setUpdating(true);
    setError("");
    setMessage("");
    try {
      await updateJobStatus(id, status);
      setJob((prev) => ({ ...prev, status }));
      setMessage("Status updated");
    } catch (err) {
      setError(err.message || "Status update failed");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return <p>Loading job detail...</p>;
  }

  if (!job) {
    return (
      <section className="section-stack">
        <p className="error-text">{error || "Job not found"}</p>
        <Link
          className="button-link"
          to="/app/jobs"
        >
          Back to jobs
        </Link>
      </section>
    );
  }

  return (
    <section className="section-stack">
      <header className="section-head">
        <h2>Job detail #{job.id}</h2>
        <p>Full captured job payload and lifecycle details.</p>
      </header>
      <article className="card detail-grid">
        <p>
          <strong>Title:</strong> {job.title}
        </p>
        <p>
          <strong>User ID:</strong> {formatValue(job.user_id)}
        </p>
        <p>
          <strong>Company:</strong> {job.company_name}
        </p>
        <p>
          <strong>Location:</strong> {formatValue(job.location)}
        </p>
        <p>
          <strong>Work mode:</strong> {formatValue(job.work_mode)}
        </p>
        <p>
          <strong>Work time:</strong> {formatValue(job.work_time)}
        </p>
        <p>
          <strong>Salary:</strong> {formatValue(job.salary)}
        </p>
        <p>
          <strong>Employment type:</strong> {formatValue(job.employment_type)}
        </p>
        <p>
          <strong>Experience level:</strong> {formatValue(job.experience_level)}
        </p>
        <p>
          <strong>Source platform:</strong> {job.source_platform}
        </p>
        <p>
          <strong>Source URL:</strong>{" "}
          {job.source_url ? (
            <a
              href={job.source_url}
              rel="noreferrer"
              target="_blank"
            >
              Open posting
            </a>
          ) : (
            "N/A"
          )}
        </p>
        <p>
          <strong>Status:</strong> <StatusPill value={job.status} />
        </p>
        <p>
          <strong>Created at:</strong> {formatValue(job.createdAt || job.created_at)}
        </p>
        <p>
          <strong>Updated at:</strong> {formatValue(job.updatedAt || job.updated_at)}
        </p>
        <p>
          <strong>Deleted at:</strong> {formatValue(job.deletedAt || job.deleted_at)}
        </p>
        <label>
          Update status
          <select
            className="input"
            defaultValue=""
            disabled={updating}
            onChange={(event) => {
              if (event.target.value) {
                handleStatusChange(event.target.value);
                event.target.value = "";
              }
            }}
          >
            <option value="">Select status</option>
            {JOB_STATUSES.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>
        </label>
        <div>
          <strong>Skills (from intake):</strong>
          <p>{job.skills?.length ? job.skills.join(", ") : "None"}</p>
        </div>
      </article>

      <article className="card job-detail-description-card">
        <OrganizedJobDescription job={job} />
      </article>

      <article className="card detail-grid">
        <details>
          <summary>Structured JSON (parsed_job)</summary>
          <pre className="code-block">
            {JSON.stringify(job.parsed_job, null, 2)}
          </pre>
        </details>
        <details>
          <summary>Raw payload JSON</summary>
          <pre className="code-block">{JSON.stringify(job.raw_payload, null, 2)}</pre>
        </details>
        <details>
          <summary>Extracted metadata JSON</summary>
          <pre className="code-block">{JSON.stringify(job.extracted_metadata, null, 2)}</pre>
        </details>
      </article>
      {message ? <p className="success-text">{message}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      <Link
        className="button-link"
        to="/app/jobs"
      >
        Back to jobs
      </Link>
    </section>
  );
}
