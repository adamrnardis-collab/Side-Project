import Database from 'better-sqlite3';
import path from 'path';
import { randomUUID } from 'crypto';
import type {
  Coach,
  CoachOnboarding,
  DailyAction,
  ActionStatus,
  AgentInteraction,
  InteractionType,
} from './types';

const dbPath = path.join(process.cwd(), 'coachflow.db');
let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('foreign_keys = ON');
  }
  return db;
}

// ============================================
// COACH OPERATIONS
// ============================================

export function createCoach(data: CoachOnboarding): Coach {
  const db = getDb();
  const now = Date.now();
  const id = randomUUID();

  const stmt = db.prepare(`
    INSERT INTO coaches (
      id, email, created_at, trial_start_date, trial_days_remaining,
      niche, offer_type, price_range, audience_size, biggest_fear
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    data.email,
    now,
    now,
    7,
    data.niche,
    data.offer_type,
    data.price_range,
    data.audience_size,
    data.biggest_fear
  );

  return getCoachById(id)!;
}

export function getCoachById(id: string): Coach | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM coaches WHERE id = ?');
  return stmt.get(id) as Coach | null;
}

export function getCoachByEmail(email: string): Coach | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM coaches WHERE email = ?');
  return stmt.get(email) as Coach | null;
}

export function updateCoachStreak(coachId: string, increment: boolean): void {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const coach = getCoachById(coachId);

  if (!coach) return;

  let newStreak = coach.current_streak;

  if (increment) {
    // Check if last action was yesterday
    const lastDate = coach.last_action_date
      ? new Date(coach.last_action_date).toISOString().split('T')[0]
      : null;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastDate === yesterdayStr || lastDate === today) {
      newStreak = coach.current_streak + 1;
    } else {
      newStreak = 1;
    }
  }

  const stmt = db.prepare(`
    UPDATE coaches
    SET current_streak = ?, last_action_date = ?
    WHERE id = ?
  `);

  stmt.run(newStreak, Date.now(), coachId);
}

export function updateCoachStats(
  coachId: string,
  type: 'completed' | 'avoided'
): void {
  const db = getDb();
  const field = type === 'completed' ? 'completed_count' : 'avoided_count';

  const stmt = db.prepare(`
    UPDATE coaches
    SET ${field} = ${field} + 1
    WHERE id = ?
  `);

  stmt.run(coachId);
}

export function updateTrialDays(coachId: string): void {
  const db = getDb();
  const coach = getCoachById(coachId);

  if (!coach) return;

  const daysSinceStart = Math.floor(
    (Date.now() - coach.trial_start_date) / (1000 * 60 * 60 * 24)
  );

  const daysRemaining = Math.max(0, 7 - daysSinceStart);

  const stmt = db.prepare(`
    UPDATE coaches
    SET trial_days_remaining = ?
    WHERE id = ?
  `);

  stmt.run(daysRemaining, coachId);
}

// ============================================
// ACTION OPERATIONS
// ============================================

export function createActions(
  coachId: string,
  actions: Array<{
    title: string;
    description: string;
    draft_text?: string;
    difficulty: number;
  }>
): DailyAction[] {
  const db = getDb();
  const now = Date.now();
  const today = new Date().toISOString().split('T')[0];

  const stmt = db.prepare(`
    INSERT INTO daily_actions (
      id, coach_id, created_at, date, title, description,
      draft_text, difficulty, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `);

  const createdActions: DailyAction[] = [];

  for (const action of actions) {
    const id = randomUUID();
    stmt.run(
      id,
      coachId,
      now,
      today,
      action.title,
      action.description,
      action.draft_text || null,
      action.difficulty
    );
    createdActions.push(getActionById(id)!);
  }

  return createdActions;
}

export function getActionById(id: string): DailyAction | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM daily_actions WHERE id = ?');
  return stmt.get(id) as DailyAction | null;
}

export function getTodayActions(coachId: string): DailyAction[] {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  const stmt = db.prepare(`
    SELECT * FROM daily_actions
    WHERE coach_id = ? AND date = ?
    ORDER BY created_at ASC
  `);

  return stmt.all(coachId, today) as DailyAction[];
}

export function getRecentActions(coachId: string, limit: number = 10): DailyAction[] {
  const db = getDb();

  const stmt = db.prepare(`
    SELECT * FROM daily_actions
    WHERE coach_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `);

  return stmt.all(coachId, limit) as DailyAction[];
}

export function updateActionStatus(
  actionId: string,
  status: ActionStatus
): DailyAction | null {
  const db = getDb();
  const now = Date.now();

  let extraField = '';
  if (status === 'completed') {
    extraField = ', completed_at = ?';
  } else if (status === 'avoided') {
    extraField = ', avoided_at = ?';
  }

  const stmt = db.prepare(`
    UPDATE daily_actions
    SET status = ?${extraField}
    WHERE id = ?
  `);

  if (extraField) {
    stmt.run(status, now, actionId);
  } else {
    stmt.run(status, actionId);
  }

  return getActionById(actionId);
}

export function incrementRewriteCount(actionId: string): void {
  const db = getDb();

  const stmt = db.prepare(`
    UPDATE daily_actions
    SET rewrite_count = rewrite_count + 1
    WHERE id = ?
  `);

  stmt.run(actionId);
}

export function getAvoidedPatterns(coachId: string): {
  total_avoided: number;
  avg_difficulty_avoided: number;
  recent_avoided: DailyAction[];
} {
  const db = getDb();

  const statsStmt = db.prepare(`
    SELECT
      COUNT(*) as total_avoided,
      AVG(difficulty) as avg_difficulty_avoided
    FROM daily_actions
    WHERE coach_id = ? AND status = 'avoided'
  `);

  const recentStmt = db.prepare(`
    SELECT * FROM daily_actions
    WHERE coach_id = ? AND status = 'avoided'
    ORDER BY avoided_at DESC
    LIMIT 5
  `);

  const stats = statsStmt.get(coachId) as any;
  const recent = recentStmt.all(coachId) as DailyAction[];

  return {
    total_avoided: stats.total_avoided || 0,
    avg_difficulty_avoided: stats.avg_difficulty_avoided || 0,
    recent_avoided: recent,
  };
}

// ============================================
// INTERACTION OPERATIONS
// ============================================

export function logInteraction(
  coachId: string,
  type: InteractionType,
  actionId?: string,
  context?: string
): void {
  const db = getDb();
  const id = randomUUID();
  const now = Date.now();

  const stmt = db.prepare(`
    INSERT INTO agent_interactions (
      id, coach_id, action_id, interaction_type, context, created_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, coachId, actionId || null, type, context || null, now);
}

export function getRecentInteractions(
  coachId: string,
  limit: number = 20
): AgentInteraction[] {
  const db = getDb();

  const stmt = db.prepare(`
    SELECT * FROM agent_interactions
    WHERE coach_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `);

  return stmt.all(coachId, limit) as AgentInteraction[];
}

// ============================================
// CLEANUP
// ============================================

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
