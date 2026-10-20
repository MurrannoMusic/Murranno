// Tiny field validators shared by every form. Each returns an error message, or '' when the value is fine.
export type Rule = (value: string) => string;

export const required = (label: string): Rule => (v) => (v.trim() ? '' : `Enter ${label}`);
export const email: Rule = (v) => (!v.trim() ? 'Enter your email address' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email address, like name@example.com');
export const minLength = (n: number, label: string): Rule => (v) => (v.trim().length >= n ? '' : `${label} must be at least ${n} characters`);
export const password: Rule = (v) =>
  !v ? 'Enter a password' : v.length < 8 ? 'Use at least 8 characters' : !/[A-Za-z]/.test(v) || !/\d/.test(v) ? 'Use a mix of letters and numbers' : '';
export const matches = (other: string, message = 'Passwords don’t match'): Rule => (v) => (v === other ? '' : message);
/** Nigerian numbers: 0803…, 803…, +234 803… (spaces and dashes allowed). Empty passes; combine with `required`. */
export const ngPhone: Rule = (v) => {
  if (!v.trim()) return '';
  return /^(\+?234|0)?[789][01]\d{8}$/.test(v.replace(/[\s-]/g, '')) ? '' : 'Enter a valid Nigerian phone number, like 0803 123 4567';
};
export const accountNumber: Rule = (v) => (/^\d{10}$/.test(v) ? '' : 'Account numbers have exactly 10 digits');
export const nin: Rule = (v) => (!v.trim() ? 'Enter your NIN' : /^\d{11}$/.test(v.replace(/\s/g, '')) ? '' : 'Your NIN has exactly 11 digits');

/** Runs each field's rules in order and returns the first message per field. */
export function validate<T extends string>(values: Record<T, string>, rules: Partial<Record<T, Rule[]>>) {
  const errors: Partial<Record<T, string>> = {};
  for (const field of Object.keys(rules) as T[]) {
    const message = (rules[field] ?? []).map((rule) => rule(values[field] ?? '')).find(Boolean);
    if (message) errors[field] = message;
  }
  return errors;
}
