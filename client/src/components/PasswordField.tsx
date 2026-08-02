import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
};

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  minLength,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="training-form-field">
      <label className="training-form-label" htmlFor={id}>{label}</label>
      <div className="auth-password-control">
        <input
          id={id}
          className="training-input"
          type={isVisible ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={minLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
        />
        <button
          type="button"
          className="auth-password-toggle"
          aria-label={isVisible ? `隐藏${label}` : `显示${label}`}
          aria-pressed={isVisible}
          title={isVisible ? `隐藏${label}` : `显示${label}`}
          onClick={() => setIsVisible((visible) => !visible)}
        >
          {isVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
