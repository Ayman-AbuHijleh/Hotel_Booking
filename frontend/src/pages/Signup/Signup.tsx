import { useState } from "react";
import "./Signup.scss";
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validatePhoneNumber,
  validateName,
} from "../../utils/validation";

import { useNavigate } from "react-router-dom";

import type { RegisterData, RegisterResponse } from "../../services/user.api";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../../services/user.api";

type FormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const registerMutation = useMutation<RegisterResponse, unknown, RegisterData>(
    {
      mutationFn: registerUser,
    }
  );

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateField = (field: keyof FormState, value: string) => {
    let error: string | null = null;
    if (field === "name") error = validateName(value);
    if (field === "email") error = validateEmail(value);
    if (field === "password") error = validatePassword(value);
    if (field === "confirmPassword")
      error = validateConfirmPassword(form.password, value);
    if (field === "phone") error = validatePhoneNumber(value);
    setErrors((prev) => ({ ...prev, [field]: error || undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setMessage(null);

    const newErrors: FormErrors = {
      name: validateName(form.name) || undefined,
      email: validateEmail(form.email) || undefined,
      password: validatePassword(form.password) || undefined,
      confirmPassword:
        validateConfirmPassword(form.password, form.confirmPassword) ||
        undefined,
      phone: validatePhoneNumber(form.phone) || undefined,
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    registerMutation.mutate(
      {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
      },
      {
        onSuccess(data) {
          setMessage(`Account created successfully! Welcome, ${data.name}`);
          setShowModal(true);
          setForm({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
          });
          setErrors({});
          navigate("/");
        },
        onError(error: any) {
          const msg =
            error?.response?.data?.message ||
            error.message ||
            "Registration failed.";
          setMessage(msg);
          setShowModal(true);
        },
      }
    );
  };

  const closeModal = () => {
    setShowModal(false);
    setMessage(null);
  };

  return (
    <div className="signup-page">
      <div className="auth-card">
        <h1 className="brand">Hotel Booking</h1>
        <h2 className="title">Create your account</h2>
        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className={`form-group ${errors.name ? "has-error" : ""}`}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              onBlur={(e) => validateField("name", e.target.value)}
              autoComplete="name"
            />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>

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

          <div className={`form-group ${errors.password ? "has-error" : ""}`}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              onBlur={(e) => validateField("password", e.target.value)}
              autoComplete="new-password"
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <div
            className={`form-group ${
              errors.confirmPassword ? "has-error" : ""
            }`}
          >
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={(e) => setField("confirmPassword", e.target.value)}
              onBlur={(e) => validateField("confirmPassword", e.target.value)}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="error-text">{errors.confirmPassword}</p>
            )}
          </div>

          <div className={`form-group ${errors.phone ? "has-error" : ""}`}>
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              placeholder="Digits only"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              onBlur={(e) => validateField("phone", e.target.value)}
              autoComplete="tel"
              inputMode="numeric"
            />
            {errors.phone && <p className="error-text">{errors.phone}</p>}
          </div>

          <button
            className="submit"
            type="submit"
            disabled={registerMutation.status === "pending"}
          >
            {registerMutation.status === "pending"
              ? "Creating…"
              : "Create Account"}
          </button>
        </form>
      </div>

      {/* modal for error*/}
      {showModal && message && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p>{message}</p>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
