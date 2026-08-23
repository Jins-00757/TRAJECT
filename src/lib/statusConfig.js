export const STATUSES = [
  { value: "wishlist", label: "Wishlist", color: "gray" },
  { value: "applied", label: "Applied", color: "blue" },
  { value: "interviewing", label: "Interviewing", color: "violet" },
  { value: "offer", label: "Offer", color: "teal" },
  { value: "closed", label: "Closed", color: "red" },
];

export const STATUS_MAP = Object.fromEntries(STATUSES.map((s) => [s.value, s]));
export const STATUS_OPTIONS = STATUSES.map(({ value, label }) => ({ value, label }));