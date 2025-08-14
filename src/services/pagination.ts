/**
 * @fileoverview Client-side helpers for creating and parsing opaque pagination cursors.
 * These are safe to use in URLs.
 */

import type { DocumentSnapshot } from 'firebase/firestore';

/**
 * Creates an opaque, URL-safe cursor from a Firestore document snapshot's data.
 * The cursor is a base64 encoded JSON string of the document's relevant sort fields.
 *
 * IMPORTANT: This assumes the document snapshot contains the fields used for sorting.
 * For example, if sorting by `createdAt`, the `lastDoc` must have a `createdAt` field.
 *
 * @param lastDoc The last document snapshot from the previous Firestore query.
 * @returns A base64 encoded string to be used as a cursor.
 */
export function makeCursor<T>(lastDoc: DocumentSnapshot<T>): string {
  // We stringify the entire document data. A more optimized version might only
  // stringify the fields used for sorting (e.g., { createdAt: lastDoc.data().createdAt }).
  const cursorData = JSON.stringify(lastDoc.data());

  // Use btoa for browser environments
  if (typeof window !== 'undefined') {
    return window.btoa(cursorData);
  }
  
  // Fallback for non-browser environments (like SSR with Node.js)
  return Buffer.from(cursorData, 'utf-8').toString('base64');
}

/**
 * Parses an opaque cursor string back into a usable object.
 *
 * @param cursor The opaque base64 string from the URL.
 * @returns The parsed object, or null if the cursor is invalid.
 */
export function parseCursor(cursor?: string): any | null {
  if (!cursor) {
    return null;
  }

  try {
    // Use atob for browser environments
    const decodedJson = typeof window !== 'undefined'
      ? window.atob(cursor)
      : Buffer.from(cursor, 'base64').toString('utf-8');
      
    return JSON.parse(decodedJson);
  } catch (error) {
    console.error("Failed to parse cursor:", error);
    return null;
  }
}
