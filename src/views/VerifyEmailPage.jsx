import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { resendVerification, verifyEmail } from "../api/authApi";

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleVerify(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await verifyEmail(token);
      toast.success(response.message || "Verification successful");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.message || "Verification failed");
      toast.error(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend(event) {
    event.preventDefault();
    setResendLoading(true);
    setError("");
    try {
      const response = await resendVerification({ email });
      toast.success(response.message || "Verification email request sent");
    } catch (err) {
      setError(err.message || "Resend verification failed");
      toast.error(err.message || "Resend verification failed");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-card auth-card-elevated">
        <p className="eyebrow">Email Verification</p>
        <h1>Activate your account</h1>

        <form
          className="form-grid"
          onSubmit={handleVerify}
        >
          <label>
            Verification token
            <input
              className="input"
              onChange={(event) => setToken(event.target.value)}
              required
              value={token}
            />
          </label>
          <button
            className="primary-btn"
            disabled={loading}
            type="submit"
          >
            {loading ? "Verifying..." : "Verify now"}
          </button>
        </form>

        <hr className="separator" />

        <form
          className="form-grid"
          onSubmit={handleResend}
        >
          <label>
            Resend to email
            <input
              className="input"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <button
            className="ghost-btn"
            disabled={resendLoading}
            type="submit"
          >
            {resendLoading ? "Sending..." : "Resend verification"}
          </button>
        </form>

        {error ? <p className="error-text">{error}</p> : null}
        <div className="auth-links">
          <Link to="/login">Back to login</Link>
        </div>
      </section>
    </div>
  );
}

