// src/lib/validators.js
export const required = (message = "Required") => (value) =>
  value === undefined || value === null || value === "" ? message : undefined;

export const minLength = (min, message) => (value) =>
  value && value.length < min ? (message ?? `Must be at least ${min} characters`) : undefined;

export const maxLength = (max, message) => (value) =>
  value && value.length > max ? (message ?? `Must be at most ${max} characters`) : undefined;

export const inRange = (min, max, message) => (value) =>
  value !== undefined && value !== null && value !== "" && (value < min || value > max)
    ? (message ?? `Must be between ${min} and ${max}`)
    : undefined;

// Optional by design — pair with required() if the field must be filled.
export const isUrl = (message = "Enter a valid URL") => (value) => {
  if (!value) return undefined;
  try {
    new URL(value);
    return undefined;
  } catch {
    return message;
  }
};

export function compose(...validators) {
  return (value, allValues) => {
    for (const validator of validators) {
      const error = validator(value, allValues);
      if (error) return error;
    }
    return undefined;
  };
}