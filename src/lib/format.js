export function formatSalary(min, max, currency = "EUR") {
  if (!min && !max) return "Not specified";
  const fmt = (n) => `${Math.round(n / 1000)}k`;
  const symbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : `${currency} `;
  if (min && max) return `${symbol}${fmt(min)}–${fmt(max)}`;
  return `${symbol}${fmt(min || max)}+`;
}

export function formatDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function daysSince(isoString) {
  if (!isoString) return null;
  return Math.floor((Date.now() - new Date(isoString).getTime()) / 86_400_000);
}

export function relativeActivity(isoString) {
  const days = daysSince(isoString);
  if (days === null) return "—";
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days}d ago`;
  return `${days}d ago · stale`;
}