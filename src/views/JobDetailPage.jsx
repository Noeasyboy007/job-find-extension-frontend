import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getJobById } from "../api/jobsApi";
import { JobAnalysisPanel } from "../ui/JobAnalysisPanel";
import { OutreachPanel } from "../ui/OutreachPanel";
import { OrganizedJobDescription } from "../ui/OrganizedJobDescription";
import { StatusPill } from "../ui/StatusPill";
import { formatDateTimeIST, formatJobSourceLabel } from "../utils/format";

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "N/A";
  return String(value);
}

export function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analysisStatus, setAnalysisStatus] = useState("");

  const reloadJob = useCallback(async () => {
    if (!id) return;
    try {
      const response = await getJobById(id);
      setJob(response.data);
    } catch {
      /* keep existing job on refresh failure */
    }
  }, [id]);

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
        <p>Full captured job payload and lifecycle details (IST time format).</p>
      </header>
      <article className="card detail-grid detail-grid-structured">
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
          <strong>Source platform:</strong> {formatJobSourceLabel(job.source_platform)}
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
          <strong>Created at (IST):</strong>{" "}
          {formatDateTimeIST(job.createdAt || job.created_at)}
        </p>
        <div>
          <strong>Skills (from intake):</strong>
          <p>{job.skills?.length ? job.skills.join(", ") : "None"}</p>
        </div>
      </article>

      <article className="card job-detail-description-card">
        <OrganizedJobDescription job={job} />
      </article>

      <JobAnalysisPanel
        jobId={job.id}
        jobStatus={job.status}
        onJobUpdated={reloadJob}
        onAnalysisStatusChange={setAnalysisStatus}
      />

      <OutreachPanel
        jobId={job.id}
        analysisStatus={analysisStatus}
      />

      <article className="card detail-grid detail-grid-json">
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
