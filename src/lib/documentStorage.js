// src/lib/documentStorage.js

// Resume/cover-letter attachments are per-browser only, not part of the
// json-server backend — the same architectural choice already documented
// for Profile's avatar (see the README's "Profile" section). json-server
// stores plain JSON, and a real PDF/DOCX binary doesn't belong inlined
// into db.json as base64 — that would bloat the mock API's file and still
// wouldn't be "real" server storage, just a heavier version of the same
// local-only trade-off. This keeps the trade-off explicit instead of
// hiding it behind something that looks server-backed but isn't.

const STORAGE_PREFIX = "traject:documents:";
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB per file — generous for a resume/cover letter, small enough not to threaten localStorage's ~5-10MB total budget
const ACCEPTED_TYPES = {
  "application/pdf": "PDF",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
};

function keyFor(applicationId) {
  return `${STORAGE_PREFIX}${applicationId}`;
}

// Each application holds up to two named slots — "resume" and
// "coverLetter" — not an open-ended list, matching the two inputs on the
// Documents card. Corrupt/unparseable JSON in a slot is treated as empty
// rather than thrown, so a bad localStorage value can't crash the whole
// detail page.
export function getDocuments(applicationId) {
  try {
    const raw = localStorage.getItem(keyFor(applicationId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setDocument(applicationId, slot, doc) {
  const current = getDocuments(applicationId);
  const next = { ...current, [slot]: doc };
  localStorage.setItem(keyFor(applicationId), JSON.stringify(next));
  return next;
}

export function removeDocument(applicationId, slot) {
  const current = getDocuments(applicationId);
  const next = { ...current };
  delete next[slot];
  localStorage.setItem(keyFor(applicationId), JSON.stringify(next));
  return next;
}

export function validateFile(file) {
  if (!ACCEPTED_TYPES[file.type]) {
    return "Unsupported file type. Upload a PDF or Word document.";
  }
  if (file.size > MAX_FILE_BYTES) {
    return `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB) — max ${MAX_FILE_BYTES / 1024 / 1024}MB.`;
  }
  return null;
}

export function fileTypeLabel(mimeType) {
  return ACCEPTED_TYPES[mimeType] ?? "File";
}

// Reads a File into a base64 data URL for in-memory preview/download —
// this only ever touches localStorage via setDocument above; the data URL
// itself lives in React state while the modal/card is open.
export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Couldn't read the file"));
    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}