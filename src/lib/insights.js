// src/lib/insights.js
import { STATUSES } from "./statusConfig";
import { daysSince } from "./format";

// The funnel only covers stages an application can *advance through*.
// "closed" is terminal (offer taken elsewhere, rejected, withdrawn) and —
// because this data model stores one current `status` per application, not
// a full stage-history log — there's no reliable way to know how far a
// closed application got before it closed. Folding it into the funnel would
// mean guessing at history the data doesn't have, so it's reported
// separately instead (see computeStats).
const FUNNEL_STAGES = STATUSES.filter((s) => s.value !== "closed");
const STAGE_INDEX = Object.fromEntries(
  FUNNEL_STAGES.map((s, i) => [s.value, i]),
);

export const STALE_THRESHOLD_DAYS = 10;

// Cumulative "reached at least this stage" counts among *active* (non-closed)
// applications — the same shape a Salesforce-style pipeline report uses for
// open opportunities. This is a snapshot of the current pipeline, not a
// historical conversion rate (that would need stage-change timestamps).
export function computeFunnel(applications) {
  const active = applications.filter((a) => a.status !== "closed");
  return FUNNEL_STAGES.map((stage, i) => ({
    stage: stage.value,
    label: stage.label,
    count: active.filter((a) => STAGE_INDEX[a.status] >= i).length,
  }));
}

// Applications submitted per week (by appliedDate), plus a running total.
// The running total is the "trajectory" line — a record of effort, not
// outcome, which is deliberate: it only ever goes up.
export function computeApplicationsOverTime(applications) {
  const dated = applications
    .filter((a) => a.appliedDate)
    .map((a) => a.appliedDate)
    .sort();
  if (dated.length === 0) return [];

  function weekStart(iso) {
    const d = new Date(`${iso}T00:00:00`);
    const mondayOffset = (d.getDay() + 6) % 7; // Sun=0 -> Monday-start offset
    d.setDate(d.getDate() - mondayOffset);
    return d.toISOString().slice(0, 10);
  }

  const buckets = new Map();
  for (const date of dated) {
    const wk = weekStart(date);
    buckets.set(wk, (buckets.get(wk) ?? 0) + 1);
  }

  let cumulative = 0;
  return [...buckets.keys()].sort().map((week) => {
    cumulative += buckets.get(week);
    return { week, applied: buckets.get(week), cumulative };
  });
}

// Counts by source, descending.
export function computeSourceBreakdown(applications) {
  const counts = new Map();
  for (const a of applications) {
    const key = a.source?.trim() || "Unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
}

// Active, non-terminal applications with no recorded activity in
// `thresholdDays` — the "these need a follow-up" list. Wishlist/offer/closed
// are excluded on purpose: a stale wishlist entry just means "haven't gotten
// to it yet," not "going cold."
export function computeStaleApplications(
  applications,
  thresholdDays = STALE_THRESHOLD_DAYS,
) {
  return applications
    .filter((a) => a.status === "applied" || a.status === "interviewing")
    .map((a) => ({ ...a, staleDays: daysSince(a.lastActivityDate) ?? 0 }))
    .filter((a) => a.staleDays >= thresholdDays)
    .sort((a, b) => b.staleDays - a.staleDays);
}

export function computeStats(applications) {
  const total = applications.length;
  const closed = applications.filter((a) => a.status === "closed").length;
  const offers = applications.filter((a) => a.status === "offer").length;
  const active = total - closed;
  const stale = computeStaleApplications(applications).length;
  return { total, active, closed, offers, stale };
}
