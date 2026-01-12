import Anthropic from '@anthropic-ai/sdk';
import { AGENT_SYSTEM_PROMPT, buildAgentUserPrompt } from './agent-prompt';
import type { AgentResponse, Coach, DailyAction } from './types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateDailyActions(
  coach: Coach,
  recentActions: DailyAction[],
  todayActions: DailyAction[]
): Promise<AgentResponse> {
  const userPrompt = buildAgentUserPrompt({
    coach: {
      niche: coach.niche,
      offer_type: coach.offer_type,
      price_range: coach.price_range,
      audience_size: coach.audience_size,
      biggest_fear: coach.biggest_fear,
      current_streak: coach.current_streak,
      avoided_count: coach.avoided_count,
      completed_count: coach.completed_count,
    },
    recentActions: recentActions.map((a) => ({
      title: a.title,
      status: a.status,
      difficulty: a.difficulty,
      date: a.date,
    })),
    todayActions: todayActions.map((a) => ({
      title: a.title,
      status: a.status,
    })),
    requestType: 'generate',
  });

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: AGENT_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : '';

  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse agent response');
  }

  const agentResponse: AgentResponse = JSON.parse(jsonMatch[0]);

  // Validate response
  if (
    !agentResponse.actions ||
    !Array.isArray(agentResponse.actions) ||
    agentResponse.actions.length === 0
  ) {
    throw new Error('Invalid agent response format');
  }

  return agentResponse;
}

export async function rewriteAction(
  coach: Coach,
  action: DailyAction
): Promise<AgentResponse> {
  const userPrompt = buildAgentUserPrompt({
    coach: {
      niche: coach.niche,
      offer_type: coach.offer_type,
      price_range: coach.price_range,
      audience_size: coach.audience_size,
      biggest_fear: coach.biggest_fear,
      current_streak: coach.current_streak,
      avoided_count: coach.avoided_count,
      completed_count: coach.completed_count,
    },
    recentActions: [],
    todayActions: [],
    requestType: 'rewrite',
    rewriteContext: {
      actionTitle: action.title,
      actionDescription: action.description,
    },
  });

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: AGENT_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : '';

  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse agent response');
  }

  const agentResponse: AgentResponse = JSON.parse(jsonMatch[0]);

  return agentResponse;
}
