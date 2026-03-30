import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createJobIntake, getJobs, updateJobStatus } from "../api/jobsApi";
import { JOB_SOURCE_PLATFORMS, JOB_STATUSES } from "../constants/enums";
import { StatusPill } from "../ui/StatusPill";
import { safeJsonParse } from "../utils/format";

const initialForm = {
  title: "",
  company_name: "",
  location: "",
  work_mode: "",
  work_time: "",
  salary: "",
  source_platform: "manual",
  source_url: "",
  description: "",
  employment_type: "",
  experience_level: "",
  skills: "",
  raw_payload: "",
  extracted_metadata: "",
};

export function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(initialForm);

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

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreate(event) {
    event.preventDefault();
    setCreating(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        title: form.title,
        company_name: form.company_name,
        location: form.location || undefined,
        work_mode: form.work_mode || undefined,
        work_time: form.work_time || undefined,
        salary: form.salary || undefined,
        source_platform: form.source_platform,
        source_url: form.source_url || undefined,
        description: form.description,
        employment_type: form.employment_type || undefined,
        experience_level: form.experience_level || undefined,
        skills: form.skills
          ? form.skills
              .split(",")
              .map((part) => part.trim())
              .filter(Boolean)
          : undefined,
        raw_payload: safeJsonParse(form.raw_payload, undefined),
        extracted_metadata: safeJsonParse(form.extracted_metadata, undefined),
      };
      const response = await createJobIntake(payload);
      setMessage(response.message || "Job added");
      setForm(initialForm);
      await loadJobs();
    } catch (err) {
      setError(err.message || "Could not create job");
    } finally {
      setCreating(false);
    }
  }

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

  return (
    <section className="section-stack">
      <header className="section-head">
        <h2>Saved Jobs</h2>
        <p>Create manual intake entries and track lifecycle states.</p>
      </header>

      <form
        className="card form-grid two-col"
        onSubmit={handleCreate}
      >
        <label>
          Title
          <input
            className="input"
            onChange={(event) => updateField("title", event.target.value)}
            required
            value={form.title}
          />
        </label>
        <label>
          Company
          <input
            className="input"
            onChange={(event) => updateField("company_name", event.target.value)}
            required
            value={form.company_name}
          />
        </label>
        <label>
          Location
          <input
            className="input"
            onChange={(event) => updateField("location", event.target.value)}
            value={form.location}
          />
        </label>
        <label>
          Source platform
          <select
            className="input"
            onChange={(event) => updateField("source_platform", event.target.value)}
            value={form.source_platform}
          >
            {JOB_SOURCE_PLATFORMS.map((source) => (
              <option
                key={source}
                value={source}
              >
                {source}
              </option>
            ))}
          </select>
        </label>
        <label>
          Source URL
          <input
            className="input"
            onChange={(event) => updateField("source_url", event.target.value)}
            value={form.source_url}
          />
        </label>
        <label>
          Salary
          <input
            className="input"
            onChange={(event) => updateField("salary", event.target.value)}
            value={form.salary}
          />
        </label>
        <label>
          Work mode
          <input
            className="input"
            onChange={(event) => updateField("work_mode", event.target.value)}
            value={form.work_mode}
          />
        </label>
        <label>
          Work time
          <input
            className="input"
            onChange={(event) => updateField("work_time", event.target.value)}
            value={form.work_time}
          />
        </label>
        <label>
          Employment type
          <input
            className="input"
            onChange={(event) => updateField("employment_type", event.target.value)}
            value={form.employment_type}
          />
        </label>
        <label>
          Experience level
          <input
            className="input"
            onChange={(event) => updateField("experience_level", event.target.value)}
            value={form.experience_level}
          />
        </label>
        <label className="full">
          Skills (comma-separated)
          <input
            className="input"
            onChange={(event) => updateField("skills", event.target.value)}
            value={form.skills}
          />
        </label>
        <label className="full">
          Description
          <textarea
            className="input textarea"
            onChange={(event) => updateField("description", event.target.value)}
            required
            rows={6}
            value={form.description}
          />
        </label>
        <label className="full">
          Raw payload JSON (optional)
          <textarea
            className="input textarea"
            onChange={(event) => updateField("raw_payload", event.target.value)}
            placeholder='{"source":"manual"}'
            rows={4}
            value={form.raw_payload}
          />
        </label>
        <label className="full">
          Extracted metadata JSON (optional)
          <textarea
            className="input textarea"
            onChange={(event) => updateField("extracted_metadata", event.target.value)}
            placeholder='{"intent":"high-fit"}'
            rows={4}
            value={form.extracted_metadata}
          />
        </label>
        {message ? <p className="success-text full">{message}</p> : null}
        {error ? <p className="error-text full">{error}</p> : null}
        <button
          className="primary-btn full"
          disabled={creating}
          type="submit"
        >
          {creating ? "Saving..." : "Save job intake"}
        </button>
      </form>

      <article className="card">
        <h3>Job list</h3>
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
                    <td>{job.source_platform}</td>
                    <td>
                      <StatusPill value={job.status} />
                    </td>
                    <td className="inline-actions">
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
    </section>
  );
}

