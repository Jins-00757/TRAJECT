// src/lib/ics.js

function pad(n) { return String(n).padStart(2, "0"); }

function toICSDate(date) {
  return (
    date.getUTCFullYear() + pad(date.getUTCMonth() + 1) + pad(date.getUTCDate()) +
    "T" + pad(date.getUTCHours()) + pad(date.getUTCMinutes()) + pad(date.getUTCSeconds()) + "Z"
  );
}

// RFC 5545 §3.3.11 — commas, semicolons, backslashes, and newlines all
// need escaping inside a text value.
function escapeICSText(text = "") {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

// Folds on UTF-8 OCTET count, not JS string length. This is the bug caught
// while verifying this file: a naive `line.slice(i, i + 75)` measures
// UTF-16 code units, but the RFC's 75-char limit is in octets — an em dash
// or accented character in a summary/notes field is multi-byte in UTF-8,
// so a 75-character slice can silently exceed 75 bytes and produce a
// technically-invalid file that some stricter calendar parsers reject.
const encoder = new TextEncoder();
function foldLine(line) {
  if (encoder.encode(line).length <= 75) return line;

  const chars = Array.from(line); // respects Unicode code points, not UTF-16 units
  const chunks = [];
  let current = "";
  let currentBytes = 0;
  let isFirst = true;

  for (const ch of chars) {
    const chBytes = encoder.encode(ch).length;
    const limit = isFirst ? 75 : 74; // continuation lines get one leading-space octet "for free"
    if (currentBytes + chBytes > limit) {
      chunks.push((isFirst ? "" : " ") + current);
      current = "";
      currentBytes = 0;
      isFirst = false;
    }
    current += ch;
    currentBytes += chBytes;
  }
  if (current) chunks.push((isFirst ? "" : " ") + current);
  return chunks.join("\r\n");
}

export function buildInterviewICS({ uid, dateStr, durationMinutes = 60, summary, description, location }) {
  const start = new Date(dateStr); // "YYYY-MM-DDTHH:mm" local time — matches LogInterviewModal's stored format
  if (isNaN(start.getTime())) throw new Error(`Invalid interview date: ${dateStr}`);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  const now = new Date();

  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Traject//Interview Export//EN",
    "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toICSDate(now)}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${escapeICSText(summary)}`,
    description ? `DESCRIPTION:${escapeICSText(description)}` : null,
    location ? `LOCATION:${escapeICSText(location)}` : null,
    "END:VEVENT", "END:VCALENDAR",
  ].filter(Boolean);

  return lines.map(foldLine).join("\r\n") + "\r\n";
}

export function downloadICS(filename, icsContent) {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Deferred revoke — revoking immediately after click() can race with the
  // browser actually starting the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Google Calendar's render endpoint wants the same UTC "YYYYMMDDTHHMMSSZ"
// shape as an .ics DTSTART/DTEND — reuses toICSDate rather than a second
// date formatter, so the two paths can't drift out of sync.
export function buildGoogleCalendarUrl({ dateStr, durationMinutes = 60, summary, description, location }) {
  const start = new Date(dateStr);
  if (isNaN(start.getTime())) throw new Error(`Invalid interview date: ${dateStr}`);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  // URLSearchParams handles percent-encoding automatically — building this
  // string by hand would risk an unescaped "&" or "," in the description
  // silently breaking the query string into extra, wrong parameters.
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: summary,
    dates: `${toICSDate(start)}/${toICSDate(end)}`,
  });
  if (description) params.set("details", description);
  if (location) params.set("location", location);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}