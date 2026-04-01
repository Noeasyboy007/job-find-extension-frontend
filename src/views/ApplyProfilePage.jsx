import { useEffect, useState } from "react";
import { getApplyProfile, upsertApplyProfile } from "../api/applyProfileApi";

const WORK_MODES = [
  { value: "any", label: "Any" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

const NOTICE_PERIOD_PRESETS = [
  { label: "Immediate", days: 0 },
  { label: "15 Days", days: 15 },
  { label: "30 Days", days: 30 },
  { label: "45 Days", days: 45 },
  { label: "60 Days", days: 60 },
  { label: "90 Days", days: 90 },
  { label: "Negotiable", days: null },
];

const CURRENCY_OPTIONS = ["INR", "USD", "EUR", "GBP", "AED", "SGD", "AUD"];

const EMPTY = {
  current_company: "",
  current_designation: "",
  total_experience_months: "",
  current_ctc: "",
  current_ctc_currency: "INR",
  expected_ctc_min: "",
  expected_ctc_max: "",
  expected_ctc_currency: "INR",
  notice_period_days: "",
  notice_period_label: "",
  current_city: "",
  current_state: "",
  current_country: "",
  current_pincode: "",
  preferred_locations: [],
  preferred_location_input: "",
  willing_to_relocate: "",
  work_mode_preference: "any",
  linkedin_url: "",
  github_url: "",
  portfolio_url: "",
  summary_note: "",
};

function toForm(data) {
  if (!data) return EMPTY;
  return {
    current_company: data.current_company ?? "",
    current_designation: data.current_designation ?? "",
    total_experience_months: data.total_experience_months != null ? String(data.total_experience_months) : "",
    current_ctc: data.current_ctc != null ? String(data.current_ctc) : "",
    current_ctc_currency: data.current_ctc_currency ?? "INR",
    expected_ctc_min: data.expected_ctc_min != null ? String(data.expected_ctc_min) : "",
    expected_ctc_max: data.expected_ctc_max != null ? String(data.expected_ctc_max) : "",
    expected_ctc_currency: data.expected_ctc_currency ?? "INR",
    notice_period_days: data.notice_period_days != null ? String(data.notice_period_days) : "",
    notice_period_label: data.notice_period_label ?? "",
    current_city: data.current_city ?? "",
    current_state: data.current_state ?? "",
    current_country: data.current_country ?? "",
    current_pincode: data.current_pincode ?? "",
    preferred_locations: Array.isArray(data.preferred_locations) ? data.preferred_locations : [],
    preferred_location_input: "",
    willing_to_relocate: data.willing_to_relocate == null ? "" : String(data.willing_to_relocate),
    work_mode_preference: data.work_mode_preference ?? "any",
    linkedin_url: data.linkedin_url ?? "",
    github_url: data.github_url ?? "",
    portfolio_url: data.portfolio_url ?? "",
    summary_note: data.summary_note ?? "",
  };
}

function toPayload(form) {
  const num = (v) => (v === "" || v == null ? undefined : Number(v));
  const str = (v) => (v === "" || v == null ? undefined : v);
  const bool = (v) => (v === "" || v == null ? undefined : v === "true");
  return {
    current_company: str(form.current_company),
    current_designation: str(form.current_designation),
    total_experience_months: num(form.total_experience_months),
    current_ctc: num(form.current_ctc),
    current_ctc_currency: str(form.current_ctc_currency),
    expected_ctc_min: num(form.expected_ctc_min),
    expected_ctc_max: num(form.expected_ctc_max),
    expected_ctc_currency: str(form.expected_ctc_currency),
    notice_period_days: form.notice_period_label === "Negotiable" ? undefined : num(form.notice_period_days),
    notice_period_label: str(form.notice_period_label),
    current_city: str(form.current_city),
    current_state: str(form.current_state),
    current_country: str(form.current_country),
    current_pincode: str(form.current_pincode),
    preferred_locations: form.preferred_locations.length ? form.preferred_locations : [],
    willing_to_relocate: bool(form.willing_to_relocate),
    work_mode_preference: str(form.work_mode_preference),
    linkedin_url: str(form.linkedin_url),
    github_url: str(form.github_url),
    portfolio_url: str(form.portfolio_url),
    summary_note: str(form.summary_note),
  };
}

function experienceLabel(months) {
  if (!months && months !== 0) return "";
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} month${m !== 1 ? "s" : ""}`;
  if (m === 0) return `${y} year${y !== 1 ? "s" : ""}`;
  return `${y} yr ${m} mo`;
}

export function ApplyProfilePage() {
  const [form, setForm] = useState(EMPTY);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getApplyProfile()
      .then((res) => {
        if (!cancelled) setForm(toForm(res.data));
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || "Could not load profile");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addPreferredLocation() {
    const loc = form.preferred_location_input.trim();
    if (!loc || form.preferred_locations.includes(loc)) return;
    set("preferred_locations", [...form.preferred_locations, loc]);
    set("preferred_location_input", "");
  }

  function removePreferredLocation(loc) {
    set("preferred_locations", form.preferred_locations.filter((l) => l !== loc));
  }

  function applyNoticePreset(preset) {
    set("notice_period_label", preset.label);
    set("notice_period_days", preset.days != null ? String(preset.days) : "");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaveMessage("");
    setSaveError("");
    try {
      await upsertApplyProfile(toPayload(form));
      setSaveMessage("Apply profile saved. The extension autofill will now use this data.");
    } catch (err) {
      setSaveError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="section-stack">
        <p className="muted">Loading apply profile…</p>
      </section>
    );
  }

  const expMonths = Number(form.total_experience_months);

  return (
    <section className="section-stack">
      <header className="section-head">
        <h2>Job Apply Profile</h2>
        <p className="muted">
          This data supplements your parsed resume during extension autofill — filling CTC, location,
          notice period, and other details that are not in a typical CV.
        </p>
      </header>

      {loadError ? <p className="error-text">{loadError}</p> : null}

      <form className="apply-profile-form" onSubmit={handleSubmit}>

        {/* ── Current role ──────────────────────────────────────── */}
        <div className="card apply-profile-section">
          <h3 className="apply-profile-section-title">Current role</h3>
          <div className="form-grid-two-col">
            <label>
              Current company
              <input
                className="input"
                placeholder="e.g. Infosys"
                value={form.current_company}
                onChange={(e) => set("current_company", e.target.value)}
              />
            </label>
            <label>
              Current designation
              <input
                className="input"
                placeholder="e.g. Software Engineer"
                value={form.current_designation}
                onChange={(e) => set("current_designation", e.target.value)}
              />
            </label>
            <label>
              Total experience (months)
              <div className="apply-exp-row">
                <input
                  className="input"
                  type="number"
                  min="0"
                  max="600"
                  placeholder="e.g. 30"
                  value={form.total_experience_months}
                  onChange={(e) => set("total_experience_months", e.target.value)}
                />
                {expMonths > 0 ? (
                  <span className="apply-exp-label muted">{experienceLabel(expMonths)}</span>
                ) : null}
              </div>
              <span className="apply-field-hint">30 months = 2 years 6 months</span>
            </label>
          </div>
        </div>

        {/* ── CTC ───────────────────────────────────────────────── */}
        <div className="card apply-profile-section">
          <h3 className="apply-profile-section-title">Compensation (CTC)</h3>
          <div className="form-grid-two-col">
            <label>
              Current CTC
              <div className="apply-ctc-row">
                <select
                  className="input apply-ctc-currency"
                  value={form.current_ctc_currency}
                  onChange={(e) => set("current_ctc_currency", e.target.value)}
                >
                  {CURRENCY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="e.g. 700000"
                  value={form.current_ctc}
                  onChange={(e) => set("current_ctc", e.target.value)}
                />
              </div>
            </label>
            <div>
              <label style={{ marginBottom: "0.35rem", display: "block" }}>
                Expected CTC range
              </label>
              <div className="apply-ctc-row">
                <select
                  className="input apply-ctc-currency"
                  value={form.expected_ctc_currency}
                  onChange={(e) => set("expected_ctc_currency", e.target.value)}
                >
                  {CURRENCY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={form.expected_ctc_min}
                  onChange={(e) => set("expected_ctc_min", e.target.value)}
                />
                <span className="muted apply-ctc-sep">–</span>
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={form.expected_ctc_max}
                  onChange={(e) => set("expected_ctc_max", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Notice period ─────────────────────────────────────── */}
        <div className="card apply-profile-section">
          <h3 className="apply-profile-section-title">Availability &amp; notice period</h3>
          <div className="apply-notice-presets">
            {NOTICE_PERIOD_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                className={`apply-notice-preset-btn${form.notice_period_label === p.label ? " active" : ""}`}
                onClick={() => applyNoticePreset(p)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="form-grid-two-col" style={{ marginTop: "0.75rem" }}>
            <label>
              Notice period label (shown on forms)
              <input
                className="input"
                placeholder="e.g. 30 Days"
                value={form.notice_period_label}
                onChange={(e) => set("notice_period_label", e.target.value)}
              />
            </label>
            <label>
              Notice period in days (for numeric fields)
              <input
                className="input"
                type="number"
                min="0"
                max="365"
                placeholder="e.g. 30"
                value={form.notice_period_days}
                onChange={(e) => set("notice_period_days", e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* ── Location ──────────────────────────────────────────── */}
        <div className="card apply-profile-section">
          <h3 className="apply-profile-section-title">Current location</h3>
          <div className="form-grid-two-col">
            <label>
              City
              <input className="input" placeholder="e.g. Kolkata" value={form.current_city} onChange={(e) => set("current_city", e.target.value)} />
            </label>
            <label>
              State
              <input className="input" placeholder="e.g. West Bengal" value={form.current_state} onChange={(e) => set("current_state", e.target.value)} />
            </label>
            <label>
              Country
              <input className="input" placeholder="e.g. India" value={form.current_country} onChange={(e) => set("current_country", e.target.value)} />
            </label>
            <label>
              Pincode
              <input className="input" placeholder="e.g. 700001" value={form.current_pincode} onChange={(e) => set("current_pincode", e.target.value)} />
            </label>
          </div>

          <div className="apply-preferred-loc-section">
            <label style={{ display: "block", marginBottom: "0.4rem" }}>
              Preferred locations (autofill multi-select fields)
            </label>
            <div className="apply-preferred-loc-tags">
              {form.preferred_locations.map((loc) => (
                <span key={loc} className="apply-loc-tag">
                  {loc}
                  <button type="button" className="apply-loc-tag-remove" onClick={() => removePreferredLocation(loc)}>×</button>
                </span>
              ))}
            </div>
            <div className="apply-preferred-loc-add-row">
              <input
                className="input"
                placeholder="Type a location and press Add"
                value={form.preferred_location_input}
                onChange={(e) => set("preferred_location_input", e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPreferredLocation(); } }}
              />
              <button type="button" className="ghost-btn" onClick={addPreferredLocation}>Add</button>
            </div>
          </div>
        </div>

        {/* ── Work preference ───────────────────────────────────── */}
        <div className="card apply-profile-section">
          <h3 className="apply-profile-section-title">Work preference</h3>
          <div className="form-grid-two-col">
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Work mode</label>
              <div className="apply-radio-group">
                {WORK_MODES.map((m) => (
                  <label key={m.value} className="apply-radio-label">
                    <input
                      type="radio"
                      name="work_mode_preference"
                      value={m.value}
                      checked={form.work_mode_preference === m.value}
                      onChange={() => set("work_mode_preference", m.value)}
                    />
                    {m.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Willing to relocate?</label>
              <div className="apply-radio-group">
                {[{ value: "true", label: "Yes" }, { value: "false", label: "No" }].map((opt) => (
                  <label key={opt.value} className="apply-radio-label">
                    <input
                      type="radio"
                      name="willing_to_relocate"
                      value={opt.value}
                      checked={form.willing_to_relocate === opt.value}
                      onChange={() => set("willing_to_relocate", opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Online profiles ───────────────────────────────────── */}
        <div className="card apply-profile-section">
          <h3 className="apply-profile-section-title">Online profiles</h3>
          <div className="form-grid-two-col">
            <label>
              LinkedIn URL
              <input className="input" type="url" placeholder="https://linkedin.com/in/yourname" value={form.linkedin_url} onChange={(e) => set("linkedin_url", e.target.value)} />
            </label>
            <label>
              GitHub URL
              <input className="input" type="url" placeholder="https://github.com/yourname" value={form.github_url} onChange={(e) => set("github_url", e.target.value)} />
            </label>
            <label>
              Portfolio / website URL
              <input className="input" type="url" placeholder="https://yoursite.com" value={form.portfolio_url} onChange={(e) => set("portfolio_url", e.target.value)} />
            </label>
          </div>
        </div>

        {/* ── Summary note ──────────────────────────────────────── */}
        <div className="card apply-profile-section">
          <h3 className="apply-profile-section-title">Additional notes for autofill</h3>
          <label>
            <span className="apply-field-hint" style={{ display: "block", marginBottom: "0.4rem" }}>
              Anything you want the AI to include when filling open-ended fields (e.g. short intro, key skills emphasis).
            </span>
            <textarea
              className="input textarea"
              rows={4}
              maxLength={3000}
              placeholder="e.g. Experienced backend developer specializing in Node.js and distributed systems..."
              value={form.summary_note}
              onChange={(e) => set("summary_note", e.target.value)}
            />
          </label>
        </div>

        {saveMessage ? <p className="success-text">{saveMessage}</p> : null}
        {saveError ? <p className="error-text">{saveError}</p> : null}

        <button className="primary-btn apply-profile-save-btn" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save apply profile"}
        </button>
      </form>
    </section>
  );
}
