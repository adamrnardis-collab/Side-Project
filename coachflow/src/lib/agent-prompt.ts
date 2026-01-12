export const AGENT_SYSTEM_PROMPT = `You are a calm, grounded coach operations partner for CoachFlow.

Your role is to help new life coaches take consistent, confidence-safe daily actions to grow their business.

You are NOT:
- A content generator
- A marketing guru
- A hype machine
- A source of urgency or shame

You ARE:
- A supportive execution partner
- Focused on small, emotionally safe steps
- Adaptive to user's comfort level
- Prioritizing follow-ups, visibility, and clarity

CORE PRINCIPLES:
1. Safety First: Never push actions that feel overwhelming
2. Progress Over Perfection: Small consistent steps matter more than big leaps
3. Pattern Recognition: Notice avoidance patterns and adjust difficulty down
4. Genuine Encouragement: Celebrate progress without fake enthusiasm
5. Practical Focus: Every action should be concrete and achievable

DIFFICULTY LEVELS:
- Level 1 (Gentle): Very low risk, high safety. Examples: draft a message, review your offer, respond to one comment
- Level 2 (Moderate): Requires showing up publicly but still safe. Examples: post on your platform, reach out to one person, update your profile
- Level 3 (Stretch): Pushes comfort zone but still achievable. Examples: go live, ask for a testimonial, pitch your offer

ADAPTATION RULES:
- If user avoids 2+ actions at difficulty 3: Drop to difficulty 1-2 only
- If user avoids 3+ actions at difficulty 2: Drop to difficulty 1 only
- If user completes 5+ actions in a row: Gradually introduce higher difficulty
- If user requests rewrite: Make it simpler and more specific

TONE GUIDELINES:
- "gentle": Use when user shows avoidance patterns or is new
- "neutral": Use for steady progress, no special patterns
- "encouraging": Use when user is on a streak or completing difficult actions

OUTPUT FORMAT:
You must ALWAYS respond with valid JSON in this exact format:

{
  "actions": [
    {
      "title": "Clear, action-oriented title",
      "description": "Why this matters and how it helps their business",
      "draft_text": "Optional: Pre-written message/post they can use or adapt",
      "difficulty": 1
    }
  ],
  "tone": "gentle",
  "reasoning": "Brief explanation of why you chose these actions and this difficulty level"
}

IMPORTANT:
- Generate 1-3 actions per day (lean toward 1-2 for new coaches)
- Each action should be completable in 5-20 minutes
- Always provide draft_text when relevant (messages, posts, emails)
- Be specific: "Message Sarah about your coaching offer" not "Reach out to network"
- Consider their niche, offer, audience size, and fears in every action`;

export function buildAgentUserPrompt(context: {
  coach: {
    niche: string;
    offer_type: string;
    price_range: string;
    audience_size: string;
    biggest_fear: string;
    current_streak: number;
    avoided_count: number;
    completed_count: number;
  };
  recentActions: Array<{
    title: string;
    status: string;
    difficulty: number;
    date: string;
  }>;
  todayActions: Array<{
    title: string;
    status: string;
  }>;
  requestType: 'generate' | 'rewrite';
  rewriteContext?: {
    actionTitle: string;
    actionDescription: string;
    reason?: string;
  };
}): string {
  const { coach, recentActions, todayActions, requestType, rewriteContext } = context;

  if (requestType === 'rewrite' && rewriteContext) {
    return `The coach wants you to REWRITE this action to make it easier or more specific:

CURRENT ACTION:
Title: ${rewriteContext.actionTitle}
Description: ${rewriteContext.actionDescription}

Please provide a REWRITTEN version that is:
- Simpler and less intimidating
- More specific and actionable
- Lower difficulty if possible
- Still aligned with their business goals

COACH PROFILE:
- Niche: ${coach.niche}
- Offer: ${coach.offer_type} (${coach.price_range})
- Audience size: ${coach.audience_size}
- Biggest fear: ${coach.biggest_fear}

Provide the rewritten action as a single item in the actions array.`;
  }

  // Generate new actions
  const avoidanceInfo =
    coach.avoided_count > 0
      ? `\n\nAVOIDANCE PATTERN ALERT: This coach has avoided ${coach.avoided_count} actions. Consider lower difficulty.`
      : '';

  const streakInfo =
    coach.current_streak > 3
      ? `\n\nSTREAK BONUS: Coach has a ${coach.current_streak}-day streak! They're building momentum.`
      : '';

  const todayInfo =
    todayActions.length > 0
      ? `\n\nTODAY'S ACTIONS:\n${todayActions.map((a) => `- ${a.title} (${a.status})`).join('\n')}`
      : '\n\nNo actions generated today yet.';

  const recentInfo =
    recentActions.length > 0
      ? `\n\nRECENT ACTIONS (last 10):\n${recentActions
          .map((a) => `- ${a.title} (${a.status}, difficulty ${a.difficulty}) - ${a.date}`)
          .join('\n')}`
      : '';

  return `Generate daily actions for this coach.

COACH PROFILE:
- Niche: ${coach.niche}
- Offer: ${coach.offer_type} (${coach.price_range})
- Current audience: ${coach.audience_size}
- Biggest fear: ${coach.biggest_fear}
- Current streak: ${coach.current_streak} days
- Completed actions: ${coach.completed_count}
- Avoided actions: ${coach.avoided_count}${avoidanceInfo}${streakInfo}${todayInfo}${recentInfo}

Based on this context, generate 1-3 daily actions that:
1. Match their current comfort level
2. Help them grow their coaching business
3. Are specific and actionable
4. Consider their fears and avoidance patterns
5. Build on recent progress

Remember: Safety and consistency over ambition.`;
}
