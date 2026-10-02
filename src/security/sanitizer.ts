/**
 * ANTWRE — Security & Input Sanitization Engine
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Implements strict defensive sanitization, path traversal prevention,
 * XSS escaping, payload bounds validation, and safe error message formatting.
 */

export class SecuritySanitizer {
  private static readonly MAX_STRING_LENGTH = 5000;
  private static readonly MAX_TITLE_LENGTH = 150;
  private static readonly SAFE_FILENAME_REGEX = /^[a-zA-Z0-9_\-\.]{1,100}$/;
  private static readonly SAFE_ID_REGEX = /^[a-zA-Z0-9_\-]{1,64}$/;

  /**
   * Encodes HTML special characters to prevent Cross-Site Scripting (XSS).
   */
  public static escapeHtml(input: string): string {
    if (typeof input !== 'string') return '';
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Sanitizes a plain-text user input string with truncation and non-printable char removal.
   */
  public static sanitizeText(input: unknown, maxLength: number = SecuritySanitizer.MAX_STRING_LENGTH): string {
    if (input === null || input === undefined) return '';
    const str = String(input);
    // Remove control characters (except newline, tab, carriage return)
    const cleaned = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    return cleaned.trim().slice(0, maxLength);
  }

  /**
   * Validates and sanitizes titles / names.
   */
  public static sanitizeTitle(input: unknown): string {
    return this.sanitizeText(input, this.MAX_TITLE_LENGTH);
  }

  /**
   * Prevents path traversal (e.g. `../../etc/passwd` or `..\Windows\System32`).
   * Returns a sanitized, safe base filename without directory separators.
   */
  public static validateSafeFilename(filename: string, allowedExtensions: string[] = ['.antbrain', '.json', '.zip']): { safe: boolean; sanitizedName: string; reason?: string } {
    if (!filename || typeof filename !== 'string') {
      return { safe: false, sanitizedName: '', reason: 'Filename must be a non-empty string' };
    }

    if (filename.includes('..') || filename.includes('/') || filename.includes('\\') || filename.includes('\0')) {
      return { safe: false, sanitizedName: '', reason: 'Path traversal attempt detected' };
    }

    const base = filename.trim();

    if (!this.SAFE_FILENAME_REGEX.test(base)) {
      return { safe: false, sanitizedName: '', reason: 'Filename contains illegal characters' };
    }

    const hasValidExt = allowedExtensions.some(ext => base.toLowerCase().endsWith(ext.toLowerCase()));
    if (!hasValidExt) {
      return { safe: false, sanitizedName: base, reason: `File extension must be one of: ${allowedExtensions.join(', ')}` };
    }

    return { safe: true, sanitizedName: base };
  }

  /**
   * Validates safe entity and session identifiers.
   */
  public static isValidId(id: unknown): boolean {
    if (typeof id !== 'string') return false;
    return this.SAFE_ID_REGEX.test(id);
  }

  /**
   * Validates JSON payload sizes to prevent Denial-of-Service / memory exhaustion.
   */
  public static validateJsonPayloadSize(jsonString: string, maxBytes: number = 2 * 1024 * 1024): boolean {
    if (typeof jsonString !== 'string') return false;
    // Approximate byte length (UTF-8)
    const byteLength = new Blob([jsonString]).size;
    return byteLength <= maxBytes;
  }

  /**
   * Generates sanitized, non-leaking user-facing error messages.
   * Strips stack traces, internal file paths, and environment variable names.
   */
  public static formatSafeErrorMessage(err: unknown, fallback: string = 'An unexpected error occurred.'): string {
    if (!err) return fallback;
    if (err instanceof Error) {
      const msg = err.message || fallback;
      // Strip absolute paths (Unix and Windows)
      const sanitized = msg
        .replace(/[C-Z]:\\[^\s:]+/gi, '[internal_path]')
        .replace(/\/[\w\-\.\/]+/g, '[internal_path]')
        .replace(/api[_-]?key[^\s]*/gi, '[redacted]');
      return this.sanitizeText(sanitized, 300);
    }
    return this.sanitizeText(String(err), 300);
  }
}
