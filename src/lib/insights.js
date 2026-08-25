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

// Salary midpoint per application (min+max averaged), sorted ascending and
// capped so the chart stays readable — applications with no salary data at
// all are excluded rather than plotted as a false "0".
export function computeSalaryRanges(applications, limit = 8) {
  return applications
    .filter((a) => a.salaryMin && a.salaryMax)
    .map((a) => ({
      name: a.company?.name || "Unknown",
      min: a.salaryMin,
      max: a.salaryMax,
      mid: (a.salaryMin + a.salaryMax) / 2,
    }))
    .sort((a, b) => a.mid - b.mid)
    .slice(0, limit);
}

// Applications submitted per calendar month (by appliedDate). Bucketed by a
// sortable "YYYY-MM" key first, THEN formatted to a display label — sorting
// the display label directly ("Aug 26" vs "Jul 26") would sort alphabetically,
// not chronologically, which silently scrambles the x-axis once the data
// spans a year boundary.
export function computeMonthlyTimeline(applications) {
  const buckets = new Map();
  for (const a of applications) {
    if (!a.appliedDate) continue;
    const d = new Date(`${a.appliedDate}T00:00:00`);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.keys()].sort().map((key) => ({
    key,
    month: new Date(`${key}-01T00:00:00`).toLocaleString("default", { month: "short", year: "2-digit" }),
    applications: buckets.get(key),
  }));
}

// Three-way status split for the pie chart: in-progress (wishlist, applied,
// interviewing — anything still moving), offers, and closed. Adds up to
// `applications.length` exactly, unlike the funnel above, which double-counts
// on purpose (cumulative reached-stage) — these two are answering different
// questions and shouldn't be expected to match.
export function computeStatusBreakdown(applications) {
  const closed = applications.filter((a) => a.status === "closed").length;
  const offers = applications.filter((a) => a.status === "offer").length;
  const inProgress = applications.length - closed - offers;
  return [
    { name: "In progress", value: inProgress },
    { name: "Offers", value: offers },
    { name: "Closed", value: closed },
  ];
}