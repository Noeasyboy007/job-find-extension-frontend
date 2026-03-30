function safeArr(v) {
  return Array.isArray(v) ? v.filter((x) => x != null && String(x).trim() !== "") : [];
}

function splitParagraphs(text) {
  if (!text || !String(text).trim()) return [];
  return String(text)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function ProseBlock({ text, className = "" }) {
  const paras = splitParagraphs(text);
  if (!paras.length) return null;
  return (
    <div className={`job-desc-prose ${className}`.trim()}>
      {paras.map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  );
}

function BulletBlock({ items, className = "job-desc-list" }) {
  const list = safeArr(items);
  if (!list.length) return null;
  return (
    <ul className={className}>
      {list.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function SkillTags({ skills }) {
  const list = safeArr(skills);
  if (!list.length) return null;
  return (
    <ul className="job-skill-tags" aria-label="Skills">
      {list.map((s, i) => (
        <li key={i} className="job-skill-tag">
          {s}
        </li>
      ))}
    </ul>
  );
}

function MirrorSections({ sections }) {
  const list = safeArr(sections);
  if (!list.length) return null;
  return (
    <div className="job-desc-mirror">
      {list.map((block, i) => {
        const heading =
          block?.heading != null && String(block.heading).trim()
            ? String(block.heading).trim()
            : null;
        const paragraph =
          block?.paragraph != null && String(block.paragraph).trim()
            ? String(block.paragraph).trim()
            : null;
        const bullets = safeArr(block?.bullets);
        if (!heading && !paragraph && !bullets.length) return null;
        return (
          <section className="job-desc-block" key={i}>
            {heading ? <h4 className="job-desc-heading">{heading}</h4> : null}
            {paragraph ? <ProseBlock text={paragraph} /> : null}
            {bullets.length ? <BulletBlock items={bullets} /> : null}
          </section>
        );
      })}
    </div>
  );
}

function hasSemanticBody(p) {
  if (!p || typeof p !== "object") return false;
  return !!(
    p.about_company ||
    p.role_overview ||
    safeArr(p.benefits).length ||
    safeArr(p.team_reporting).length ||
    safeArr(p.responsibilities).length ||
    safeArr(p.requirements).length ||
    safeArr(p.nice_to_have).length ||
    p.logistics_notes
  );
}

/**
 * Renders AI-structured job copy (parsed_job) like a polished careers page.
 * Prefers description_sections (mirror of the posting) when present; otherwise uses semantic fields.
 */
export function OrganizedJobDescription({ job }) {
  const p =
    job?.parsed_job && typeof job.parsed_job === "object" ? job.parsed_job : null;
  const mirror = safeArr(p?.description_sections);
  const hasMirror = mirror.length > 0;
  const hasSemantic = hasSemanticBody(p);
  const hasSummary = p?.summary != null && String(p.summary).trim() !== "";
  const hasSkills = safeArr(p?.skills).length > 0;
  const hasStructured =
    p && (hasSummary || hasSemantic || hasMirror || hasSkills);

  const companyLabel = job?.company_name || "the company";

  return (
    <div className="job-desc-organized">
      {job?.error_message && job?.status === "failed" ? (
        <p className="error-text">Processing error: {job.error_message}</p>
      ) : null}

      {(job?.status === "captured" || job?.status === "processing") &&
      !hasStructured ? (
        <p className="muted">Structured description is processing…</p>
      ) : null}

      {hasStructured ? (
        <>
          <h3 className="job-desc-page-title">Full job description</h3>

          {hasSummary ? (
            <section className="job-desc-block">
              <h4 className="job-desc-heading">Summary</h4>
              <ProseBlock text={p.summary} />
            </section>
          ) : null}

          {hasMirror ? (
            <MirrorSections sections={mirror} />
          ) : (
            <>
              {p.about_company ? (
                <section className="job-desc-block">
                  <h4 className="job-desc-heading">About {companyLabel}</h4>
                  <ProseBlock text={p.about_company} />
                </section>
              ) : null}

              {safeArr(p.benefits).length ? (
                <section className="job-desc-block">
                  <h4 className="job-desc-heading">Why join us?</h4>
                  <BulletBlock items={p.benefits} />
                </section>
              ) : null}

              {p.role_overview ? (
                <section className="job-desc-block">
                  <h4 className="job-desc-heading">About the role</h4>
                  <ProseBlock text={p.role_overview} />
                </section>
              ) : null}

              {safeArr(p.responsibilities).length ? (
                <section className="job-desc-block">
                  <h4 className="job-desc-heading">Responsibilities</h4>
                  <BulletBlock items={p.responsibilities} />
                </section>
              ) : null}

              {safeArr(p.team_reporting).length ? (
                <section className="job-desc-block">
                  <h4 className="job-desc-heading">Team & reporting structure</h4>
                  <BulletBlock items={p.team_reporting} />
                </section>
              ) : null}

              {safeArr(p.requirements).length ? (
                <section className="job-desc-block">
                  <h4 className="job-desc-heading">Requirements</h4>
                  <BulletBlock items={p.requirements} />
                </section>
              ) : null}

              {safeArr(p.nice_to_have).length ? (
                <section className="job-desc-block">
                  <h4 className="job-desc-heading">Nice to have</h4>
                  <BulletBlock items={p.nice_to_have} />
                </section>
              ) : null}

              {p.logistics_notes ? (
                <section className="job-desc-block">
                  <h4 className="job-desc-heading">Location, schedule & logistics</h4>
                  <ProseBlock text={p.logistics_notes} />
                </section>
              ) : null}
            </>
          )}

          {hasSkills ? (
            <section className="job-desc-block">
              <h4 className="job-desc-heading">Skills</h4>
              <SkillTags skills={p.skills} />
            </section>
          ) : null}
        </>
      ) : null}

      {!hasStructured && job?.description ? (
        <section className="job-desc-block">
          <h4 className="job-desc-heading">Description</h4>
          <pre className="code-block job-desc-fallback">{job.description}</pre>
        </section>
      ) : hasStructured && job?.description ? (
        <details className="job-desc-raw">
          <summary>Original posting text</summary>
          <pre className="code-block">{job.description}</pre>
        </details>
      ) : null}
    </div>
  );
}

/** Short line for job list / table preview */
export function jobDescriptionSnippet(job, maxLen = 140) {
  const parsed =
    job?.parsed_job && typeof job.parsed_job === "object" ? job.parsed_job : null;
  const fromParsed =
    (parsed?.summary && String(parsed.summary).trim()) ||
    (parsed?.role_overview && String(parsed.role_overview).trim()) ||
    (parsed?.about_company && String(parsed.about_company).trim()) ||
    "";
  const raw = job?.description && String(job.description).trim();
  const text = fromParsed || raw || "";
  if (text.length <= maxLen) return text || "—";
  return `${text.slice(0, maxLen - 1).trim()}…`;
}
