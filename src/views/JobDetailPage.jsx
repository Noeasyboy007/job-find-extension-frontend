import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getJobById, updateJobStatus } from "../api/jobsApi";
import { JOB_STATUSES } from "../constants/enums";
import { StatusPill } from "../ui/StatusPill";

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
        <p>Track metadata from captured posting and manual status updates.</p>
      </header>
      <article className="card detail-grid">
        <p>
          <strong>Title:</strong> {job.title}
        </p>
        <p>
          <strong>Company:</strong> {job.company_name}
        </p>
        <p>
          <strong>Location:</strong> {job.location || "N/A"}
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
          <strong>Description:</strong>
          <pre className="code-block">{job.description}</pre>
        </div>
        <div>
          <strong>Skills:</strong>
          <p>{job.skills?.length ? job.skills.join(", ") : "No skills extracted"}</p>
        </div>
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

