import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/authApi";
import { HIREREACH_LOGO_URL } from "../constants/branding";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await forgotPassword({ email });
      setMessage(response.message || "Password reset request sent");
    } catch (err) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-card auth-card-elevated">
        <div className="auth-brand-row">
          <img
            alt="HireReach logo"
            className="auth-brand-logo"
            src={HIREREACH_LOGO_URL}
          />
          <p className="eyebrow">HireReach</p>
        </div>
        <p className="eyebrow">Password Recovery</p>
        <h1>Request a reset link</h1>
        <form
          className="form-grid"
          onSubmit={handleSubmit}
        >
          <label>
            Email
            <input
              className="input"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          {message ? <p className="success-text">{message}</p> : null}
          {error ? <p className="error-text">{error}</p> : null}
          <button
            className="primary-btn"
            disabled={loading}
            type="submit"
          >
            {loading ? "Sending..." : "Send reset request"}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/reset-password">Already have reset token?</Link>
          <Link to="/login">Back to login</Link>
        </div>
      </section>
    </div>
  );
}


