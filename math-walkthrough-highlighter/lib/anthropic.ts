import Anthropic from '@anthropic-ai/sdk';
import { WalkthroughResponse, WalkthroughResponseSchema, WalkthroughStyle } from './schema';

// Lazy initialization to avoid loading API key at module load time
let anthropicClient: Anthropic | null = null;

function getClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

const STYLE_INSTRUCTIONS: Record<WalkthroughStyle, string> = {
  gentle: `Use a gentle, intuitive teaching style. Provide extra context about WHY each step works.
Use analogies where helpful. Make the learner feel comfortable.`,
  exam: `Use a formal, exam-style approach. Be concise and precise.
Focus on the mathematical rigor. Show the work as it would appear in an exam answer.`,
  teach: `Use a detailed teaching approach. Break down each transformation into smaller sub-steps.
Explain prerequisites if needed. This is for someone who wants to deeply understand every detail.`,
};

const SYSTEM_PROMPT = `You are a mathematics tutor specializing in step-by-step explanations.
Your task is to analyze mathematical workings and create a detailed walkthrough.

CRITICAL RULES:
1. NEVER hallucinate numbers - only use values from the input
2. If something is ambiguous, add it to the assumptions list
3. Each step must focus on ONE transformation at a time
4. Keep explanations short and specific
5. ALWAYS use the highlight tags consistently in expression_annotated:
   - <hl-blue>...</hl-blue> for given/known values
   - <hl-red>...</hl-red> for the piece being focused on in this step
   - <hl-green>...</hl-green> for results/simplified forms
   - <hl-orange>...</hl-orange> for warnings about common mistakes

HIGHLIGHT TAG RULES:
- Tags must be properly nested and closed
- The expression_raw should be the same mathematical content WITHOUT any highlight tags
- The expression_annotated should contain the SAME math but WITH highlight tags around specific parts
- Use LaTeX syntax for the math (e.g., \\frac{a}{b}, x^2, \\sqrt{x})
- Ensure highlight tags wrap complete mathematical units (not partial tokens)

RESPONSE FORMAT:
You MUST respond with valid JSON matching this exact structure:
{
  "steps": [
    {
      "title": "Step title",
      "goal": "What we're doing",
      "expression_raw": "x^2 + 2x + 1 = 0",
      "expression_annotated": "<hl-red>x^2 + 2x + 1</hl-red> = <hl-blue>0</hl-blue>",
      "explanation": "Short explanation",
      "checkpoint": "Quick sanity check",
      "common_pitfall": "Optional warning"
    }
  ],
  "summary": "Overall summary",
  "assumptions": ["List of assumptions"]
}

Do not include any text before or after the JSON. Only output the JSON object.`;

export async function generateWalkthrough(
  inputText: string,
  style: WalkthroughStyle
): Promise<WalkthroughResponse> {
  const client = getClient();

  const userPrompt = `${STYLE_INSTRUCTIONS[style]}

Analyze these mathematical workings and create a step-by-step walkthrough with highlights:

---
${inputText}
---

Remember:
- Use <hl-blue> for given values, <hl-red> for focus, <hl-green> for results, <hl-orange> for warnings
- Each step should have ONE main transformation
- expression_raw has no tags, expression_annotated has the highlight tags
- Output ONLY valid JSON, no other text`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    system: SYSTEM_PROMPT,
  });

  // Extract text content
  const textContent = message.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from API');
  }

  let responseText = textContent.text.trim();

  // Try to extract JSON if wrapped in markdown code blocks
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    responseText = jsonMatch[1].trim();
  }

  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(responseText);
  } catch (parseError) {
    // Attempt to fix common JSON issues and retry
    const fixedResponse = await attemptJsonFix(client, responseText);
    parsed = JSON.parse(fixedResponse);
  }

  // Validate with Zod
  const validated = WalkthroughResponseSchema.parse(parsed);
  return validated;
}

async function attemptJsonFix(client: Anthropic, malformedJson: string): Promise<string> {
  const fixMessage = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `The following JSON is malformed. Please fix it and return ONLY the corrected JSON, nothing else:

${malformedJson}`,
      },
    ],
    system: 'You are a JSON repair assistant. Output only valid JSON, no explanations.',
  });

  const fixContent = fixMessage.content.find((block) => block.type === 'text');
  if (!fixContent || fixContent.type !== 'text') {
    throw new Error('Failed to fix JSON response');
  }

  let fixedText = fixContent.text.trim();
  const jsonMatch = fixedText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    fixedText = jsonMatch[1].trim();
  }

  return fixedText;
}
