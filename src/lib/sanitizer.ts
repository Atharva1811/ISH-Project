import DOMPurify from 'dompurify';

/**
 * Sanitizes user-entered text strings to prevent stored XSS attacks.
 * Strips all HTML tags and unsafe script attributes.
 */
export function sanitizeText(input?: string | null): string {
  if (!input) return '';
  return DOMPurify.sanitize(input.trim(), {
    ALLOWED_TAGS: [], // Disallow all HTML tags for pure plain text fields
    ALLOWED_ATTR: []
  });
}

/**
 * Validates whether a given string is a valid UUID v4 format.
 * Used for sanitizing and validating URL route parameters (e.g. /#/plant/:id)
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
