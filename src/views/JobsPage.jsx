import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getJobs } from "../api/jobsApi";
import { JOB_SOURCE_PLATFORMS } from "../constants/enums";
import { jobDescriptionSnippet } from "../ui/OrganizedJobDescription";
import { StatusPill } from "../ui/StatusPill";
import { formatDateTimeIST, formatJobSourceLabel } from "../utils/format";

const PAGE_LIMIT = 10;

export function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [sourcePlatform, setSourcePlatform] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    total_pages: 1,
  });

  async function loadJobs() {
    setLoading(true);
    setError("");
    try {
      const response = await getJobs({
        page,
        limit: PAGE_LIMIT,
        q: query,
        source_platform: sourcePlatform,
      });
      const payload = response.data;

      if (Array.isArray(payload)) {
        setJobs(payload);
        setMeta({
          page: 1,
          limit: payload.length || PAGE_LIMIT,
          total: payload.length,
          total_pages: 1,
        });
        return;
      }

      const items = Array.isArray(payload?.items) ? payload.items : [];
      setJobs(items);
      setMeta({
        page: Number(payload?.page || page),
        limit: Number(payload?.limit || PAGE_LIMIT),
        total: Number(payload?.total || 0),
        total_pages: Math.max(1, Number(payload?.total_pages || 1)),
      });
    } catch (err) {
      setError(err.message || "Could not load jobs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, [page, query, sourcePlatform]);

  function onSearchSubmit(event) {
    event.preventDefault();
    const nextQuery = searchInput.trim();
    if (nextQuery === query) return;
    setPage(1);
    setQuery(nextQuery);
  }

  function onPlatformChange(event) {
    setPage(1);
    setSourcePlatform(event.target.value);
  }

  function clearFilters() {
    setSearchInput("");
    setQuery("");
    setSourcePlatform("");
    setPage(1);
  }

  const canGoPrev = meta.page > 1;
  const canGoNext = meta.page < meta.total_pages;

  return (
    <section className="section-stack">
      <header className="section-head">
        <h2>Saved Jobs</h2>
        <p>Track captured jobs and update lifecycle states.</p>
      </header>

      <article className="card jobs-table-card">
        <h3>Job list</h3>
        <form className="jobs-controls" onSubmit={onSearchSubmit}>
          <input
            className="input jobs-search-input"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by title or company"
          />
          <select
            className="input jobs-filter-select"
            value={sourcePlatform}
            onChange={onPlatformChange}
          >
            <option value="">All platforms</option>
            {JOB_SOURCE_PLATFORMS.map((platform) => (
              <option key={platform} value={platform}>
                {formatJobSourceLabel(platform)}
              </option>
            ))}
          </select>
          <button className="text-btn" type="submit">
            Search
          </button>
          <button className="text-btn" type="button" onClick={clearFilters}>
            Clear
          </button>
        </form>

        {error ? <p className="error-text">{error}</p> : null}
        {loading ? <p>Loading jobs...</p> : null}
        {!loading && jobs.length === 0 ? <p>No saved jobs yet.</p> : null}
        {!loading && jobs.length > 0 ? (
          <>
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

            <div className="jobs-pagination">
              <p className="muted">
                Showing page {meta.page} of {meta.total_pages} ({meta.total} jobs)
              </p>
              <div className="inline-actions">
                <button
                  className="text-btn"
                  type="button"
                  disabled={!canGoPrev || loading}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </button>
                <button
                  className="text-btn"
                  type="button"
                  disabled={!canGoNext || loading}
                  onClick={() =>
                    setPage((prev) => Math.min(meta.total_pages, prev + 1))
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : null}
      </article>
    </section>
  );
}
