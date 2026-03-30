import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../api/authApi";
import { PasswordField } from "../ui/PasswordField";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }
    try {
      const response = await resetPassword({
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      toast.success(response.message || "Password reset successful");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.message || "Reset failed");
      toast.error(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-card auth-card-elevated">
        <p className="eyebrow">Reset Password</p>
        <h1>Set a new password</h1>
        <form
          className="form-grid"
          onSubmit={handleSubmit}
        >
          <label>
            Reset token
            <input
              className="input"
              onChange={(event) => setToken(event.target.value)}
              required
              value={token}
            />
          </label>
          <PasswordField
            label="New password"
            minLength={6}
            onChange={setNewPassword}
            required
            value={newPassword}
          />
          <PasswordField
            label="Confirm password"
            minLength={6}
            onChange={setConfirmPassword}
            required
            value={confirmPassword}
          />
          {error ? <p className="error-text">{error}</p> : null}
          <button
            className="primary-btn"
            disabled={loading}
            type="submit"
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/login">Back to login</Link>
        </div>
      </section>
    </div>
  );
}

