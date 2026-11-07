import { useState } from "react";
import "./Auth.css";

const API_URL = "http://127.0.0.1:5000/api";

const initialForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  password: "",
  confirm_password: "",
  client_id: "",
  role: "student",
};

export default function Login() {
  const [mode, setMode] = useState("signup");
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  const isSignup = mode === "signup";

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setForm(initialForm);
    setMessage("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (isSignup && form.password !== form.confirm_password) {
      setMessage("Passwords do not match.");
      return;
    }

    if (
      isSignup &&
      !/^[6-9]\d{9}$/.test(form.phone.trim())
    ) {
      setMessage(
        "Enter a valid 10-digit Indian mobile number."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/${isSignup ? "signup" : "login"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(
            isSignup
              ? {
                  ...form,
                  phone: form.phone.trim(),
                  client_id: form.client_id.trim(),
                }
              : {
                  email: form.email.trim(),
                  password: form.password,
                }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setMessage(data.message);

      if (data.user) {
        setUser(data.user);
      }

      if (isSignup) {
        setMode("signin");

        setForm({
          ...initialForm,
          email: form.email,
        });
      }
    } catch (error) {
      setMessage(
        error.message || "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      setMessage("You have been logged out.");
      setForm(initialForm);
      setMode("signin");
    } catch {
      setMessage("Unable to log out.");
    }
  };

  if (user) {
    return (
      <main className="auth-page">
        <div className="auth-card dashboard-card">
          <div className="brand-mark">A</div>

          <h1>Welcome, {user.first_name}!</h1>

          <p className="dashboard-description">
            You have successfully signed in.
          </p>

          <div className="user-details">
            <p>
              <strong>Email:</strong> {user.email}
            </p>

            <p>
              <strong>Client ID:</strong> {user.client_id}
            </p>

            <p>
              <strong>Role:</strong> {user.role}
            </p>
          </div>

          <button
            className="primary-button"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="ambient-light light-one"></div>
      <div className="ambient-light light-two"></div>

      <section className="auth-card">
        <button
          type="button"
          className="close-button"
          aria-label="Clear form"
          onClick={() => {
            setForm(initialForm);
            setMessage("");
          }}
        >
          ×
        </button>

        <div className="auth-tabs">
          <button
            type="button"
            className={isSignup ? "active" : ""}
            onClick={() => switchMode("signup")}
          >
            Sign up
          </button>

          <button
            type="button"
            className={!isSignup ? "active" : ""}
            onClick={() => switchMode("signin")}
          >
            Sign in
          </button>
        </div>

        <div className="auth-heading">
          <h1>
            {isSignup
              ? "Create an account"
              : "Welcome back"}
          </h1>

          <p>
            {isSignup
              ? "Create your account to get started."
              : "Enter your details to sign in."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div className="name-row">
              <input
                type="text"
                name="first_name"
                placeholder="First name"
                value={form.first_name}
                onChange={updateField}
                autoComplete="given-name"
                maxLength={50}
                required
              />

              <input
                type="text"
                name="last_name"
                placeholder="Last name"
                value={form.last_name}
                onChange={updateField}
                autoComplete="family-name"
                maxLength={50}
                required
              />
            </div>
          )}

          <div className="input-group">
            <span className="input-icon">✉</span>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={updateField}
              autoComplete="email"
              maxLength={254}
              required
            />
          </div>

          {isSignup && (
            <>
              <div className="input-group phone-group">
                <span className="country-code">🇮🇳 +91</span>

                <input
                  type="tel"
                  name="phone"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={(event) => {
                    const value = event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);

                    setForm((previous) => ({
                      ...previous,
                      phone: value,
                    }));
                  }}
                  inputMode="numeric"
                  autoComplete="tel-national"
                  maxLength={10}
                  pattern="[6-9][0-9]{9}"
                  required
                />
              </div>

              <div className="input-group">
                <span className="input-icon">⌑</span>

                <input
                  type="text"
                  name="client_id"
                  placeholder="Enter your Client ID"
                  value={form.client_id}
                  onChange={updateField}
                  autoComplete="off"
                  maxLength={50}
                  required
                />
              </div>

              <div className="input-group">
                <span className="input-icon">♙</span>

                <select
                  name="role"
                  value={form.role}
                  onChange={updateField}
                  required
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="client">Client</option>
                </select>
              </div>
            </>
          )}

          <div className="input-group password-group">
            <span className="input-icon">♙</span>

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={updateField}
              autoComplete={
                isSignup ? "new-password" : "current-password"
              }
              minLength={8}
              maxLength={128}
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword((previous) => !previous)
              }
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {isSignup && (
            <div className="input-group password-group">
              <span className="input-icon">♙</span>

              <input
                type={
                  showConfirmPassword ? "text" : "password"
                }
                name="confirm_password"
                placeholder="Confirm password"
                value={form.confirm_password}
                onChange={updateField}
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    (previous) => !previous
                  )
                }
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          )}

          {!isSignup && (
            <div className="form-extra">
              <span>Secure sign in</span>

              <button
                type="button"
                onClick={() =>
                  setMessage(
                    "Password reset is not configured yet. Contact your administrator."
                  )
                }
              >
                Forgot password?
              </button>
            </div>
          )}

          {message && (
            <div
              className="form-message"
              role="status"
              aria-live="polite"
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isSignup
                ? "Create an account"
                : "Sign in"}
          </button>
        </form>

        <div className="divider">
          <span>
            {isSignup
              ? "YOUR ACCOUNT, YOUR ACCESS"
              : "SECURE ACCOUNT ACCESS"}
          </span>
        </div>

        <p className="terms-text">
          {isSignup
            ? "By creating an account, you agree to our Terms of Service."
            : "Your account information is protected by secure authentication."}
        </p>

        <p className="switch-text">
          {isSignup
            ? "Already have an account?"
            : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() =>
              switchMode(isSignup ? "signin" : "signup")
            }
          >
            {isSignup ? "Sign in" : "Sign up"}
          </button>
        </p>
      </section>
    </main>
  );
}