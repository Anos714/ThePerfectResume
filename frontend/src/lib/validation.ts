// Shared auth-form validation. The password rules mirror the backend's zod
// schemas so a form that passes client-side never gets a 422 back.

export const USERNAME_MIN_LENGTH = 3;

export const passwordRequirements = [
  { label: "8+ characters", test: (v: string) => v.length >= 8 },
  {
    label: "Uppercase & lowercase",
    test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v),
  },
  { label: "A number", test: (v: string) => /[0-9]/.test(v) },
  { label: "A special character", test: (v: string) => /[!@#$%^&*]/.test(v) },
];

export function isValidPassword(password: string): boolean {
  return passwordRequirements.every((requirement) =>
    requirement.test(password),
  );
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}
