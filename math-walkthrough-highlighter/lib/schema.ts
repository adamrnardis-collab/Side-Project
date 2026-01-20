import { z } from 'zod';

// Input types
export const WalkthroughStyleSchema = z.enum(['gentle', 'exam', 'teach']);
export type WalkthroughStyle = z.infer<typeof WalkthroughStyleSchema>;

export const ColorSchemeSchema = z.object({
  blue: z.string().default('Given/known values'),
  red: z.string().default('Focus of this step'),
  green: z.string().default('Result/simplified form'),
  orange: z.string().default('Common mistakes/warnings'),
});
export type ColorScheme = z.infer<typeof ColorSchemeSchema>;

export const WalkthroughRequestSchema = z.object({
  inputText: z.string().min(1, 'Input text is required').max(15000, 'Input text too long (max 15,000 characters)'),
  style: WalkthroughStyleSchema.default('gentle'),
});
export type WalkthroughRequest = z.infer<typeof WalkthroughRequestSchema>;

// Output types - matches the LLM response structure
export const StepSchema = z.object({
  title: z.string().describe('Short title for the step'),
  goal: z.string().describe('What we are doing in this step'),
  expression_raw: z.string().describe('The raw mathematical expression without any highlight tags'),
  expression_annotated: z.string().describe('Expression with highlight tags: <hl-blue>, <hl-red>, <hl-green>, <hl-orange>'),
  explanation: z.string().describe('Short explanation of the transformation'),
  checkpoint: z.string().describe('Quick sanity check, units, or sign verification'),
  common_pitfall: z.string().optional().describe('Common mistake or warning for this step'),
});
export type Step = z.infer<typeof StepSchema>;

export const WalkthroughResponseSchema = z.object({
  steps: z.array(StepSchema).min(1, 'At least one step is required'),
  summary: z.string().describe('Overall summary of the mathematical workings'),
  assumptions: z.array(z.string()).describe('List of assumptions made during analysis'),
});
export type WalkthroughResponse = z.infer<typeof WalkthroughResponseSchema>;

// API response wrapper
export const APIResponseSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    data: WalkthroughResponseSchema,
  }),
  z.object({
    success: z.literal(false),
    error: z.string(),
    code: z.enum(['VALIDATION_ERROR', 'RATE_LIMITED', 'API_ERROR', 'PARSE_ERROR', 'UNKNOWN']),
  }),
]);
export type APIResponse = z.infer<typeof APIResponseSchema>;

// Style descriptions for the UI
export const STYLE_DESCRIPTIONS: Record<WalkthroughStyle, { label: string; description: string }> = {
  gentle: {
    label: 'Gentle',
    description: 'More intuition and context',
  },
  exam: {
    label: 'Exam Style',
    description: 'Tight and formal explanations',
  },
  teach: {
    label: 'Teach Me',
    description: 'Extra steps and detail',
  },
};

// Color meanings
export const COLOR_MEANINGS = {
  blue: {
    name: 'Blue',
    class: 'hl-blue',
    meaning: 'Given/known values',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-400',
  },
  red: {
    name: 'Red',
    class: 'hl-red',
    meaning: 'Focus of this step',
    bgClass: 'bg-red-100',
    textClass: 'text-red-700',
    borderClass: 'border-red-400',
  },
  green: {
    name: 'Green',
    class: 'hl-green',
    meaning: 'Result/simplified form',
    bgClass: 'bg-green-100',
    textClass: 'text-green-700',
    borderClass: 'border-green-400',
  },
  orange: {
    name: 'Orange',
    class: 'hl-orange',
    meaning: 'Warning/common mistake',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-700',
    borderClass: 'border-orange-400',
  },
} as const;
