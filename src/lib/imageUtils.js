// src/lib/imageUtils.js

/**
 * Compress an image file to a safe size for localStorage.
 * 
 * Strategy: Resize to max 600px, JPG quality 0.8
 * Results: ~50-80kb from typical ~500kb full-res
 * 
 * Returns: Promise<base64String>
 */
export async function compressImageToBase64(file, maxWidth = 600, quality = 0.8) {
  if (!file || !file.type.startsWith('image/')) {
    return Promise.reject(new Error('File must be an image'));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate new dimensions preserving aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round(width * (maxWidth / height));
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
        } catch (err) {
          reject(new Error('Failed to compress image: ' + err.message));
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target.result;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Get the approximate size of a localStorage item in bytes.
 * Accounts for base64 encoding overhead (4/3x) and JSON wrapping.
 * 
 * Formula: base64_size * 4/3 + 100 bytes (JSON overhead)
 */
export function getLocalStorageSize(key) {
  if (typeof localStorage === 'undefined') return 0;
  
  const item = localStorage.getItem(key);
  if (!item) return 0;
  
  // base64 encoded strings are ~4/3 the size of binary data
  const binarySize = Math.ceil((item.length * 4) / 3);
  // Add ~100 bytes for JSON key/value wrapping
  return binarySize + 100;
}

/**
 * Check if a base64 image string can safely fit in localStorage.
 * 
 * Safe limit: 2.5MB (reserving half of typical 5-10MB quota for app data)
 * Returns: boolean
 */
export function canStoreImage(base64String) {
  // Remove data: URI prefix before measuring
  const dataOnly = base64String.replace(/^data:[^;]+;base64,/, '');
  const sizeInBytes = Math.ceil((dataOnly.length * 4) / 3);
  
  const SAFE_LIMIT = 2.5 * 1024 * 1024; // 2.5MB
  return sizeInBytes < SAFE_LIMIT;
}

/**
 * Generate a deterministic color for a given string.
 * Same input always produces same color (great for avatars).
 * 
 * Colors are accessible on both light and dark backgrounds (WCAG AA compliant).
 * Uses Mantine color system variables.
 */
export function getColorForString(str = '') {
  // 9 colors covering full spectrum with good contrast
  const colors = [
    'var(--mantine-color-teal-6)',
    'var(--mantine-color-blue-6)',
    'var(--mantine-color-violet-6)',
    'var(--mantine-color-orange-6)',
    'var(--mantine-color-red-6)',
    'var(--mantine-color-pink-6)',
    'var(--mantine-color-cyan-6)',
    'var(--mantine-color-indigo-6)',
    'var(--mantine-color-lime-6)',
  ];

  // Simple hash function: deterministic but good distribution
  let hash = 0;
  const trimmedStr = str.toLowerCase().trim();
  
  for (let i = 0; i < trimmedStr.length; i++) {
    // eslint-disable-next-line no-bitwise
    hash = ((hash << 5) - hash) + trimmedStr.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use absolute value to ensure positive index
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Extract initials from a name.
 * Used for avatar fallback text.
 * 
 * Examples:
 * "Jane Doe" → "JD"
 * "Sarah" → "S"
 * "A B C" → "AB"
 */
export function getInitials(name = '') {
  if (!name || name.trim().length === 0) return '?';
  
  return name
    .trim()
    .split(/\s+/)           // Split on any whitespace
    .map((part) => part[0]) // Take first letter of each part
    .join('')
    .toUpperCase()
    .slice(0, 2);           // Maximum 2 characters
}

/**
 * A 1x1 transparent PNG as data URI.
 * 
 * Use as: <img src={TRANSPARENT_PIXEL} onLoad={...} />
 * Prevents layout shift while real image loads, serves as fallback.
 */
export const TRANSPARENT_PIXEL = 
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221%22 height=%221%22%3E%3C/svg%3E';

/**
 * Format bytes as human-readable size.
 * Used for file upload validation messages.
 * 
 * Examples: 1024 → "1 KB", 1048576 → "1 MB"
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if browser supports localStorage.
 * Some browsers/modes disable it (private browsing, privacy-focused, etc).
 */
export function isLocalStorageAvailable() {
  try {
    const test = '__traject_storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Safely store a value in localStorage with error handling.
 * Returns: { success: boolean, error?: string }
 */
export function safeLocalStorageSet(key, value) {
  if (!isLocalStorageAvailable()) {
    return { success: false, error: 'localStorage not available' };
  }

  try {
    localStorage.setItem(key, value);
    return { success: true };
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      return { success: false, error: 'Storage quota exceeded. Try a smaller image.' };
    }
    return { success: false, error: e.message };
  }
}

/**
 * Safely retrieve a value from localStorage.
 * Returns: value or null if not found
 */
export function safeLocalStorageGet(key) {
  if (!isLocalStorageAvailable()) return null;
  
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.error('localStorage read error:', e);
    return null;
  }
}

/**
 * Clear localStorage safely.
 * Useful for logout or reset.
 */
export function safeClearLocalStorage() {
  if (!isLocalStorageAvailable()) return;
  
  try {
    localStorage.clear();
  } catch (e) {
    console.error('localStorage clear error:', e);
  }
}