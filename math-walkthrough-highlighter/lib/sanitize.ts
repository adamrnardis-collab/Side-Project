/**
 * Sanitization utilities for highlight markup
 * Only allows specific highlight tags to prevent XSS attacks
 */

// Allowed highlight tags
const ALLOWED_TAGS = ['hl-blue', 'hl-red', 'hl-green', 'hl-orange'] as const;
type HighlightTag = (typeof ALLOWED_TAGS)[number];

// Regex to match our highlight tags
const HIGHLIGHT_TAG_REGEX = /<(\/?)hl-(blue|red|green|orange)>/g;

// Regex to match ANY HTML-like tag (for stripping)
const ANY_TAG_REGEX = /<[^>]*>/g;

/**
 * Sanitize an annotated expression to only allow known highlight tags
 * All other HTML-like content is escaped or removed
 */
export function sanitizeAnnotatedExpression(input: string): string {
  if (!input) return '';

  // First, collect all valid highlight tags and their positions
  const validTags: Array<{ match: string; index: number; length: number }> = [];
  let match;

  const tagRegex = /<(\/?)hl-(blue|red|green|orange)>/g;
  while ((match = tagRegex.exec(input)) !== null) {
    validTags.push({
      match: match[0],
      index: match.index,
      length: match[0].length,
    });
  }

  // Build result by processing the string
  let result = '';
  let lastIndex = 0;

  for (const tag of validTags) {
    // Add escaped content between tags
    const betweenContent = input.slice(lastIndex, tag.index);
    result += escapeHtmlExceptHighlights(betweenContent);
    // Add the valid tag as-is
    result += tag.match;
    lastIndex = tag.index + tag.length;
  }

  // Add remaining content
  result += escapeHtmlExceptHighlights(input.slice(lastIndex));

  return result;
}

/**
 * Escape HTML characters but preserve non-tag content
 */
function escapeHtmlExceptHighlights(text: string): string {
  // Remove any remaining HTML-like tags (that weren't our valid highlight tags)
  const withoutTags = text.replace(ANY_TAG_REGEX, '');
  // Escape any remaining angle brackets
  return withoutTags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Extract plain text from annotated expression (remove all highlight tags)
 */
export function stripHighlightTags(annotated: string): string {
  return annotated.replace(HIGHLIGHT_TAG_REGEX, '');
}

/**
 * Parse annotated expression into segments for rendering
 */
export interface AnnotatedSegment {
  text: string;
  highlight: HighlightTag | null;
}

export function parseAnnotatedExpression(annotated: string): AnnotatedSegment[] {
  const segments: AnnotatedSegment[] = [];
  const sanitized = sanitizeAnnotatedExpression(annotated);

  // Stack to track nested highlights (we'll use the innermost)
  const highlightStack: HighlightTag[] = [];
  let currentText = '';
  let i = 0;

  while (i < sanitized.length) {
    // Check for opening tag
    const openMatch = sanitized.slice(i).match(/^<hl-(blue|red|green|orange)>/);
    if (openMatch) {
      // Save current segment if any
      if (currentText) {
        segments.push({
          text: currentText,
          highlight: highlightStack.length > 0 ? highlightStack[highlightStack.length - 1] : null,
        });
        currentText = '';
      }
      highlightStack.push(`hl-${openMatch[1]}` as HighlightTag);
      i += openMatch[0].length;
      continue;
    }

    // Check for closing tag
    const closeMatch = sanitized.slice(i).match(/^<\/hl-(blue|red|green|orange)>/);
    if (closeMatch) {
      // Save current segment if any
      if (currentText) {
        segments.push({
          text: currentText,
          highlight: highlightStack.length > 0 ? highlightStack[highlightStack.length - 1] : null,
        });
        currentText = '';
      }
      // Pop matching tag from stack
      const closingTag = `hl-${closeMatch[1]}` as HighlightTag;
      const stackIndex = highlightStack.lastIndexOf(closingTag);
      if (stackIndex !== -1) {
        highlightStack.splice(stackIndex, 1);
      }
      i += closeMatch[0].length;
      continue;
    }

    // Regular character
    currentText += sanitized[i];
    i++;
  }

  // Add final segment
  if (currentText) {
    segments.push({
      text: currentText,
      highlight: highlightStack.length > 0 ? highlightStack[highlightStack.length - 1] : null,
    });
  }

  return segments;
}

/**
 * Convert annotated expression to HTML with span elements
 */
export function annotatedToHtml(annotated: string): string {
  const segments = parseAnnotatedExpression(annotated);

  return segments
    .map((segment) => {
      const escapedText = segment.text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      if (segment.highlight) {
        return `<span class="${segment.highlight}">${escapedText}</span>`;
      }
      return escapedText;
    })
    .join('');
}

/**
 * Convert highlight tags to markdown bold with color indicators
 */
export function annotatedToMarkdown(annotated: string): string {
  const segments = parseAnnotatedExpression(annotated);

  return segments
    .map((segment) => {
      if (segment.highlight) {
        const colorName = segment.highlight.replace('hl-', '').toUpperCase();
        return `**[${colorName}] ${segment.text}**`;
      }
      return segment.text;
    })
    .join('');
}
