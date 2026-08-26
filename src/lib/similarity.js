// src/lib/similarity.js

// Strips common legal suffixes and punctuation before comparing, so
// "OutSystems" and "OutSystems Inc." are recognized as the same company.
export function normalizeCompanyName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\b(inc|llc|ltd|corp|co|gmbh|sa|srl)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Classic iterative Levenshtein (edit distance) — two rows, no recursion,
// no dependency. Small enough not to need a library for this.
export function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prevRow = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const currRow = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currRow[j] = Math.min(currRow[j - 1] + 1, prevRow[j] + 1, prevRow[j - 1] + cost);
    }
    prevRow = currRow;
  }
  return prevRow[n];
}

// Returns { company, kind: "exact" | "fuzzy" } for the closest match, or
// null if nothing is close enough to warn about. Threshold scales with
// name length (30%, min 1) so short names still catch a one-letter typo
// ("Uber" vs "Ubere") without flagging every short, genuinely different
// name against every other short name.
export function findDuplicateCompany(name, companies) {
  const normalized = normalizeCompanyName(name);
  if (!normalized) return null;

  const exact = companies.find((c) => normalizeCompanyName(c.name) === normalized);
  if (exact) return { company: exact, kind: "exact" };

  let best = null;
  for (const c of companies) {
    const candidate = normalizeCompanyName(c.name);
    if (!candidate) continue;
    const distance = levenshtein(normalized, candidate);
    const threshold = Math.max(1, Math.round(Math.max(normalized.length, candidate.length) * 0.3));
    if (distance <= threshold && (!best || distance < best.distance)) {
      best = { company: c, distance };
    }
  }
  return best ? { company: best.company, kind: "fuzzy" } : null;
}