import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HIREREACH_LOGO_URL } from "../constants/branding";
import { useAuth } from "../state/useAuth";
import { PasswordField } from "../ui/PasswordField";

export function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login({ email, password });
      const fallback = "/app/dashboard";
      const nextPath = location.state?.from || fallback;
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
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
        <p className="eyebrow">HireReach Login</p>
        <h1>Step into strategic job search</h1>
        <p className="muted">Use your account to manage resumes and saved jobs.</p>
        <form
          className="form-grid"
          onSubmit={handleSubmit}
        >
          <label>
            Email
            <input
              autoComplete="email"
              className="input"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <PasswordField
            autoComplete="current-password"
            label="Password"
            onChange={setPassword}
            required
            value={password}
          />
          {error ? <p className="error-text">{error}</p> : null}
          <button
            className="primary-btn"
            disabled={loading}
            type="submit"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/signup">Create account</Link>
          <Link to="/forgot-password">Forgot password</Link>
          <Link to="/verify-email">Verify email</Link>
        </div>
      </section>
    </div>
  );
}

