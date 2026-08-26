// src/lib/confetti.js
import confetti from "canvas-confetti";

// Confetti is pure celebration, not information — skipping it entirely for
// prefers-reduced-motion users is the correct call, not a nice-to-have.
function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function celebrateOffer() {
  if (prefersReducedMotion()) return;

  const duration = 1500;
  const end = Date.now() + duration;
  const colors = ["#0d9488", "#14b8a6", "#facc15", "#fb923c"]; // teal (theme primaryColor) + gold

  (function frame() {
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors, disableForReducedMotion: true });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors, disableForReducedMotion: true });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}