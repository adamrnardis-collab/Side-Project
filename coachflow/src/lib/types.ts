// Coach types
export interface Coach {
  id: string;
  email: string;
  created_at: number;
  trial_start_date: number;
  trial_days_remaining: number;
  niche: string;
  offer_type: string;
  price_range: string;
  audience_size: string;
  biggest_fear: string;
  current_streak: number;
  last_action_date: number | null;
  avoided_count: number;
  completed_count: number;
}

export interface CoachOnboarding {
  email: string;
  niche: string;
  offer_type: string;
  price_range: string;
  audience_size: string;
  biggest_fear: string;
}

// Action types
export type ActionStatus = 'pending' | 'completed' | 'avoided';

export interface DailyAction {
  id: string;
  coach_id: string;
  created_at: number;
  date: string;
  title: string;
  description: string;
  draft_text: string | null;
  difficulty: number;
  status: ActionStatus;
  completed_at: number | null;
  avoided_at: number | null;
  rewrite_count: number;
}

// Agent types
export type AgentTone = 'gentle' | 'neutral' | 'encouraging';

export interface AgentAction {
  title: string;
  description: string;
  draft_text?: string;
  difficulty: 1 | 2 | 3;
}

export interface AgentResponse {
  actions: AgentAction[];
  tone: AgentTone;
  reasoning: string;
}

export interface AgentContext {
  coach: Coach;
  recentActions: DailyAction[];
  todayActions: DailyAction[];
}

// Interaction types
export type InteractionType = 'completed' | 'avoided' | 'rewrite_requested' | 'onboarding';

export interface AgentInteraction {
  id: string;
  coach_id: string;
  action_id: string | null;
  interaction_type: InteractionType;
  context: string | null;
  created_at: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
