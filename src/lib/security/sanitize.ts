/**
 * Input sanitization utilities.
 * Strips potentially dangerous content from user inputs
 * to prevent XSS, injection, and prompt injection attacks.
 */

/** Patterns that indicate potential script injection */
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /javascript\s*:/gi,
  /data\s*:\s*text\/html/gi,
  /vbscript\s*:/gi,
];

/** SQL injection patterns */
const SQL_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b.*\b(FROM|INTO|TABLE|DATABASE|WHERE)\b)/gi,
  /(--|;|\/\*|\*\/|xp_|sp_)/g,
];

/**
 * Encode HTML entities to prevent XSS.
 */
export function encodeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Check if a string contains dangerous patterns.
 * Returns true if the input is safe, false otherwise.
 */
export function isSafeInput(input: string): boolean {
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(input)) {
      pattern.lastIndex = 0;
      return false;
    }
    pattern.lastIndex = 0;
  }
  return true;
}

/**
 * Check for potential SQL injection patterns.
 */
export function hasSQLInjection(input: string): boolean {
  for (const pattern of SQL_PATTERNS) {
    if (pattern.test(input)) {
      pattern.lastIndex = 0;
      return true;
    }
    pattern.lastIndex = 0;
  }
  return false;
}

/**
 * Sanitize user input by stripping dangerous content.
 * Used as a defense-in-depth layer alongside Zod validation.
 */
export function sanitizeInput(input: string): string {
  let sanitized = input.trim();

  // Strip script tags and event handlers
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, "");
    pattern.lastIndex = 0;
  }

  // Encode remaining HTML entities
  sanitized = encodeHTML(sanitized);

  return sanitized;
}

/**
 * Full validation pipeline: validate + sanitize.
 * Returns sanitized input or throws with a descriptive error.
 */
export function validateAndSanitize(input: string): string {
  if (!isSafeInput(input)) {
    throw new Error("Input contains potentially dangerous content");
  }

  if (hasSQLInjection(input)) {
    throw new Error("Input contains suspicious patterns");
  }

  return sanitizeInput(input);
}
