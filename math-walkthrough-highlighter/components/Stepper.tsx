'use client';

import { useState, useCallback } from 'react';
import { Step, WalkthroughResponse, COLOR_MEANINGS } from '@/lib/schema';
import { MathRenderer } from './MathRenderer';
import { annotatedToMarkdown, stripHighlightTags } from '@/lib/sanitize';

interface StepperProps {
  walkthrough: WalkthroughResponse;
}

export function Stepper({ walkthrough }: StepperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { steps, summary, assumptions } = walkthrough;

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStep(index);
    }
  }, [steps.length]);

  const goToPrevious = () => goToStep(currentStep - 1);
  const goToNext = () => goToStep(currentStep + 1);

  const step = steps[currentStep];

  // Generate markdown for a single step
  const stepToMarkdown = (step: Step, index: number): string => {
    let md = `## Step ${index + 1}: ${step.title}\n\n`;
    md += `**Goal:** ${step.goal}\n\n`;
    md += `**Expression:**\n\`\`\`\n${stripHighlightTags(step.expression_annotated)}\n\`\`\`\n\n`;
    md += `**Highlighted:** ${annotatedToMarkdown(step.expression_annotated)}\n\n`;
    md += `**Explanation:** ${step.explanation}\n\n`;
    md += `**Checkpoint:** ${step.checkpoint}\n`;
    if (step.common_pitfall) {
      md += `\n**Warning:** ${step.common_pitfall}\n`;
    }
    return md;
  };

  // Generate full walkthrough markdown
  const walkthroughToMarkdown = (): string => {
    let md = `# Math Walkthrough\n\n`;
    md += `## Summary\n${summary}\n\n`;
    if (assumptions.length > 0) {
      md += `## Assumptions\n${assumptions.map((a) => `- ${a}`).join('\n')}\n\n`;
    }
    md += `## Steps\n\n`;
    steps.forEach((step, index) => {
      md += stepToMarkdown(step, index) + '\n---\n\n';
    });
    return md;
  };

  const copyCurrentStep = async () => {
    const md = stepToMarkdown(step, currentStep);
    await navigator.clipboard.writeText(md);
  };

  const copyAllSteps = async () => {
    const md = walkthroughToMarkdown();
    await navigator.clipboard.writeText(md);
  };

  return (
    <div className="stepper">
      {/* Summary and Assumptions */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-2">Summary</h3>
        <p className="text-gray-700 text-sm">{summary}</p>
        {assumptions.length > 0 && (
          <>
            <h4 className="font-semibold text-gray-800 mt-3 mb-1 text-sm">Assumptions</h4>
            <ul className="text-gray-600 text-sm list-disc list-inside">
              {assumptions.map((assumption, i) => (
                <li key={i}>{assumption}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Color Legend */}
      <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
        <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Color Legend</h4>
        <div className="flex flex-wrap gap-3">
          {Object.values(COLOR_MEANINGS).map((color) => (
            <div key={color.class} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded ${color.bgClass} ${color.borderClass} border`} />
              <span className="text-xs text-gray-600">{color.meaning}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevious}
            disabled={currentStep === 0}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </span>
          <button
            onClick={goToNext}
            disabled={currentStep === steps.length - 1}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyCurrentStep}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            title="Copy this step as Markdown"
          >
            Copy Step
          </button>
          <button
            onClick={copyAllSteps}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            title="Copy all steps as Markdown"
          >
            Copy All
          </button>
        </div>
      </div>

      {/* Step List */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {steps.map((s, index) => (
          <button
            key={index}
            onClick={() => goToStep(index)}
            className={`flex-shrink-0 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              index === currentStep
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={s.title}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Current Step Content */}
      <div className="step-content bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Step Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{step.goal}</p>
        </div>

        {/* Math Expression */}
        <div className="px-6 py-5">
          <MathRenderer
            expressionRaw={step.expression_raw}
            expressionAnnotated={step.expression_annotated}
            displayMode={true}
          />
        </div>

        {/* Explanation */}
        <div className="px-6 py-4 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Explanation</h4>
          <p className="text-gray-700">{step.explanation}</p>
        </div>

        {/* Checkpoint */}
        <div className="px-6 py-4 bg-green-50 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-green-800 mb-1">Checkpoint</h4>
          <p className="text-green-700 text-sm">{step.checkpoint}</p>
        </div>

        {/* Common Pitfall (if present) */}
        {step.common_pitfall && (
          <div className="px-6 py-4 bg-orange-50 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-orange-800 mb-1">Common Pitfall</h4>
            <p className="text-orange-700 text-sm">{step.common_pitfall}</p>
          </div>
        )}
      </div>

      {/* Keyboard Navigation Hint */}
      <p className="text-xs text-gray-400 mt-4 text-center">
        Tip: Use arrow keys to navigate between steps
      </p>
    </div>
  );
}

/**
 * Loading skeleton for the stepper
 */
export function StepperSkeleton() {
  return (
    <div className="stepper animate-pulse">
      <div className="mb-6 p-4 bg-gray-100 rounded-lg h-24" />
      <div className="mb-4 p-3 bg-gray-100 rounded-lg h-12" />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-20 h-8 bg-gray-200 rounded-lg" />
          <div className="w-24 h-4 bg-gray-200 rounded" />
          <div className="w-16 h-8 bg-gray-200 rounded-lg" />
        </div>
      </div>
      <div className="flex gap-1 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-10 h-8 bg-gray-200 rounded-lg" />
        ))}
      </div>
      <div className="bg-gray-100 rounded-xl h-96" />
    </div>
  );
}
