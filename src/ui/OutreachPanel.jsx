import { useCallback, useEffect, useRef, useState } from "react";
import { generateOutreach, getOutreachList, updateOutreach } from "../api/outreachApi";
import { getJobContacts } from "../api/contactsApi";
import { formatDateTimeIST } from "../utils/format";

const POLL_MS = 2800;

const MESSAGE_TYPES = [
  { value: "recruiter", label: "Recruiter / HR message" },
  { value: "founder", label: "Founder / CEO message" },
  { value: "connection_request", label: "LinkedIn connection note" },
];

/** Map a contact's role text → the best outreach message type. */
function inferOutreachType(role) {
  const r = (role || "").toLowerCase();
  if (
    r.includes("found") ||
    r.includes("ceo") ||
    r.includes("cto") ||
    r.includes("chief") ||
    r.includes("co-founder") ||
    r.includes("cofounder") ||
    r.includes("owner") ||
    r.includes("director")
  ) {
    return "founder";
  }
  return "recruiter";
}

function GenerationStatusPill({ value }) {
  return (
    <span className={`status-pill status-${value || "default"}`}>
      {value === "completed"
        ? "Generated"
        : value === "queued"
          ? "Queued"
          : value === "processing"
            ? "Generating…"
            : value === "failed"
              ? "Failed"
              : value || "Unknown"}
    </span>
  );
}

function MessageStatusSelect({ value, onChange, disabled }) {
  return (
    <select
      className="input outreach-status-select"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="draft">Draft</option>
      <option value="sent">Sent</option>
      <option value="replied">Replied</option>
      <option value="archived">Archived</option>
    </select>
  );
}

function CopyButton({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button className="ghost-btn outreach-copy-btn" type="button" onClick={handleCopy}>
      {copied ? "Copied!" : label}
    </button>
  );
}

function OutreachCard({ draft, onUpdated }) {
  const [content, setContent] = useState(draft.content ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setContent(draft.content ?? "");
  }, [draft.content]);

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      const res = await updateOutreach(draft.id, { content });
      onUpdated(res.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setSaveError(err.message || "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(status) {
    try {
      const res = await updateOutreach(draft.id, { status });
      onUpdated(res.data);
    } catch {
      /* silent */
    }
  }

  const typeLabel =
    MESSAGE_TYPES.find((t) => t.value === draft.type)?.label ?? draft.type;
  const isReady = draft.generation_status === "completed";
  const isBusy =
    draft.generation_status === "queued" || draft.generation_status === "processing";
  const isFailed = draft.generation_status === "failed";

  return (
    <div className="outreach-card card">
      <div className="outreach-card-head">
        <p className="outreach-card-type-label">{typeLabel}</p>
        <div className="outreach-card-meta">
          <GenerationStatusPill value={draft.generation_status} />
          {isReady ? (
            <MessageStatusSelect
              value={draft.status}
              onChange={handleStatusChange}
              disabled={false}
            />
          ) : null}
        </div>
      </div>

      <p className="muted outreach-card-date">
        Created {formatDateTimeIST(draft.created_at || draft.createdAt)}
      </p>

      {/* Contact info banner */}
      {draft.contact_name ? (
        <div className="outreach-contact-banner">
          <span className="outreach-contact-for">For:</span>
          <strong className="outreach-contact-name">{draft.contact_name}</strong>
          {draft.contact_role ? (
            <span className="outreach-contact-role-badge">{draft.contact_role}</span>
          ) : null}
        </div>
      ) : null}

      {/* Email row — shown once message is generated */}
      {draft.contact_email && isReady ? (
        <div className="outreach-email-row">
          <span className="outreach-email-icon">✉</span>
          <span className="outreach-email-address">{draft.contact_email}</span>
          <CopyButton text={draft.contact_email} label="Copy email" />
        </div>
      ) : null}

      {isBusy ? (
        <p className="muted outreach-generating-hint">
          Generating your message — this takes a few seconds…
        </p>
      ) : null}

      {isFailed && draft.error_message ? (
        <p className="error-text">{draft.error_message}</p>
      ) : null}

      {isReady ? (
        <div className="outreach-content-area">
          <label className="outreach-textarea-label">
            Message (editable)
            <textarea
              className="input textarea outreach-textarea"
              value={content}
              rows={8}
              onChange={(e) => setContent(e.target.value)}
            />
          </label>
          <div className="outreach-card-actions">
            <button
              className="primary-btn"
              type="button"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            <CopyButton text={content} label="Copy message" />
          </div>
          {saveSuccess ? <p className="success-text">Saved!</p> : null}
          {saveError ? <p className="error-text">{saveError}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * @param {{ jobId: number, analysisStatus: string }} props
 */
export function OutreachPanel({ jobId, analysisStatus }) {
  const [drafts, setDrafts] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [generateBusy, setGenerateBusy] = useState("");
  const [generateError, setGenerateError] = useState("");

  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  const prevHasBusyRef = useRef(false);

  const loadDrafts = useCallback(async () => {
    setLoadError("");
    try {
      const res = await getOutreachList(jobId);
      setDrafts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setLoadError(err.message || "Could not load outreach messages");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    setLoading(true);
    loadDrafts();
  }, [loadDrafts]);

  /* Load discovered contacts for this job */
  useEffect(() => {
    let cancelled = false;
    setContactsLoading(true);
    getJobContacts(jobId)
      .then((res) => {
        if (!cancelled) {
          setContacts(Array.isArray(res.data) ? res.data : []);
        }
      })
      .catch(() => {
        /* silently ignore — contacts section just won't show */
      })
      .finally(() => {
        if (!cancelled) setContactsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  /* Poll while any draft is in-progress */
  useEffect(() => {
    const hasBusy = drafts.some(
      (d) => d.generation_status === "queued" || d.generation_status === "processing",
    );

    if (!hasBusy && prevHasBusyRef.current) {
      loadDrafts();
    }
    prevHasBusyRef.current = hasBusy;

    if (!hasBusy) return undefined;

    const id = window.setInterval(() => {
      loadDrafts();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [drafts, loadDrafts]);

  async function handleGenerate(type, contactId) {
    const key = contactId ? `contact-${contactId}` : type;
    setGenerateError("");
    setGenerateBusy(key);
    try {
      const res = await generateOutreach(jobId, type, contactId ?? null);
      setDrafts((prev) => [res.data, ...prev]);
    } catch (err) {
      setGenerateError(err.message || "Could not start generation");
    } finally {
      setGenerateBusy("");
    }
  }

  function handleUpdated(updated) {
    setDrafts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  }

  const analysisNotDone = analysisStatus !== "completed";

  return (
    <article className="card outreach-panel">
      <div className="outreach-panel-head">
        <h3>Outreach drafts</h3>
        <p className="muted">
          AI-generated messages for this job. Edit and track in one place.
        </p>
      </div>

      {analysisNotDone ? (
        <p className="muted outreach-blocked-hint">
          Complete the <strong>Resume match</strong> analysis first — outreach uses your
          match strengths to write a personalised message.
        </p>
      ) : (
        <>
          {/* ── Contact-aware generate section ── */}
          {!contactsLoading && contacts.length > 0 ? (
            <div className="outreach-contact-section">
              <p className="outreach-section-label">
                Generate for a discovered contact
              </p>
              {contacts.map((c) => {
                const busyKey = `contact-${c.id}`;
                const type = inferOutreachType(c.role);
                return (
                  <div key={c.id} className="outreach-contact-generate-item">
                    <div className="outreach-contact-generate-info">
                      <strong>{c.name || "Unknown contact"}</strong>
                      {c.role ? (
                        <span className="outreach-contact-role-badge">{c.role}</span>
                      ) : null}
                      {c.email ? (
                        <span className="muted outreach-contact-email-hint">✉ {c.email}</span>
                      ) : null}
                      {c.phone ? (
                        <span className="muted outreach-contact-email-hint">📞 {c.phone}</span>
                      ) : null}
                    </div>
                    <button
                      className="primary-btn outreach-gen-contact-btn"
                      type="button"
                      disabled={!!generateBusy}
                      onClick={() => handleGenerate(type, c.id)}
                    >
                      {generateBusy === busyKey ? "Queuing…" : "Generate"}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* ── Generic message-type buttons ── */}
          <div className="outreach-generic-section">
            {contacts.length > 0 ? (
              <p className="outreach-section-label">Generic messages</p>
            ) : null}
            <div className="outreach-generate-row">
              {MESSAGE_TYPES.map((t) => (
                <button
                  key={t.value}
                  className="ghost-btn outreach-gen-btn"
                  type="button"
                  disabled={!!generateBusy}
                  onClick={() => handleGenerate(t.value, null)}
                >
                  {generateBusy === t.value ? "Queuing…" : `+ ${t.label}`}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {generateError ? <p className="error-text">{generateError}</p> : null}
      {loadError ? <p className="error-text">{loadError}</p> : null}
      {loading ? <p className="muted">Loading drafts…</p> : null}
      {!loading && drafts.length === 0 && !analysisNotDone ? (
        <p className="muted">No drafts yet. Generate your first message above.</p>
      ) : null}

      {drafts.length > 0 ? (
        <div className="outreach-list">
          {drafts.map((draft) => (
            <OutreachCard key={draft.id} draft={draft} onUpdated={handleUpdated} />
          ))}
        </div>
      ) : null}
    </article>
  );
}
