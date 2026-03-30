import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { signup } from "../api/authApi";
import { HIREREACH_LOGO_URL } from "../constants/branding";
import { useCountryCodes } from "../hooks/useCountryCodes";
import { PasswordField } from "../ui/PasswordField";

export function SignupPage() {
  const navigate = useNavigate();
  const { countryCodes, loading: countryCodeLoading, error: countryCodeError } = useCountryCodes();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    country_code: "",
    phone_number: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        last_name: form.last_name || undefined,
        country_code: form.country_code || undefined,
        phone_number: form.phone_number || undefined,
      };
      const response = await signup(payload);
      toast.success(response.message || "Signup successful. Please verify your email.");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.message || "Signup failed");
      toast.error(err.message || "Signup failed");
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
        <p className="eyebrow">Create Account</p>
        <h1>Build your HireReach profile</h1>
        <p className="muted">After signup, verify email before login.</p>
        <form
          className="form-grid"
          onSubmit={handleSubmit}
        >
          <label>
            First name
            <input
              className="input"
              onChange={(event) => updateField("first_name", event.target.value)}
              required
              value={form.first_name}
            />
          </label>
          <label>
            Last name
            <input
              className="input"
              onChange={(event) => updateField("last_name", event.target.value)}
              value={form.last_name}
            />
          </label>
          <label>
            Email
            <input
              className="input"
              onChange={(event) => updateField("email", event.target.value)}
              required
              type="email"
              value={form.email}
            />
          </label>
          <label>
            Country code
            <select
              className="input"
              onChange={(event) => updateField("country_code", event.target.value)}
              value={form.country_code}
            >
              <option value="">{countryCodeLoading ? "Loading..." : "Select country code"}</option>
              {countryCodes.map((item) => (
                <option
                  key={item.id}
                  value={item.country_code}
                >
                  {item.country_name} ({item.country_code})
                </option>
              ))}
            </select>
          </label>
          {countryCodeError ? <p className="error-text">{countryCodeError}</p> : null}
          <label>
            Phone number
            <input
              className="input"
              onChange={(event) => updateField("phone_number", event.target.value)}
              value={form.phone_number}
            />
          </label>
          <PasswordField
            label="Password"
            minLength={6}
            onChange={(value) => updateField("password", value)}
            required
            value={form.password}
          />
          {error ? <p className="error-text">{error}</p> : null}
          <button
            className="primary-btn"
            disabled={loading}
            type="submit"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/login">Back to login</Link>
          <Link to="/verify-email">Already have token?</Link>
        </div>
      </section>
    </div>
  );
}

