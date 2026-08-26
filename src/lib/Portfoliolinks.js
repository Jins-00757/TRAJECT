// src/lib/portfolioLinks.js

// Same architecture as the rest of Profile: localStorage only, no backend
// collection for this. A person's GitHub/LinkedIn/portfolio URLs are
// personal metadata, not job-pipeline data, so they don't belong in
// db.json alongside applications/companies/interviews.

const STORAGE_KEY = "traject:portfolioLinks";

// Fixed set of named slots rather than an open-ended list — keeps the UI
// simple (one input per known platform) and avoids needing add/remove
// controls for something that's realistically 3-5 links per person.
export const LINK_FIELDS = [
  { key: "github", label: "GitHub", placeholder: "github.com/yourname" },
  { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/yourname" },
  { key: "portfolio", label: "Portfolio site", placeholder: "yourname.dev" },
  { key: "other", label: "Other link", placeholder: "https://…" },
];

export function getPortfolioLinks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function savePortfolioLinks(links) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

// Prepends https:// only when the value has no scheme at all — a value
// that already starts with some scheme (https://, http://, even ftp://)
// is left untouched, so it never gets a second scheme glued onto the
// front (e.g. "https://ftp://old-site.com").
export function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

// Empty is always valid (every link is optional) — only a non-empty value
// that still fails URL parsing after normalization is an error.
export function validateLinkUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    new URL(normalizeUrl(trimmed));
    return null;
  } catch {
    return "Enter a valid URL";
  }
}