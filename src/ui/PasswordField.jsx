import { useState } from "react";

export function PasswordField({
  label,
  value,
  onChange,
  required = false,
  minLength,
  autoComplete,
  placeholder,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="password-field-label">
      {label}
      <div className="password-wrap">
        <input
          autoComplete={autoComplete}
          className="input password-input"
          minLength={minLength}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          type={visible ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={visible ? "Hide password" : "Show password"}
          className="password-toggle-btn"
          onClick={() => setVisible((prev) => !prev)}
          type="button"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </label>
  );
}
