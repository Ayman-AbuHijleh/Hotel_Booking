export function validateEmail(email: string): string | null {
  if (!email || email.trim() === "") return "Email is required";
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return regex.test(email) ? null : "Please enter a valid email address";
}

export function validatePassword(password: string): string | null {
  if (!password || password.trim() === "") return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  return null;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): string | null {
  if (!confirmPassword || confirmPassword.trim() === "")
    return "Please confirm your password";
  return password === confirmPassword ? null : "Passwords do not match";
}

export function validatePhoneNumber(phone: string): string | null {
  if (!phone || phone.trim() === "") return "Phone number is required";
  const digitsOnly = phone.replace(/\D/g, "");
  if (!/^\d+$/.test(digitsOnly)) return "Phone number must contain only digits";
  if (digitsOnly.length < 7 || digitsOnly.length > 15)
    return "Phone number length should be 7-15 digits";
  return null;
}

export function validateName(name: string): string | null {
  if (!name || name.trim() === "") return "Name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  return null;
}
