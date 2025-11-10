import { useState, useEffect } from "react";
import "./Login.scss";
import { validateEmail, validatePassword } from "../../utils/validation";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../../hooks/useLogin";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

type FormState = {
  email: string;
  password: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const loginMutation = useLogin();

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath =
        user.role === "admin" ? "/admin/dashboard" : "/rooms";
      navigate(redirectPath);
    }
  }, [isAuthenticated, user, navigate]);

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateField = (field: keyof FormState, value: string) => {
    let error: string | null = null;
    if (field === "email") error = validateEmail(value);
    if (field === "password") error = validatePassword(value);
    setErrors((prev) => ({ ...prev, [field]: error || undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);

    const newErrors: FormErrors = {
      email: emailError || undefined,
      password: passwordError || undefined,
    };
    setErrors(newErrors);

    if (emailError || passwordError) return;

    loginMutation.mutate({
      email: form.email,
      password: form.password,
    });
  };

  return (
    <div className="login-page">
      <div className="auth-card">
        <h1 className="brand">Hotel Booking</h1>
        <h2 className="title">Welcome back</h2>

        <form className="form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className={`form-group ${errors.email ? "has-error" : ""}`}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              onBlur={(e) => validateField("email", e.target.value)}
              autoComplete="email"
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className={`form-group ${errors.password ? "has-error" : ""}`}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Your secure password"
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              onBlur={(e) => validateField("password", e.target.value)}
              autoComplete="current-password"
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          {/* Submit Button */}
          <button
            className="submit"
            type="submit"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing in…" : "Sign In"}
          </button>

          {/* Error Message */}
          {loginMutation.isError && (
            <p className="error-text mt-2">
              Failed to login. Please check your credentials.
            </p>
          )}

          {/* Signup Link */}
          <div className="flex items-center gap-1 mt-3">
            <h2 className="text-gray-900 text-sm">Don't have an account?</h2>
            <Link className="brand hover:underline" to="/signup">
              Create one
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
