import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { deleteResume, getResumeById, getResumes, uploadResume } from "../api/resumeApi";
import { StatusPill } from "../ui/StatusPill";
import { bytesToSize } from "../utils/format";

export function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [confirmTarget, setConfirmTarget] = useState(null);

  async function loadResumes() {
    setLoading(true);
    setError("");
    try {
      const response = await getResumes();
      setResumes(response.data || []);
    } catch (err) {
      const message = err.message || "Could not load resumes";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResumes();
  }, []);

  async function handleUpload(event) {
    event.preventDefault();
    if (!file) {
      const message = "Please choose a file to upload.";
      setError(message);
      toast.error(message);
      return;
    }
    setUploading(true);
    setError("");
    try {
      const response = await uploadResume({ file, fileName });
      toast.success(response.message || "Resume uploaded");
      setFile(null);
      setFileName("");
      await loadResumes();
    } catch (err) {
      const message = err.message || "Upload failed";
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  async function handleInspect(id) {
    setError("");
    try {
      const response = await getResumeById(id);
      setSelectedResume(response.data);
      toast.success("Resume details loaded");
    } catch (err) {
      const message = err.message || "Resume detail fetch failed";
      setError(message);
      toast.error(message);
    }
  }

  function openDeleteModal(resume) {
    setConfirmTarget(resume);
  }

  function closeDeleteModal() {
    if (deleting) return;
    setConfirmTarget(null);
  }

  async function handleDeleteConfirmed() {
    if (!confirmTarget) return;
    const id = confirmTarget.id;
    setDeleting(true);
    setError("");
    try {
      await deleteResume(id);
      toast.success("Resume deleted");
      if (selectedResume?.id === id) {
        setSelectedResume(null);
      }
      setConfirmTarget(null);
      await loadResumes();
    } catch (err) {
      const message = err.message || "Delete failed";
      setError(message);
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="section-stack">
      <header className="section-head">
        <h2>Resumes</h2>
        <p>Upload and monitor parsing lifecycle with backend status flags.</p>
      </header>

      <form
        className="card form-grid form-grid-two-col"
        onSubmit={handleUpload}
      >
        <label>
          Resume file (.pdf, .doc, .docx)
          <input
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="input"
            onChange={(event) => {
              const selectedFile = event.target.files?.[0] || null;
              setFile(selectedFile);
              setFileName(selectedFile?.name || "");
            }}
            required
            type="file"
          />
        </label>
        <label>
          Display file name (optional)
          <input
            className="input"
            onChange={(event) => setFileName(event.target.value)}
            value={fileName}
          />
        </label>
        {error ? <p className="error-text">{error}</p> : null}
        <button
          className="primary-btn"
          disabled={uploading}
          type="submit"
        >
          {uploading ? "Uploading..." : "Upload resume"}
        </button>
      </form>

      <article className="card">
        <h3>Resume list</h3>
        {loading ? <p>Loading resumes...</p> : null}
        {!loading && resumes.length === 0 ? <p>No resumes uploaded yet.</p> : null}
        {!loading && resumes.length > 0 ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Size</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {resumes.map((resume) => (
                  <tr key={resume.id}>
                    <td>{resume.id}</td>
                    <td>{resume.file_name}</td>
                    <td>
                      <StatusPill value={resume.status} />
                    </td>
                    <td>{bytesToSize(resume.file_size)}</td>
                    <td className="inline-actions">
                      <button
                        className="text-btn"
                        onClick={() => handleInspect(resume.id)}
                        type="button"
                      >
                        View
                      </button>
                      <button
                        className="text-btn text-btn-danger"
                        onClick={() => openDeleteModal(resume)}
                        type="button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </article>

      {selectedResume ? (
        <article className="card">
          <h3>Resume detail #{selectedResume.id}</h3>
          <p>
            <strong>Type:</strong> {selectedResume.file_type || "Unknown"}
          </p>
          <p>
            <strong>URL:</strong>{" "}
            {selectedResume.file_url ? (
              <a
                href={selectedResume.file_url}
                rel="noreferrer"
                target="_blank"
              >
                Open file
              </a>
            ) : (
              "Not available"
            )}
          </p>
          <p>
            <strong>Error message:</strong> {selectedResume.error_message || "None"}
          </p>
          <details>
            <summary>Parsed data JSON</summary>
            <pre className="code-block">{JSON.stringify(selectedResume.parsed_data, null, 2)}</pre>
          </details>
        </article>
      ) : null}

      {confirmTarget ? (
        <div
          className="modal-backdrop"
          role="presentation"
        >
          <div
            aria-modal="true"
            className="modal-card"
            role="dialog"
          >
            <h3>Confirm Resume Delete</h3>
            <p>
              Are you sure you want to delete <strong>{confirmTarget.file_name}</strong>?
            </p>
            <div className="modal-actions">
              <button
                className="ghost-btn"
                onClick={closeDeleteModal}
                type="button"
              >
                Cancel
              </button>
              <button
                className="danger-btn"
                disabled={deleting}
                onClick={handleDeleteConfirmed}
                type="button"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
