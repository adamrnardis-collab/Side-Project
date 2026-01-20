'use client';

import { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import { parseAnnotatedExpression, stripHighlightTags, AnnotatedSegment } from '@/lib/sanitize';

interface MathRendererProps {
  /** Raw expression without highlight tags (for KaTeX) */
  expressionRaw: string;
  /** Annotated expression with highlight tags (for fallback) */
  expressionAnnotated: string;
  /** Whether to show in display mode (larger, centered) */
  displayMode?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Renders mathematical expressions with syntax highlighting
 * Primary: KaTeX rendering
 * Fallback: Monospace HTML with color spans
 */
export function MathRenderer({
  expressionRaw,
  expressionAnnotated,
  displayMode = true,
  className = '',
}: MathRendererProps) {
  const katexRef = useRef<HTMLDivElement>(null);
  const [katexError, setKatexError] = useState<string | null>(null);
  const [showAnnotated, setShowAnnotated] = useState(false);

  // Try to render with KaTeX
  useEffect(() => {
    if (!katexRef.current) return;

    try {
      katex.render(expressionRaw, katexRef.current, {
        throwOnError: true,
        displayMode,
        trust: false,
        strict: 'warn',
        macros: {},
      });
      setKatexError(null);
    } catch (error) {
      setKatexError(error instanceof Error ? error.message : 'KaTeX render failed');
    }
  }, [expressionRaw, displayMode]);

  // Parse annotated expression for fallback view
  const segments = parseAnnotatedExpression(expressionAnnotated);

  const getHighlightClasses = (highlight: AnnotatedSegment['highlight']) => {
    switch (highlight) {
      case 'hl-blue':
        return 'bg-blue-100 text-blue-800 border-b-2 border-blue-400';
      case 'hl-red':
        return 'bg-red-100 text-red-800 border-b-2 border-red-400 font-semibold';
      case 'hl-green':
        return 'bg-green-100 text-green-800 border-b-2 border-green-400';
      case 'hl-orange':
        return 'bg-orange-100 text-orange-800 border-b-2 border-orange-400';
      default:
        return '';
    }
  };

  return (
    <div className={`math-renderer ${className}`}>
      {/* Toggle between views */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setShowAnnotated(false)}
          className={`px-2 py-1 text-xs rounded ${
            !showAnnotated
              ? 'bg-gray-800 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Rendered
        </button>
        <button
          onClick={() => setShowAnnotated(true)}
          className={`px-2 py-1 text-xs rounded ${
            showAnnotated
              ? 'bg-gray-800 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Highlighted
        </button>
        {katexError && (
          <span className="text-xs text-amber-600" title={katexError}>
            (KaTeX warning)
          </span>
        )}
      </div>

      {/* KaTeX rendered view */}
      {!showAnnotated && !katexError && (
        <div
          ref={katexRef}
          className={`katex-container p-4 bg-white rounded-lg border border-gray-200 ${
            displayMode ? 'text-center overflow-x-auto' : 'inline-block'
          }`}
        />
      )}

      {/* Fallback or annotated view */}
      {(showAnnotated || katexError) && (
        <div
          className={`annotated-container p-4 bg-gray-50 rounded-lg border border-gray-200 font-mono text-base leading-relaxed ${
            displayMode ? 'text-center overflow-x-auto' : 'inline-block'
          }`}
        >
          {segments.map((segment, index) => (
            <span
              key={index}
              className={`px-0.5 rounded ${getHighlightClasses(segment.highlight)}`}
            >
              {segment.text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Simple inline math renderer (no highlights)
 */
export function InlineMath({ expression, className = '' }: { expression: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    try {
      katex.render(expression, ref.current, {
        throwOnError: true,
        displayMode: false,
        trust: false,
      });
      setError(false);
    } catch {
      setError(true);
    }
  }, [expression]);

  if (error) {
    return <code className={`font-mono text-sm ${className}`}>{expression}</code>;
  }

  return <span ref={ref} className={className} />;
}
