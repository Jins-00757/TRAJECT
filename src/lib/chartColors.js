// src/lib/chartColors.js
// Both sets are SELECTED per color-scheme mode, not one set with
// opacity/brightness applied at render time — the ordinal ramp in
// particular needs a different step nearest the surface in each mode so it
// still clears a 2:1 contrast floor in both directions.

export const FUNNEL_COLORS = {
  light: ["#86b6ef", "#3987e5", "#1c5cab", "#0d366b"],
  dark: ["#9ec5f4", "#5598e7", "#256abf", "#184f95"],
};

export const SOURCE_COLORS = {
  light: ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4"],
  dark: ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181"],
};

export const TRAJECTORY_LINE = { light: "#256abf", dark: "#5598e7" };