import { useCallback, useEffect, useRef, useState } from "react";
import { analyzeJob, getJobAnalysis } from "../api/jobAnalysisApi";
import { JobAnalysisStatusPill } from "./JobAnalysisStatusPill";
import { formatDateTimeIST } from "../utils/format";

const POLL_MS = 2800;
const BLOCKED_JOB_STATUSES = new Set(["captured", "processing", "failed"]);

function resultList(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="muted">None listed</p>;
  }
  return (
    <ul className="analysis-bullet-list">
      {items.map((item, i) => (
        <li key={`${i}-${String(item).slice(0, 24)}`}>{item}</li>
      ))}
    </ul>
  );
}

/**
 * @param {object} props
 * @param {number} props.jobId
 * @param {string} props.jobStatus
 * @param {() => Promise<void>} [props.onJobUpdated] refresh parent job (e.g. after analysis completes)
 * @param {(status: string) => void} [props.onAnalysisStatusChange] notifies parent of current analysis status
 */
export function JobAnalysisPanel({ jobId, jobStatus, onJobUpdated, onAnalysisStatusChange }) {
  const [analysis, setAnalysis] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [analyzeBusy, setAnalyzeBusy] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const prevStatusRef = useRef(null);

  const loadAnalysis = useCallback(async () => {
    setLoadError("");
    try {
      const response = await getJobAnalysis(jobId);
      setAnalysis(response.data ?? null);
    } catch (err) {
      setLoadError(err.message || "Could not load job analysis");
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    setLoading(true);
    loadAnalysis();
  }, [loadAnalysis]);

  useEffect(() => {
    const st = analysis?.status;
    onAnalysisStatusChange?.(st ?? "");

    const shouldPoll = st === "queued" || st === "processing";
    if (!shouldPoll) {
      if (
        st === "completed" &&
        prevStatusRef.current &&
        prevStatusRef.current !== "completed"
      ) {
        onJobUpdated?.();
      }
      prevStatusRef.current = st ?? null;
      return undefined;
    }
    prevStatusRef.current = st;
    const id = window.setInterval(() => {
      loadAnalysis();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [analysis?.status, loadAnalysis, onJobUpdated]);

  const blocked = BLOCKED_JOB_STATUSES.has(jobStatus);
  const busyPipeline = analysis?.status === "queued" || analysis?.status === "processing";

  async function handleAnalyze() {
    setAnalyzeError("");
    setAnalyzeBusy(true);
    try {
      await analyzeJob(jobId);
      await loadAnalysis();
    } catch (err) {
      setAnalyzeError(err.message || "Could not start analysis");
    } finally {
      setAnalyzeBusy(false);
    }
  }

  const result = analysis?.result && typeof analysis.result === "object" ? analysis.result : null;
  const summary = typeof result?.summary === "string" ? result.summary : null;
  const recommendation =
    typeof result?.recommendation === "string" ? result.recommendation : null;
  const strengths = Array.isArray(result?.strengths) ? result.strengths : [];
  const gaps = Array.isArray(result?.gaps) ? result.gaps : [];
  const fitScore =
    typeof result?.fit_score === "number" && Number.isFinite(result.fit_score)
      ? result.fit_score
      : typeof analysis?.fit_score === "number"
        ? analysis.fit_score
        : null;

  return (
    <article className="card job-analysis-card">
      <div className="job-analysis-head">
        <h3>Resume match</h3>
        <p className="muted">
          Compare your active parsed resume to this job (queued on the server).
        </p>
      </div>

      {loadError ? <p className="error-text">{loadError}</p> : null}
      {loading ? <p className="muted">Loading analysis…</p> : null}

      {!loading && !analysis ? (
        <p className="muted">No analysis yet. Run when the job is ready.</p>
      ) : null}

      {!loading && analysis ? (
        <div className="job-analysis-meta">
          <p>
            <strong>Analysis status:</strong>{" "}
            <JobAnalysisStatusPill value={analysis.status} />
          </p>
          {fitScore !== null ? (
            <p>
              <strong>Fit score:</strong>{" "}
              <span className="fit-score-value">{fitScore}</span>
              <span className="muted"> / 100</span>
            </p>
          ) : null}
          <p className="muted small-meta">
            Updated {formatDateTimeIST(analysis.updated_at || analysis.updatedAt)}
          </p>
          {analysis.status === "failed" && analysis.error_message ? (
            <p className="error-text">{analysis.error_message}</p>
          ) : null}
        </div>
      ) : null}

      <div className="job-analysis-actions">
        <button
          className="primary-btn"
          type="button"
          disabled={blocked || analyzeBusy || busyPipeline}
          onClick={handleAnalyze}
        >
          {busyPipeline
            ? "Analysis running…"
            : analysis?.status === "completed"
              ? "Run again"
              : "Run analysis"}
        </button>
        {blocked ? (
          <p className="muted job-analysis-hint">
            Wait until structuring finishes (
            <strong>ready for analysis</strong>) or fix a failed job before running match.
          </p>
        ) : null}
        {analyzeError ? <p className="error-text">{analyzeError}</p> : null}
      </div>

      {!loading && analysis?.status === "completed" && result ? (
        <div className="job-analysis-body">
          {summary ? (
            <section className="analysis-section">
              <h4>Summary</h4>
              <p>{summary}</p>
            </section>
          ) : null}
          <section className="analysis-section">
            <h4>Strengths</h4>
            {resultList(strengths)}
          </section>
          <section className="analysis-section">
            <h4>Gaps</h4>
            {resultList(gaps)}
          </section>
          {recommendation ? (
            <section className="analysis-section">
              <h4>Recommendation</h4>
              <p>{recommendation}</p>
            </section>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
