import { useState } from "react";
import { updateProfile } from "../api/authApi";
import { useCountryCodes } from "../hooks/useCountryCodes";
import { useAuth } from "../state/useAuth";

export function ProfilePage() {
  const { countryCodes, loading: countryCodeLoading, error: countryCodeError } = useCountryCodes();
  const { user, reloadUser } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    country_code: user?.country_code || "",
    phone_number: user?.phone_number || "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const countryOptions = [...countryCodes];
  if (
    form.country_code &&
    !countryOptions.some((item) => item.country_code === form.country_code)
  ) {
    countryOptions.unshift({
      id: "current",
      country_name: "Current",
      country_code: form.country_code,
      iso_code: "",
    });
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await updateProfile({
        first_name: form.first_name || undefined,
        last_name: form.last_name || undefined,
        country_code: form.country_code || undefined,
        phone_number: form.phone_number || undefined,
      });
      await reloadUser();
      setMessage("Profile updated successfully");
    } catch (err) {
      setError(err.message || "Profile update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section-stack">
      <header className="section-head">
        <h2>Profile</h2>
        <p>Update your account details synced with `PATCH /auth/profile`.</p>
      </header>

      <form
        className="card form-grid"
        onSubmit={handleSubmit}
      >
        <label>
          First name
          <input
            className="input"
            onChange={(event) => updateField("first_name", event.target.value)}
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
          Country code
          <select
            className="input"
            onChange={(event) => updateField("country_code", event.target.value)}
            value={form.country_code}
          >
            <option value="">{countryCodeLoading ? "Loading..." : "Select country code"}</option>
            {countryOptions.map((item) => (
              <option
                key={`${item.id}-${item.country_code}`}
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
        {message ? <p className="success-text">{message}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        <button
          className="primary-btn"
          disabled={loading}
          type="submit"
        >
          {loading ? "Saving..." : "Save profile"}
        </button>
      </form>
    </section>
  );
}
